import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// GET    /api/invites/[token]  — validate a single invite by token or UUID
// DELETE /api/invites/[token]  — admin revokes an invite
// POST   /api/invites/[token]/accept — handled by accept/route.ts

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase   = createAdminClient();

  // id can be either the UUID or the token hex string
  const { data: invite } = await (supabase as any)
    .from("invites")
    .select("id, org_id, role, uses_left, expires_at, created_at, invited_email, organizations(name, slug)")
    .or(`id.eq.${token},token.eq.${token}`)
    .maybeSingle() as { data: Record<string, unknown> | null };

  if (!invite) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Invite not found." } },
      { status: 404 }
    );
  }

  const isExpired   = new Date(invite.expires_at as string) < new Date();
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
  { params }: { params: Promise<{ token: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { token } = await params;
  const supabase   = createAdminClient();

  const { error } = await (supabase as any)
    .from("invites")
    .delete()
    .or(`id.eq.${token},token.eq.${token}`)
    .eq("org_id", auth!.orgId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to revoke invite." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { revoked: true }, meta: { org_id: auth!.orgId } });
}
