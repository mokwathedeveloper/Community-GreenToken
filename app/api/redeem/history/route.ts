import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/redeem/history
// Returns the authenticated user's redemption log.
// Two-step query: redemption_logs has no FK to public.rewards/public.users,
// so PostgREST implicit joins don't work. Fetch logs then look up reward titles.

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const page   = Math.max(1, Number(req.nextUrl.searchParams.get("page")  ?? 1));
  const limit  = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 20));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  // Step 1: fetch redemption logs
  const { data: logs, count, error } = await (supabase as any)
    .from("redemption_logs")
    .select("id, reward_id, tokens_spent, tx_hash, status, created_at", { count: "exact" })
    .eq("org_id",  auth.orgId)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1) as {
      data: { id: string; reward_id: string | null; tokens_spent: number; tx_hash: string | null; status: string; created_at: string }[] | null;
      count: number | null;
      error: unknown;
    };

  if (error) {
    console.error("[api/redeem/history] DB error:", JSON.stringify(error));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch redemption history." } },
      { status: 500 }
    );
  }

  const rows = logs ?? [];

  // Step 2: look up reward titles for any reward_ids present
  const rewardIds = [...new Set(rows.map(r => r.reward_id).filter(Boolean))] as string[];
  let rewardMap: Record<string, string> = {};

  if (rewardIds.length > 0) {
    const { data: rewardRows } = await (supabase as any)
      .from("rewards")
      .select("id, title")
      .in("id", rewardIds) as { data: { id: string; title: string }[] | null };

    for (const r of rewardRows ?? []) {
      rewardMap[r.id] = r.title;
    }
  }

  // Merge: attach rewards: { title } to each log row (same shape the UI expects)
  const data = rows.map(log => ({
    ...log,
    rewards: log.reward_id ? { title: rewardMap[log.reward_id] ?? null, image_url: null } : null,
  }));

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0 },
    meta: { org_id: auth.orgId },
  });
}
