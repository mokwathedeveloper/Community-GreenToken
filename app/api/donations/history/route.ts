import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/donations/history
// Spec: saas/saas_api_endpoints.md — Donations
// Returns the authenticated user's donation history.

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const page   = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit  = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 20));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  const { data, count, error } = await (supabase as any)
    .from("donation_records")
    .select("id, project_name, tokens_donated, tx_hash, donated_at", { count: "exact" })
    .eq("org_id",       auth.orgId)
    .eq("donor_user_id", auth.userId)
    .order("donated_at", { ascending: false })
    .range(offset, offset + limit - 1) as {
      data: Record<string, unknown>[] | null;
      count: number | null;
      error: unknown;
    };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch donation history." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
    meta: { org_id: auth.orgId },
  });
}
