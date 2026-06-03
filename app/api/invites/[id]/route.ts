import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// GET    /api/invites/[id]  — validate a single invite by token or UUID
// DELETE /api/invites/[id]  — admin revokes an invite
// Spec: saas/saas_api_endpoints.md — Member Management

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // id can be either the UUID or the token hex string
  const { data: invite } = await (supabase as any)
    .from("invites")
    .select("id, org_id, role, uses_left, expires_at, created_at, organizations(name, slug)")
    .or(`id.eq.${id},token.eq.${id}`)
    .maybeSingle() as { data: Record<string, unknown> | null };

  if (!invite) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Invite not found." } },
      { status: 404 }
    );
  }

  const isExpired = new Date(invite.expires_at as string) < new Date();
  const isExhausted = invite.uses_left !== null && (invite.uses_left as number) <= 0;

  return NextResponse.json({
    data: {
      ...invite,
      is_valid:   !isExpired && !isExhausted,
      is_expired: isExpired,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from("invites")
    .delete()
    .eq("id", id)
    .eq("org_id", auth!.orgId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to revoke invite." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { revoked: true, id }, meta: { org_id: auth!.orgId } });
}
