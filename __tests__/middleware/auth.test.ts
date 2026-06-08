/** @jest-environment node */

// Mock before any imports so jest.mock hoisting applies correctly
jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(),
  createAdminClient: jest.fn(),
}));

import { getAuthContext, unauthorized, forbidden } from "@/lib/middleware/auth";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

const mockServerClient = createServerSupabaseClient as jest.Mock;
const mockAdminClient  = createAdminClient  as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildServerClient(
  session: object | null,
  error: object | null = null
) {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session }, error }),
    },
  };
}

function buildAdminClient(memberRow: { org_id: string; role: string } | null) {
  return {
    from: jest.fn().mockReturnValue({
      select:      jest.fn().mockReturnThis(),
      eq:          jest.fn().mockReturnThis(),
      order:       jest.fn().mockReturnThis(),
      limit:       jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: memberRow }),
    }),
  };
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-uuid-1",
    email: "user@example.com",
    app_metadata: {},
    ...overrides,
  };
}

// ── getAuthContext ────────────────────────────────────────────────────────────

describe("getAuthContext()", () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockAdminClient.mockReset();
  });

  it("returns null when session is null", async () => {
    mockServerClient.mockResolvedValue(buildServerClient(null));
    expect(await getAuthContext()).toBeNull();
  });

  it("returns null when getSession returns an error", async () => {
    mockServerClient.mockResolvedValue(
      buildServerClient(null, { message: "network error" })
    );
    expect(await getAuthContext()).toBeNull();
  });

  it("returns null when createServerSupabaseClient throws", async () => {
    mockServerClient.mockRejectedValue(new Error("Supabase init failed"));
    expect(await getAuthContext()).toBeNull();
  });

  it("returns superadmin context for superadmin app_metadata", async () => {
    const user = makeUser({ app_metadata: { role: "superadmin" } });
    mockServerClient.mockResolvedValue(buildServerClient({ user }));

    const ctx = await getAuthContext();
    expect(ctx).toEqual({
      userId: user.id,
      orgId:  "",
      role:   "superadmin",
      email:  user.email,
    });
  });

  it("does NOT call adminClient for superadmin users", async () => {
    const user = makeUser({ app_metadata: { role: "superadmin" } });
    mockServerClient.mockResolvedValue(buildServerClient({ user }));

    await getAuthContext();
    expect(mockAdminClient).not.toHaveBeenCalled();
  });

  it("returns org context for a member with an org row", async () => {
    const user = makeUser();
    mockServerClient.mockResolvedValue(buildServerClient({ user }));
    mockAdminClient.mockReturnValue(
      buildAdminClient({ org_id: "org-abc", role: "member" })
    );

    const ctx = await getAuthContext();
    expect(ctx).toEqual({
      userId: user.id,
      orgId:  "org-abc",
      role:   "member",
      email:  user.email,
    });
  });

  it("returns owner role when org row has role 'owner'", async () => {
    const user = makeUser();
    mockServerClient.mockResolvedValue(buildServerClient({ user }));
    mockAdminClient.mockReturnValue(
      buildAdminClient({ org_id: "org-abc", role: "owner" })
    );

    const ctx = await getAuthContext();
    expect(ctx?.role).toBe("owner");
  });

  it("returns empty orgId and member role when no org row exists", async () => {
    const user = makeUser();
    mockServerClient.mockResolvedValue(buildServerClient({ user }));
    mockAdminClient.mockReturnValue(buildAdminClient(null));

    const ctx = await getAuthContext();
    expect(ctx).toEqual({
      userId: user.id,
      orgId:  "",
      role:   "member",
      email:  user.email,
    });
  });

  it("returns null email when user.email is undefined", async () => {
    const user = makeUser({ email: undefined });
    mockServerClient.mockResolvedValue(buildServerClient({ user }));
    mockAdminClient.mockReturnValue(buildAdminClient(null));

    const ctx = await getAuthContext();
    expect(ctx?.email).toBeNull();
  });
});

// ── unauthorized() ────────────────────────────────────────────────────────────

describe("unauthorized()", () => {
  it("returns 401 with UNAUTHORIZED code and default message", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toContain("Authentication");
  });

  it("accepts a custom message", async () => {
    const res = unauthorized("Token expired");
    const body = await res.json();
    expect(body.error.message).toBe("Token expired");
  });
});

// ── forbidden() ───────────────────────────────────────────────────────────────

describe("forbidden()", () => {
  it("returns 403 with FORBIDDEN code and default message", async () => {
    const res = forbidden();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
    expect(body.error.message).toContain("permissions");
  });

  it("accepts a custom message", async () => {
    const res = forbidden("Admin only");
    const body = await res.json();
    expect(body.error.message).toBe("Admin only");
  });
});
