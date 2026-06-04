import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/orgs/[id]/members — paginated member list
// Rule R-API-01: org_id scoped

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;
  if (id !== auth!.orgId && auth!.role !== "superadmin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Access denied." } },
      { status: 403 }
    );
  }

  const { searchParams } = req.nextUrl;
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
  const page   = Math.max(1,  parseInt(searchParams.get("page")  ?? "1",  10));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();
  const { data, count, error } = await (supabase as any)
    .from("org_members")
    .select("id, user_id, role, joined_at, users(display_name, email)", { count: "exact" })
    .eq("org_id", id)
    .order("joined_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch members." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, per_page: limit, total: count ?? 0 },
    meta: { org_id: auth!.orgId },
  });
}
