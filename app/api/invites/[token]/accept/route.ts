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

  const { token } = await params;
  const supabase   = createAdminClient();

  // Fetch invite — try with invited_email first (requires migration 024).
  // If the column doesn't exist, PostgREST returns an error and data=null;
  // fall back to a query without it so the flow works before migration runs.
  type InviteRow = {
    id: string; org_id: string; role: string;
    uses_left: number | null; expires_at: string;
    invited_email: string | null;
  };

  let invite: InviteRow | null = null;

  const { data: withEmail, error: errWithEmail } = await (supabase as any)
    .from("invites")
    .select("id, org_id, role, uses_left, expires_at, invited_email")
    .eq("token", token)
    .maybeSingle() as { data: InviteRow | null; error: { code?: string; message?: string } | null };

  if (errWithEmail) {
    console.warn("[accept] invited_email query failed, retrying without it:", JSON.stringify(errWithEmail));
    const { data: withoutEmail } = await (supabase as any)
      .from("invites")
      .select("id, org_id, role, uses_left, expires_at")
      .eq("token", token)
      .maybeSingle() as { data: Omit<InviteRow, "invited_email"> | null };

    invite = withoutEmail ? { ...withoutEmail, invited_email: null } : null;
  } else {
    invite = withEmail;
  }

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
            message: `This invite was sent to ${invite.invited_email}. Please use that email address to accept it.`,
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
  const { error: insertErr } = await (supabase as any).from("org_members").insert({
    org_id:  invite.org_id,
    user_id: auth.userId,
    role:    invite.role,
  });

  if (insertErr) {
    console.error("[accept] org_members insert failed:", JSON.stringify(insertErr));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Could not create membership. Please try again." } },
      { status: 500 }
    );
  }

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
