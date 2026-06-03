import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/leaderboard/me
// Spec: saas/saas_api_endpoints.md — Leaderboard
// Returns the authenticated user's rank, tokens, and actions in the current org.
// Query: ?period=all_time|weekly|monthly

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const period = req.nextUrl.searchParams.get("period") ?? "all_time";
  const supabase = createAdminClient();

  const { data: myRank } = await (supabase as any)
    .from("leaderboard_rankings")
    .select("rank, total_tokens, total_actions, period, updated_at")
    .eq("org_id",  auth.orgId)
    .eq("user_id", auth.userId)
    .eq("period",  period)
    .maybeSingle() as { data: Record<string, unknown> | null };

  // If not in the rankings table yet, fall back to computing from token_balances
  if (!myRank) {
    const { data: balance } = await (supabase as any)
      .from("token_balances")
      .select("balance, total_earned")
      .eq("org_id",  auth.orgId)
      .eq("user_id", auth.userId)
      .maybeSingle() as { data: { balance: number; total_earned: number } | null };

    const { count: totalOrgMembers } = await (supabase as any)
      .from("token_balances")
      .select("id", { count: "exact", head: true })
      .eq("org_id", auth.orgId) as { count: number | null };

    return NextResponse.json({
      data: {
        user_id:      auth.userId,
        org_id:       auth.orgId,
        period,
        rank:         null,
        total_tokens: balance?.total_earned ?? 0,
        balance:      balance?.balance ?? 0,
        total_org_members: totalOrgMembers ?? 0,
        note: "Rankings are computed periodically. Check back soon.",
      },
      meta: { org_id: auth.orgId },
    });
  }

  // Count total members in leaderboard for rank context
  const { count: totalRanked } = await (supabase as any)
    .from("leaderboard_rankings")
    .select("id", { count: "exact", head: true })
    .eq("org_id", auth.orgId)
    .eq("period",  period) as { count: number | null };

  return NextResponse.json({
    data: {
      user_id:          auth.userId,
      org_id:           auth.orgId,
      period,
      rank:             myRank.rank,
      total_tokens:     myRank.total_tokens,
      total_actions:    myRank.total_actions,
      total_ranked:     totalRanked ?? 0,
      updated_at:       myRank.updated_at,
    },
    meta: { org_id: auth.orgId },
  });
}
