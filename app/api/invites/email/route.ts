import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/invites/email
 *
 * Admin invites a user by email.
 * Flow:
 *   1. Admin submits email + role
 *   2. We create an invite token in the invites table
 *   3. We send a Supabase magic link (OTP) to the email
 *      — The link includes ?inviteToken=xxx so on landing they auto-join the org
 *   4. User clicks the link → lands on /join/[token] → already logged in → added to org
 *
 * If the user already has an account, the magic link logs them in.
 * If they are new, Supabase creates their account on first click.
 */
export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  let email: string;
  let role: "admin" | "member";
  let expiresInDays: number;

  try {
    const body = await req.json();
    email        = (body.email ?? "").toLowerCase().trim();
    role         = body.role === "admin" ? "admin" : "member";
    expiresInDays = Number(body.expiresInDays ?? 7);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: { code: "INVALID_EMAIL", message: "A valid email address is required." } },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const supabase   = createAdminClient();
  const expiresAt  = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // ── 1. Create invite token in DB ──────────────────────────────────
  const { data: invite, error: inviteErr } = await (supabase as any)
    .from("invites")
    .insert({
      org_id:         auth!.orgId,
      created_by:     auth!.userId,
      role,
      uses_left:      1,           // single-use invite
      expires_at:     expiresAt,
      invited_email:  email,       // only this email may accept
    })
    .select("id, token, role, expires_at")
    .single();

  if (inviteErr || !invite) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Could not create invite token." } },
      { status: 500 }
    );
  }

  // ── 2. Build the join URL ─────────────────────────────────────────
  // redirectTo goes to /auth/callback which exchanges the PKCE code,
  // then ?next= sends the user to the actual invite join page.
  const joinUrl      = `${appUrl}/join/${invite.token}`;
  const callbackUrl  = `${appUrl}/auth/callback?next=/join/${invite.token}`;

  // ── 3. Send magic link via Supabase (acts as OTP / temp password) ─
  // This sends an email to the user. They click the link, get logged in,
  // and land on /join/[token] which adds them to the org automatically.
  const { error: emailErr } = await (supabase as any).auth.admin.inviteUserByEmail(email, {
    redirectTo: callbackUrl,
    data: {
      invited_to_org: auth!.orgId,
      invite_token:   invite.token,
      invite_role:    role,
    },
  });

  // If user already exists, inviteUserByEmail may fail — fall back to OTP
  if (emailErr) {
    const { error: otpErr } = await (supabase as any).auth.admin.generateLink({
      type:       "magiclink",
      email,
      options: { redirectTo: callbackUrl },
    });

    if (otpErr) {
      // Clean up the invite token we just created
      await (supabase as any).from("invites").delete().eq("id", invite.id);
      return NextResponse.json(
        { error: { code: "EMAIL_FAILED", message: "Could not send invitation email. Check the email address and try again." } },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      data: {
        inviteToken: invite.token,
        joinUrl,
        email,
        role,
        expiresAt: invite.expires_at,
        message: `Invitation sent to ${email}. They will receive a one-time login link valid for ${expiresInDays} days.`,
      },
    },
    { status: 201 }
  );
}


/**
 * GET /api/invites/email?orgId=xxx
 * Returns all pending invites for the current org (for the admin table)
 */
export async function GET(_req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const supabase = createAdminClient();

  const { data: invites } = await (supabase as any)
    .from("invites")
    .select("id, token, role, uses_left, expires_at, created_at")
    .eq("org_id", auth!.orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ data: invites ?? [] });
}


/**
 * DELETE /api/invites/email?token=xxx
 * Admin revokes/deletes a pending invite
 */
export async function DELETE(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: { code: "MISSING_TOKEN", message: "Token is required." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  await (supabase as any)
    .from("invites")
    .delete()
    .eq("token", token)
    .eq("org_id", auth!.orgId);

  return NextResponse.json({ data: { revoked: true } });
}
