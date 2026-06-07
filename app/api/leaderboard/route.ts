import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/leaderboard?period=all_time|monthly|weekly&limit=50
// Org-scoped — no cross-org data ever returned.
// Uses two-step query pattern: no implicit FK join (avoids PGRST204 fallback to User1..N).

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

    // Aggregate tokens earned in the window per user
    const totals: Record<string, number> = {};
    for (const row of actions ?? []) {
      totals[row.user_id] = (totals[row.user_id] ?? 0) + (row.tokens_awarded ?? 0);
    }

    const sorted = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

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
        total_participants: rankings.length,
      },
    });
  }

  // ── All-time ranking from token_balances ────────────────────────────────────
  // Step 1: fetch balances (no implicit join — avoids PGRST204 fallback)
  const { data: balances, count, error: balErr } = await (supabase as any)
    .from("token_balances")
    .select("user_id, balance, total_earned", { count: "exact" })
    .eq("org_id", auth.orgId)
    .gt("total_earned", 0)           // only members who've actually earned tokens
    .order("total_earned", { ascending: false })
    .limit(limit) as {
      data:  { user_id: string; balance: number; total_earned: number }[] | null;
      count: number | null;
      error: unknown;
    };

  if (balErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch leaderboard." } },
      { status: 500 }
    );
  }

  const list = balances ?? [];

  // Step 2: batch-lookup user names
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

  // Total org participants (even those not yet on leaderboard)
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
