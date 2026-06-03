import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { checkPlanAccess } from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/analytics/tokens
// Spec: saas/saas_api_endpoints.md — Analytics (Starter+ plan)
// Returns token distribution, velocity, top earners for the org.

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const planGuard = await checkPlanAccess(auth, "analytics");
  if (planGuard) return planGuard;

  const supabase = createAdminClient();

  // All token balances in org
  const { data: balances } = await (supabase as any)
    .from("token_balances")
    .select("user_id, balance, total_earned, total_spent, updated_at")
    .eq("org_id", auth.orgId)
    .order("total_earned", { ascending: false }) as {
      data: { user_id: string; balance: number; total_earned: number; total_spent: number; updated_at: string }[] | null;
    };

  const rows = balances ?? [];
  const totalMinted    = rows.reduce((s, r) => s + r.total_earned, 0);
  const totalSpent     = rows.reduce((s, r) => s + r.total_spent, 0);
  const totalCirculation = rows.reduce((s, r) => s + r.balance, 0);
  const holdersCount   = rows.filter((r) => r.balance > 0).length;

  // Redemption total
  const { data: redemptions } = await (supabase as any)
    .from("redemption_logs")
    .select("tokens_spent, created_at")
    .eq("org_id", auth.orgId) as { data: { tokens_spent: number; created_at: string }[] | null };

  const totalRedeemed = (redemptions ?? []).reduce((s, r) => s + r.tokens_spent, 0);

  // Donation total
  const { data: donations } = await (supabase as any)
    .from("donation_records")
    .select("tokens_donated")
    .eq("org_id", auth.orgId) as { data: { tokens_donated: number }[] | null };

  const totalDonated = (donations ?? []).reduce((s, r) => s + r.tokens_donated, 0);

  // Top 5 earners (without exposing user emails)
  const topEarners = rows.slice(0, 5).map((r, i) => ({
    rank:         i + 1,
    user_id:      r.user_id,
    total_earned: r.total_earned,
    balance:      r.balance,
  }));

  return NextResponse.json({
    data: {
      total_minted:      totalMinted,
      total_in_circulation: totalCirculation,
      total_spent:       totalSpent,
      total_redeemed:    totalRedeemed,
      total_donated:     totalDonated,
      holders_count:     holdersCount,
      top_earners:       topEarners,
    },
    meta: { org_id: auth.orgId },
  });
}
