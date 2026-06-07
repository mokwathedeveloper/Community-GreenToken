import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

const INVITE_WINDOW_HOURS = 48;
const MAX_INVITES_PER_EMAIL = 2;

export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  let email: string;
  let role: "admin" | "member";
  let expiresInDays: number;

  try {
    const body   = await req.json();
    email         = (body.email ?? "").toLowerCase().trim();
    role          = body.role === "admin" ? "admin" : "member";
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

  const supabase = createAdminClient();
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // ── 1. Already a member? ─────────────────────────────────────────────
  // getUserByEmail is O(1) and doesn't page.
  const { data: existingAuthUser } = await (supabase as any).auth.admin.getUserByEmail(email) as {
    data: { id: string } | null
  };
  if (existingAuthUser?.id) {
    const { data: member } = await (supabase as any)
      .from("org_members")
      .select("id")
      .eq("org_id", auth!.orgId)
      .eq("user_id", existingAuthUser.id)
      .maybeSingle() as { data: { id: string } | null };

    if (member) {
      return NextResponse.json(
        { error: { code: "ALREADY_MEMBER", message: `${email} is already a member of this organisation.` } },
        { status: 409 }
      );
    }
  }

  // ── 2. Active invite already exists for this email? ──────────────────
  // Requires migration 024 (invited_email column). If the column is absent the
  // Supabase query returns rows without it and we skip this check gracefully.
  const { data: existingInvites } = await (supabase as any)
    .from("invites")
    .select("id, invited_email, expires_at")
    .eq("org_id", auth!.orgId)
    .eq("invited_email", email)
    .gt("expires_at", new Date().toISOString()) as {
      data: { id: string; invited_email: string; expires_at: string }[] | null
    };

  if (existingInvites && existingInvites.length > 0) {
    const earliest = existingInvites.reduce((a, b) =>
      new Date(a.expires_at) < new Date(b.expires_at) ? a : b
    );
    const expiresOn = new Date(earliest.expires_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
    return NextResponse.json(
      {
        error: {
          code: "INVITE_EXISTS",
          message: `An active invite for ${email} already exists and expires on ${expiresOn}. Ask the member to check their inbox, or revoke the old invite first.`,
        },
      },
      { status: 409 }
    );
  }

  // ── 3. Rate limit: max 2 invites per email per 48-hour window ────────
  const windowStart = new Date(
    Date.now() - INVITE_WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data: recentInvites } = await (supabase as any)
    .from("invites")
    .select("id, invited_email, created_at")
    .eq("org_id", auth!.orgId)
    .eq("invited_email", email)
    .gte("created_at", windowStart) as {
      data: { id: string; invited_email: string; created_at: string }[] | null
    };

  if (recentInvites && recentInvites.length >= MAX_INVITES_PER_EMAIL) {
    const oldest = recentInvites.reduce((a, b) =>
      new Date(a.created_at) < new Date(b.created_at) ? a : b
    );
    const retryAfter = new Date(
      new Date(oldest.created_at).getTime() + INVITE_WINDOW_HOURS * 60 * 60 * 1000
    );
    const retryStr = retryAfter.toLocaleString("en-GB", {
      day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    });

    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: `${MAX_INVITES_PER_EMAIL} invites have already been sent to ${email} in the last ${INVITE_WINDOW_HOURS} hours. You can send another after ${retryStr}.`,
        },
      },
      { status: 429 }
    );
  }

  // ── 4. Create invite token ────────────────────────────────────────────
  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  ).toISOString();

  type InviteRow = { id: string; token: string; role: string; expires_at: string };
  let invite: InviteRow | null = null;

  // Try inserting with invited_email (requires migration 024).
  // If that column doesn't exist yet, fall back without it so the invite
  // still works (just without the per-email locking until migration runs).
  const { data: inviteWithEmail, error: errWithEmail } = await (supabase as any)
    .from("invites")
    .insert({
      org_id:        auth!.orgId,
      created_by:    auth!.userId,
      role,
      uses_left:     1,
      expires_at:    expiresAt,
      invited_email: email,
    })
    .select("id, token, role, expires_at")
    .single();

  if (errWithEmail) {
    // Log the real error so it appears in Vercel/server logs for diagnosis.
    console.error("[invites/email] insert error:", JSON.stringify(errWithEmail));

    // PostgREST returns PGRST204 when the column isn't in its schema cache yet.
    // Postgres itself would return 42703 for an unknown column.
    // Either way, if the error mentions invited_email we can retry without it.
    const errCode = String((errWithEmail as { code?: string }).code ?? "");
    const errMsg  = String((errWithEmail as { message?: string }).message ?? "").toLowerCase();
    const isMissingColumn =
      errCode === "42703" ||
      errCode === "PGRST204" ||
      errMsg.includes("invited_email") ||
      errMsg.includes("could not find the column");

    if (isMissingColumn) {
      const { data: fallback, error: errFallback } = await (supabase as any)
        .from("invites")
        .insert({
          org_id:     auth!.orgId,
          created_by: auth!.userId,
          role,
          uses_left:  1,
          expires_at: expiresAt,
        })
        .select("id, token, role, expires_at")
        .single();

      if (errFallback || !fallback) {
        console.error("[invites/email] fallback insert error:", JSON.stringify(errFallback));
        return NextResponse.json(
          { error: { code: "DB_ERROR", message: "Could not create invite token. Please try again." } },
          { status: 500 }
        );
      }
      invite = fallback as InviteRow;
    } else {
      console.error("[invites/email] non-recoverable insert error:", JSON.stringify(errWithEmail));
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: "Could not create invite token. Please try again." } },
        { status: 500 }
      );
    }
  } else {
    invite = inviteWithEmail as InviteRow;
  }

  if (!invite) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Could not create invite token." } },
      { status: 500 }
    );
  }

  // ── 5. Send magic link ────────────────────────────────────────────────
  // callbackUrl goes through /auth/callback which exchanges the PKCE code
  // for a session, then redirects the user straight to their join page.
  const callbackUrl = `${appUrl}/auth/callback?next=/join/${invite.token}`;
  const joinUrl     = `${appUrl}/join/${invite.token}`;

  const { error: emailErr } = await (supabase as any).auth.admin.inviteUserByEmail(email, {
    redirectTo: callbackUrl,
    data: {
      invited_to_org: auth!.orgId,
      invite_token:   invite.token,
      invite_role:    role,
    },
  });

  // inviteUserByEmail fails if the user already has an account —
  // fall back to a plain magic link in that case.
  if (emailErr) {
    const { error: otpErr } = await (supabase as any).auth.admin.generateLink({
      type:    "magiclink",
      email,
      options: { redirectTo: callbackUrl },
    });

    if (otpErr) {
      await (supabase as any).from("invites").delete().eq("id", invite.id);
      return NextResponse.json(
        {
          error: {
            code: "EMAIL_FAILED",
            message: "Could not send the invitation email. Check the address and try again.",
          },
        },
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

export async function GET(_req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data: invites } = await (supabase as any)
    .from("invites")
    .select("id, token, role, uses_left, expires_at, created_at, invited_email")
    .eq("org_id", auth!.orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ data: invites ?? [] });
}

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
