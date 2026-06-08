/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/leaderboard?period=all_time|monthly|weekly&limit=50
// Org-scoped — no cross-org data ever returned.
// Two-step query pattern: no implicit FK join (avoids PGRST204 / User1..N fallback).

const PERIOD_MS: Record<string, number> = {
  weekly:  7  * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

async function batchLookupUsers(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[]
): Promise<Record<string, { display_name: string | null; email: string | null }>> {
  if (userIds.length === 0) return {};
  const { data } = await (supabase as any)
    .from("users")
    .select("id, display_name, email")
    .in("id", userIds) as {
      data: { id: string; display_name: string | null; email: string | null }[] | null;
    };
  const map: Record<string, { display_name: string | null; email: string | null }> = {};
  for (const u of data ?? []) map[u.id] = u;
  return map;
}

function resolvedName(
  userId: string,
  userMap: Record<string, { display_name: string | null; email: string | null }>
): string {
  const u = userMap[userId];
  if (!u) return "Member";
  return u.display_name ?? u.email?.split("@")[0] ?? "Member";
}

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  if (!auth.orgId) {
    return NextResponse.json({
      data: [],
      meta: { org_id: "", period: "all_time", my_rank: null, total_participants: 0 },
    });
  }

  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "all_time";
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
  const limit = Math.min(100, Number.isNaN(parsedLimit) ? 50 : parsedLimit);

  const supabase = createAdminClient();

  // ── Period rankings (weekly / monthly) ─────────────────────────────────────
  // Aggregate tokens earned from verified actions within the time window.
  // Members with 0 activity in the period are not shown (correct behaviour).
  if (period !== "all_time" && PERIOD_MS[period]) {
    const since = new Date(Date.now() - PERIOD_MS[period]).toISOString();

    const { data: actions, error } = await (supabase as any)
      .from("actions")
      .select("user_id, tokens_awarded")
      .eq("org_id", auth.orgId)
      .eq("status", "verified")
      .gte("created_at", since) as {
        data: { user_id: string; tokens_awarded: number }[] | null;
        error: unknown;
      };

    if (error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: "Failed to fetch leaderboard." } },
        { status: 500 }
      );
    }

    // Aggregate per user
    const totals: Record<string, number> = {};
    for (const row of actions ?? []) {
      totals[row.user_id] = (totals[row.user_id] ?? 0) + (row.tokens_awarded ?? 0);
    }

    const sorted = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    // Fetch total participants count (org member count for context)
    const { count: totalCount } = await (supabase as any)
      .from("token_balances")
      .select("id", { count: "exact", head: true })
      .eq("org_id", auth.orgId) as { count: number | null };

    if (sorted.length === 0) {
      // No activity in this period — return empty with participant count for context
      return NextResponse.json({
        data: [],
        meta: {
          org_id:             auth.orgId,
          period,
          my_rank:            null,
          total_participants: totalCount ?? 0,
        },
      });
    }

    const userIds = sorted.map(([id]) => id);
    const userMap = await batchLookupUsers(supabase, userIds);

    const rankings = sorted.map(([userId, tokens], i) => ({
      rank:        i + 1,
      userId,
      displayName: resolvedName(userId, userMap),
      totalEarned: tokens,
      balance:     tokens,
      isMe:        userId === auth.userId,
    }));

    const myRank = rankings.findIndex((r) => r.userId === auth.userId) + 1;

    return NextResponse.json({
      data: rankings,
      meta: {
        org_id:             auth.orgId,
        period,
        my_rank:            myRank || null,
        total_participants: totalCount ?? rankings.length,
      },
    });
  }

  // ── All-time ranking from token_balances ────────────────────────────────────
  // Step 1: fetch ALL org members (no total_earned filter — include 0-earned members).
  // Primary sort: total_earned DESC. Secondary: balance DESC (tiebreak). Tertiary: created_at ASC.
  const { data: balances, error: balErr } = await (supabase as any)
    .from("token_balances")
    .select("user_id, balance, total_earned")
    .eq("org_id", auth.orgId)
    .order("total_earned", { ascending: false })
    .order("balance",      { ascending: false })
    .limit(limit) as {
      data:  { user_id: string; balance: number; total_earned: number }[] | null;
      error: unknown;
    };

  if (balErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch leaderboard." } },
      { status: 500 }
    );
  }

  const list = balances ?? [];

  // Step 2: batch-lookup real names
  const userIds = [...new Set(list.map((r) => r.user_id))];
  const userMap = await batchLookupUsers(supabase, userIds);

  const rankings = list.map((row, i) => ({
    rank:        i + 1,
    userId:      row.user_id,
    displayName: resolvedName(row.user_id, userMap),
    balance:     row.balance,
    totalEarned: row.total_earned,
    isMe:        row.user_id === auth.userId,
  }));

  // Total org participants (for stat card — counts all rows not just top-N)
  const { count: totalCount } = await (supabase as any)
    .from("token_balances")
    .select("id", { count: "exact", head: true })
    .eq("org_id", auth.orgId) as { count: number | null };

  const myRank = rankings.findIndex((r) => r.userId === auth.userId) + 1;

  return NextResponse.json({
    data: rankings,
    meta: {
      org_id:             auth.orgId,
      period,
      my_rank:            myRank || null,
      total_participants: totalCount ?? rankings.length,
    },
  });
}
