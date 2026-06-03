import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/redeem/history
// Spec: saas/saas_api_endpoints.md — Token Redemption
// Returns the authenticated user's redemption log.

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const page   = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit  = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 20));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  const { data, count, error } = await (supabase as any)
    .from("redemption_logs")
    .select("id, reward_id, tokens_spent, tx_hash, status, created_at, rewards(title, image_url)", { count: "exact" })
    .eq("org_id",  auth.orgId)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1) as {
      data: Record<string, unknown>[] | null;
      count: number | null;
      error: unknown;
    };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch redemption history." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
    meta: { org_id: auth.orgId },
  });
}
