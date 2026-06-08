/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/redemptions?status=pending&limit=50&page=1
// Admin view of all org redemption requests with member and reward info.
// Two-step query: redemption_logs has no FK to public.rewards / public.users,
// so PostgREST implicit joins don't work. Fetch logs then look up separately.

export async function GET(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  // Step 1: fetch redemption logs
  let query = (supabase as any)
    .from("redemption_logs")
    .select("id, user_id, reward_id, tokens_spent, status, created_at", { count: "exact" })
    .eq("org_id", auth!.orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data: logs, count, error } = await query as {
    data: { id: string; user_id: string; reward_id: string | null; tokens_spent: number; status: string; created_at: string }[] | null;
    count: number | null;
    error: unknown;
  };

  if (error) {
    console.error("[api/admin/redemptions] DB error:", JSON.stringify(error));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch redemptions." } },
      { status: 500 }
    );
  }

  const rows = logs ?? [];

  // Step 2a: look up reward titles
  const rewardIds = [...new Set(rows.map(r => r.reward_id).filter(Boolean))] as string[];
  const rewardMap: Record<string, { title: string; token_cost: number }> = {};
  if (rewardIds.length > 0) {
    const { data: rewardRows } = await (supabase as any)
      .from("rewards")
      .select("id, title, token_cost")
      .in("id", rewardIds) as { data: { id: string; title: string; token_cost: number }[] | null };
    for (const r of rewardRows ?? []) rewardMap[r.id] = { title: r.title, token_cost: r.token_cost };
  }

  // Step 2b: look up member names + emails from public.users
  const userIds = [...new Set(rows.map(r => r.user_id))];
  const userMap: Record<string, { display_name: string | null; email: string | null }> = {};
  if (userIds.length > 0) {
    const { data: userRows } = await (supabase as any)
      .from("users")
      .select("id, display_name, email")
      .in("id", userIds) as { data: { id: string; display_name: string | null; email: string | null }[] | null };
    for (const u of userRows ?? []) userMap[u.id] = { display_name: u.display_name, email: u.email };
  }

  // Merge
  const data = rows.map(log => ({
    ...log,
    rewards: log.reward_id ? (rewardMap[log.reward_id] ?? null) : null,
    users:   userMap[log.user_id] ?? null,
  }));

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0 },
    meta: { org_id: auth!.orgId },
  });
}
