import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { checkPlanAccess } from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/analytics/members
// Spec: saas/saas_api_endpoints.md — Analytics (Starter+ plan)
// Returns member growth, activity rates, and role distribution.

export async function GET(_req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const planGuard = await checkPlanAccess(auth, "analytics");
  if (planGuard) return planGuard;

  const supabase = createAdminClient();

  // Single RPC — role grouping, 6-month growth, and active-member count all in Postgres (migration 021)
  const { data, error } = await (supabase as any)
    .rpc("get_member_analytics", { p_org_id: auth.orgId }) as {
      data: {
        total_members:     number;
        by_role:           Record<string, number>;
        monthly_growth:    { month: string; count: number }[];
        active_this_month: number;
        activity_rate_pct: number;
      } | null;
      error: unknown;
    };

  if (error || !data) {
    console.error("[api/analytics/members] rpc error", error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch member analytics." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    meta: { org_id: auth.orgId },
  });
}
