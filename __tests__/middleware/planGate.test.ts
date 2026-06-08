/** @jest-environment node */

jest.mock("@/lib/supabase/server", () => ({
  createAdminClient: jest.fn(),
}));

import {
  getOrgPlanLimits,
  checkPlanFeature,
  checkMemberLimit,
} from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

const mockAdminClient = createAdminClient as jest.Mock;

// Each test uses a unique orgId so the module-level plan cache is always cold.
let orgCounter = 0;
function uniqueOrgId() {
  return `org-plan-test-${++orgCounter}`;
}

// ── Mock helpers ──────────────────────────────────────────────────────────────

interface OrgRow {
  plan: string;
  subscription_status: string;
  member_limit: number | null;
}

interface PlanLimitsRow {
  plan: string;
  analytics: boolean;
  custom_token: boolean;
  white_label: boolean;
  api_access: boolean;
  member_limit: number | null;
  price_monthly: number | null;
}

function buildClient(orgRow: OrgRow | null, limitsRow: PlanLimitsRow | null, memberCount = 0) {
  mockAdminClient.mockReturnValue({
    from: jest.fn().mockImplementation((table: string) => {
      if (table === "organizations") {
        return {
          select:  jest.fn().mockReturnThis(),
          eq:      jest.fn().mockReturnThis(),
          single:  jest.fn().mockResolvedValue({ data: orgRow }),
        };
      }
      if (table === "plan_limits") {
        return {
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: limitsRow }),
        };
      }
      // org_members — count query
      return {
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockResolvedValue({ count: memberCount, data: null }),
      };
    }),
  });
}

const STARTER_ORG: OrgRow = {
  plan: "starter",
  subscription_status: "active",
  member_limit: 50,
};

const STARTER_LIMITS: PlanLimitsRow = {
  plan: "starter",
  analytics:    false,
  custom_token: false,
  white_label:  false,
  api_access:   false,
  member_limit: 50,
  price_monthly: 29,
};

const PRO_LIMITS: PlanLimitsRow = {
  plan: "pro",
  analytics:    true,
  custom_token: true,
  white_label:  true,
  api_access:   true,
  member_limit: 500,
  price_monthly: 99,
};

// ── getOrgPlanLimits ──────────────────────────────────────────────────────────

describe("getOrgPlanLimits()", () => {
  it("returns null immediately for empty orgId without calling DB", async () => {
    buildClient(null, null);
    const result = await getOrgPlanLimits("");
    expect(result).toBeNull();
    expect(mockAdminClient).not.toHaveBeenCalled();
  });

  it("returns null when org row does not exist", async () => {
    buildClient(null, null);
    expect(await getOrgPlanLimits(uniqueOrgId())).toBeNull();
  });

  it("returns null for canceled subscription", async () => {
    buildClient({ ...STARTER_ORG, subscription_status: "canceled" }, STARTER_LIMITS);
    expect(await getOrgPlanLimits(uniqueOrgId())).toBeNull();
  });

  it("returns limits for an active org", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS);
    const limits = await getOrgPlanLimits(uniqueOrgId());
    expect(limits).not.toBeNull();
    expect(limits?.plan).toBe("starter");
    expect(limits?.analytics).toBe(false);
  });

  it("returns null when plan_limits row does not exist", async () => {
    buildClient(STARTER_ORG, null);
    expect(await getOrgPlanLimits(uniqueOrgId())).toBeNull();
  });
});

// ── checkPlanFeature ──────────────────────────────────────────────────────────

describe("checkPlanFeature()", () => {
  it("returns 403 SUBSCRIPTION_INACTIVE when org has no limits (no org)", async () => {
    buildClient(null, null);
    const res = (await checkPlanFeature(uniqueOrgId(), "analytics"))!;
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("SUBSCRIPTION_INACTIVE");
  });

  it("returns 422 PLAN_LIMIT_EXCEEDED when analytics is false (Starter plan)", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS);
    const res = (await checkPlanFeature(uniqueOrgId(), "analytics"))!;
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("PLAN_LIMIT_EXCEEDED");
    expect(body.error.upgrade_url).toBe("/pricing");
    expect(body.error.current_plan).toBe("starter");
  });

  it("returns null when analytics is true (Pro plan)", async () => {
    buildClient({ ...STARTER_ORG, plan: "pro" }, PRO_LIMITS);
    expect(await checkPlanFeature(uniqueOrgId(), "analytics")).toBeNull();
  });

  it("returns 422 for customToken feature blocked on Starter", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS);
    const res = (await checkPlanFeature(uniqueOrgId(), "customToken"))!;
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("PLAN_LIMIT_EXCEEDED");
  });

  it("returns 422 for whiteLabel feature requiring Pro plan", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS);
    const res = (await checkPlanFeature(uniqueOrgId(), "whiteLabel"))!;
    const body = await res.json();
    expect(body.error.required_plan).toBe("Pro");
  });

  it("returns 422 for apiAccess feature blocked on Starter", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS);
    const res = (await checkPlanFeature(uniqueOrgId(), "apiAccess"))!;
    expect(res.status).toBe(422);
  });

  it("returns null for memberLimit feature (always allowed — checked separately)", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS);
    expect(await checkPlanFeature(uniqueOrgId(), "memberLimit")).toBeNull();
  });
});

// ── checkMemberLimit ──────────────────────────────────────────────────────────

describe("checkMemberLimit()", () => {
  it("returns null when org has no limits (no org row)", async () => {
    buildClient(null, null);
    expect(await checkMemberLimit(uniqueOrgId())).toBeNull();
  });

  it("returns null when plan has null member_limit (unlimited)", async () => {
    buildClient(
      { ...STARTER_ORG, member_limit: null },
      { ...STARTER_LIMITS, member_limit: null },
      999
    );
    expect(await checkMemberLimit(uniqueOrgId())).toBeNull();
  });

  it("returns null when count is below the limit", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS, 30);
    expect(await checkMemberLimit(uniqueOrgId())).toBeNull();
  });

  it("returns 422 MEMBER_LIMIT_REACHED when count equals limit", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS, 50); // 50 = limit
    const res = (await checkMemberLimit(uniqueOrgId()))!;
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("MEMBER_LIMIT_REACHED");
    expect(body.error.limit).toBe(50);
    expect(body.error.upgrade_url).toBe("/pricing");
  });

  it("returns 422 when count exceeds the limit", async () => {
    buildClient(STARTER_ORG, STARTER_LIMITS, 55);
    const res = (await checkMemberLimit(uniqueOrgId()))!;
    expect(res.status).toBe(422);
  });
});
