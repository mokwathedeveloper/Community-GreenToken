import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/redemptions?status=pending&limit=50&page=1
// Admin view of all org redemption requests with member info.

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

  let query = (supabase as any)
    .from("redemption_logs")
    .select(
      "id, user_id, tokens_spent, status, created_at, " +
      "rewards(title, description, token_cost), " +
      "users(display_name, email)",
      { count: "exact" }
    )
    .eq("org_id", auth!.orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query as {
    data: Record<string, unknown>[] | null;
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

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
    meta: { org_id: auth!.orgId },
  });
}
