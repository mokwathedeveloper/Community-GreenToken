import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/invites/[token]/accept
// Rule R-SAAS-08: expired tokens MUST return 410 Gone, NOT 404

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { token } = await params; // Next.js 16: params is async
  const supabase  = createAdminClient();

  const { data: invite } = await (supabase as any)
    .from("invites")
    .select("id, org_id, role, uses_left, expires_at, invited_email")
    .eq("token", token)
    .maybeSingle() as {
      data: { id: string; org_id: string; role: string; uses_left: number | null; expires_at: string; invited_email: string | null } | null
    };

  if (!invite) {
    return NextResponse.json(
      { error: { code: "INVITE_NOT_FOUND", message: "Invite link not found." } },
      { status: 404 }
    );
  }

  // Rule R-SAAS-08: 410 Gone for expired tokens
  if (new Date(invite.expires_at) <= new Date()) {
    return NextResponse.json(
      { error: { code: "INVITE_EXPIRED", message: "This invite link has expired." } },
      { status: 410 }
    );
  }

  if (invite.uses_left !== null && invite.uses_left <= 0) {
    return NextResponse.json(
      { error: { code: "INVITE_EXHAUSTED", message: "This invite has reached its usage limit." } },
      { status: 410 }
    );
  }

  // Email-specific invite: verify the authenticated user's email matches
  if (invite.invited_email) {
    const { data: { user } } = await supabase.auth.admin.getUserById(auth.userId);
    const userEmail = user?.email?.toLowerCase().trim() ?? "";
    if (userEmail !== invite.invited_email.toLowerCase().trim()) {
      return NextResponse.json(
        {
          error: {
            code: "WRONG_EMAIL",
            message: `This invite was sent to ${invite.invited_email}. Please sign in with that email address to accept it.`,
          },
        },
        { status: 403 }
      );
    }
  }

  // Check if already a member
  const { data: existing } = await (supabase as any)
    .from("org_members")
    .select("id")
    .eq("org_id", invite.org_id)
    .eq("user_id", auth.userId)
    .maybeSingle() as { data: { id: string } | null };

  if (existing) {
    return NextResponse.json(
      { error: { code: "ALREADY_MEMBER", message: "You are already a member of this organization." } },
      { status: 409 }
    );
  }

  // Create membership
  await (supabase as any).from("org_members").insert({
    org_id:  invite.org_id,
    user_id: auth.userId,
    role:    invite.role,
  });

  // Decrement uses_left
  if (invite.uses_left !== null) {
    await (supabase as any).from("invites")
      .update({ uses_left: invite.uses_left - 1 })
      .eq("id", invite.id);
  }

  return NextResponse.json({
    data: { orgId: invite.org_id, role: invite.role },
    meta: { org_id: invite.org_id },
  });
}
