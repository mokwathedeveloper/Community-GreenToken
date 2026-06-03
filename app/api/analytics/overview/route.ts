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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  let actionsRes, balancesRes, donationsRes;
  try {
    [actionsRes, balancesRes, donationsRes] = await Promise.all([
      db.from("actions").select("status, tokens_awarded").eq("org_id", auth.orgId),
      db.from("token_balances").select("balance, total_earned").eq("org_id", auth.orgId),
      db.from("donation_records").select("tokens_donated").eq("org_id", auth.orgId),
    ]);
  } catch (err) {
    console.error("[api/analytics/overview] parallel query threw", err);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch analytics." } },
      { status: 500 }
    );
  }

  // Surface individual query errors
  if (actionsRes.error || balancesRes.error || donationsRes.error) {
    console.error("[api/analytics/overview] query errors",
      actionsRes.error, balancesRes.error, donationsRes.error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch analytics data." } },
      { status: 500 }
    );
  }

  const actions    = (actionsRes.data   ?? []) as { status: string; tokens_awarded: number }[];
  const balances   = (balancesRes.data  ?? []) as { balance: number; total_earned: number }[];
  const donations  = (donationsRes.data ?? []) as { tokens_donated: number }[];

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
