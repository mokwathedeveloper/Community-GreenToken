/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireSuperAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/admin/orgs/[id]  — super admin: get full org detail + usage
// Spec: saas/saas_api_endpoints.md — Super Admin

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const { id: orgId } = await params;
  const supabase = createAdminClient();

  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single() as { data: Record<string, unknown> | null };

  if (!org) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Organization not found." } },
      { status: 404 }
    );
  }

  // Enrich with member count
  const { count: memberCount } = await (supabase as any)
    .from("org_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId) as { count: number | null };

  // Action count
  const { count: actionCount } = await (supabase as any)
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId) as { count: number | null };

  // Token supply
  const { data: balances } = await (supabase as any)
    .from("token_balances")
    .select("total_earned")
    .eq("org_id", orgId) as { data: { total_earned: number }[] | null };

  const totalMinted = (balances ?? []).reduce((s, r) => s + r.total_earned, 0);

  return NextResponse.json({
    data: {
      ...org,
      member_count: memberCount ?? 0,
      action_count: actionCount ?? 0,
      tokens_minted: totalMinted,
    },
  });
}
