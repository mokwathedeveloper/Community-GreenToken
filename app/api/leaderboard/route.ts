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

  // NaN-safe limit
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Math.min(100, Number.isNaN(parsedLimit) ? 10 : parsedLimit);

  const supabase = createAdminClient();

  // Period-based cutoff: filter actions by created_at to compute period rankings
  const periodCutoff: Record<string, number> = {
    weekly:  7  * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  };

  let query;
  if (period !== "all_time" && periodCutoff[period]) {
    // For period rankings: aggregate tokens earned from actions in the time window
    const since = new Date(Date.now() - periodCutoff[period]).toISOString();
    const { data, error } = await (supabase as any)
      .from("actions")
      .select("user_id, tokens_awarded")
      .eq("org_id", auth.orgId)
      .eq("status", "verified")
      .gte("created_at", since);

    if (error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: "Failed to fetch leaderboard." } },
        { status: 500 }
      );
    }

    // Aggregate tokens per user for the period
    const totals: Record<string, number> = {};
    for (const row of (data ?? []) as { user_id: string; tokens_awarded: number }[]) {
      totals[row.user_id] = (totals[row.user_id] ?? 0) + row.tokens_awarded;
    }

    const rankings = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId, tokens], i) => ({
        rank: i + 1, userId, balance: tokens, totalEarned: tokens,
      }));

    const myRank = rankings.findIndex((r) => r.userId === auth.userId) + 1;
    return NextResponse.json({
      data: rankings,
      meta: { org_id: auth.orgId, period, my_rank: myRank || null },
    });
  }

  // all_time: use cumulative token_balances
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
