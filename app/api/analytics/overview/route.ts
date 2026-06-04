import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { checkPlanFeature } from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/analytics/overview
// Rule: Starter+ plan only — Rule R-API-05 + planGate

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  // Plan gate — analytics requires Starter+
  const blocked = await checkPlanFeature(auth.orgId, "analytics");
  if (blocked) return blocked;

  const supabase = createAdminClient();

  // Single RPC call — all aggregation happens in Postgres (migration 021)
  const { data, error } = await (supabase as any)
    .rpc("get_analytics_overview", { p_org_id: auth.orgId }) as {
      data: {
        total_actions: number;
        verified_actions: number;
        pending_actions: number;
        tokens_minted: number;
        active_members: number;
        tokens_donated: number;
      } | null;
      error: unknown;
    };

  if (error || !data) {
    console.error("[api/analytics/overview] rpc error", error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch analytics." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      totalActions:    data.total_actions,
      verifiedActions: data.verified_actions,
      pendingActions:  data.pending_actions,
      tokensMinted:    data.tokens_minted,
      activeMembers:   data.active_members,
      tokensDonated:   data.tokens_donated,
    },
    meta: { org_id: auth.orgId },
  });
}
