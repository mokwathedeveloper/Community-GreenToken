import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/actions?status=pending&limit=20&page=1
// Rule R-API-01: org_id scoped — never returns cross-org data

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();
  let query = supabase
    .from("actions")
    .select("id, type, description, status, tokens_awarded, created_at, user_id", { count: "exact" })
    .eq("org_id", auth.orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch actions." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    pagination: { page, per_page: limit, total: count ?? 0 },
    meta: { org_id: auth.orgId },
  });
}
