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

  // Parallel queries for overview stats
  const [actionsRes, balancesRes, donationsRes] = await Promise.all([
    supabase
      .from("actions")
      .select("status, tokens_awarded", { count: "exact" })
      .eq("org_id", auth.orgId),
    supabase
      .from("token_balances")
      .select("balance, total_earned")
      .eq("org_id", auth.orgId),
    supabase
      .from("donation_records")
      .select("tokens_donated")
      .eq("org_id", auth.orgId),
  ]);

  const actions    = actionsRes.data   ?? [];
  const balances   = balancesRes.data  ?? [];
  const donations  = donationsRes.data ?? [];

  const totalActions  = actions.length;
  const verifiedCount = actions.filter((a) => a.status === "verified").length;
  const pendingCount  = actions.filter((a) => a.status === "pending").length;
  const tokensMinted  = balances.reduce((s, b) => s + b.total_earned, 0);
  const activeMembers = balances.filter((b) => b.balance > 0).length;
  const tokensDonated = donations.reduce((s, d) => s + d.tokens_donated, 0);

  return NextResponse.json({
    data: {
      totalActions,
      verifiedActions: verifiedCount,
      pendingActions:  pendingCount,
      tokensMinted,
      activeMembers,
      tokensDonated,
    },
    meta: { org_id: auth.orgId },
  });
}
