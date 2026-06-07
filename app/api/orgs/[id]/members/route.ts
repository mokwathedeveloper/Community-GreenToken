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

  // Fetch org_members (without embedded user join — org_members.user_id FKs to
  // auth.users, not public.users, so PostgREST cannot resolve the relation).
  const { data: members, count, error } = await (supabase as any)
    .from("org_members")
    .select("id, user_id, role, joined_at", { count: "exact" })
    .eq("org_id", id)
    .order("joined_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch members." } },
      { status: 500 }
    );
  }

  // Enrich with display_name + email from public.users (separate query)
  const userIds: string[] = (members ?? []).map((m: { user_id: string }) => m.user_id);
  let profileMap: Record<string, { display_name: string | null; email: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await (supabase as any)
      .from("users")
      .select("id, display_name, email")
      .in("id", userIds) as { data: { id: string; display_name: string | null; email: string | null }[] | null };

    (profiles ?? []).forEach((p) => { profileMap[p.id] = { display_name: p.display_name, email: p.email }; });
  }

  const data = (members ?? []).map((m: { id: string; user_id: string; role: string; joined_at: string }) => ({
    ...m,
    users: profileMap[m.user_id] ?? { display_name: null, email: null },
  }));

  return NextResponse.json({
    data,
    pagination: { page, per_page: limit, total: count ?? 0 },
    meta: { org_id: auth!.orgId },
  });
}
