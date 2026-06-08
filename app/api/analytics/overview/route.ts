/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { checkPlanFeature } from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/analytics/overview
// Rule: Starter+ plan only — Rule R-API-05 + planGate

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  if (!auth.orgId) {
    return NextResponse.json(
      { error: { code: "NO_ORGANIZATION", message: "Complete org setup first." } },
      { status: 422 }
    );
  }

  // Plan gate — analytics requires Starter+
  const blocked = await checkPlanFeature(auth.orgId, "analytics");
  if (blocked) return blocked;

  const supabase = createAdminClient();

  // Try the optimised RPC first (migration 021). Fall back to manual counts
  // if the function doesn't exist yet (migrations not fully applied).
  let overview = {
    total_actions: 0, verified_actions: 0, pending_actions: 0,
    tokens_minted: 0, active_members: 0, tokens_donated: 0,
  };

  const { data: rpcData, error: rpcErr } = await (supabase as any)
    .rpc("get_analytics_overview", { p_org_id: auth.orgId }) as {
      data: typeof overview | null;
      error: { code?: string; message?: string } | null;
    };

  if (!rpcErr && rpcData) {
    overview = rpcData;
  } else {
    // RPC missing (migration 021 not yet applied) — compute manually
    const [actionsRes, balancesRes] = await Promise.all([
      (supabase as any).from("actions").select("status", { count: "exact", head: false }).eq("org_id", auth.orgId),
      (supabase as any).from("token_balances").select("total_earned, balance").eq("org_id", auth.orgId),
    ]);

    const actions: { status: string }[] = actionsRes.data ?? [];
    overview.total_actions    = actions.length;
    overview.verified_actions = actions.filter((a) => a.status === "verified").length;
    overview.pending_actions  = actions.filter((a) => a.status === "pending").length;

    const balances: { total_earned: number; balance: number }[] = balancesRes.data ?? [];
    overview.tokens_minted  = balances.reduce((s, b) => s + (b.total_earned ?? 0), 0);
    overview.active_members = balances.filter((b) => b.balance > 0).length;
  }

  return NextResponse.json({
    data: {
      totalActions:    overview.total_actions,
      verifiedActions: overview.verified_actions,
      pendingActions:  overview.pending_actions,
      tokensMinted:    overview.tokens_minted,
      activeMembers:   overview.active_members,
      tokensDonated:   overview.tokens_donated,
    },
    meta: { org_id: auth.orgId },
  });
}
