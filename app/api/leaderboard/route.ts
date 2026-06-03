import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/leaderboard?period=all_time&limit=10
// Rule R-API-01: org_id scoped — never cross-org rankings

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "all_time";
  const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"));

  const supabase = createAdminClient();

  // Compute rankings from token_balances (live, no cache needed for MVP)
  const { data, error } = await (supabase as any)
    .from("token_balances")
    .select("user_id, balance, total_earned")
    .eq("org_id", auth.orgId)
    .order("balance", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch leaderboard." } },
      { status: 500 }
    );
  }

  type LeaderRow = { user_id: string; balance: number; total_earned: number };
  const rankings = ((data ?? []) as LeaderRow[]).map((row, index) => ({
    rank:        index + 1,
    userId:      row.user_id,
    balance:     row.balance,
    totalEarned: row.total_earned,
  }));

  // Find current user's rank
  const myRank = rankings.findIndex((r) => r.userId === auth.userId) + 1;

  return NextResponse.json({
    data: rankings,
    meta: { org_id: auth.orgId, period, my_rank: myRank || null },
  });
}
