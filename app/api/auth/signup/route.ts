/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

// POST /api/auth/signup
// Rule R-API-03: Zod validation before any processing
// Rule R-API-04: 201 Created on success

const signupSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2).max(100),
  inviteToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, signupSchema);
  if ("error" in parsed) return parsed.error;
  const { email, password, displayName, inviteToken } = parsed.data;

  const supabase = createAdminClient();

  // Rule R-API-03: Check for existing user
  const { data: existing } = await (supabase as any)
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: { code: "EMAIL_TAKEN", message: "An account with this email already exists." } },
      { status: 409 }
    );
  }

  // Create Supabase Auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { display_name: displayName },
    email_confirm: false,
  });

  if (authErr || !authData.user) {
    return NextResponse.json(
      { error: { code: "AUTH_ERROR", message: authErr?.message ?? "Failed to create account." } },
      { status: 500 }
    );
  }

  // If invite token, validate it and create membership
  if (inviteToken) {
    const { data: invite } = await (supabase as any)
      .from("invites")
      .select("id, org_id, role, uses_left, expires_at")
      .eq("token", inviteToken)
      .maybeSingle() as { data: { id: string; org_id: string; role: string; uses_left: number | null; expires_at: string } | null };

    if (invite && new Date(invite.expires_at) > new Date()) {
      // Create org membership
      await (supabase as any).from("org_members").insert({
        org_id:  invite.org_id,
        user_id: authData.user.id,
        role:    invite.role,
      });

      // Create user profile
      await (supabase as any).from("users").insert({
        id:           authData.user.id,
        org_id:       invite.org_id,
        email,
        display_name: displayName,
      });

      // Decrement uses_left if limited
      if (invite.uses_left !== null) {
        await (supabase as any).from("invites")
          .update({ uses_left: invite.uses_left - 1 })
          .eq("id", invite.id);
      }

      return NextResponse.json(
        { data: { userId: authData.user.id, orgId: invite.org_id, redirectTo: "/dashboard" } },
        { status: 201 }
      );
    }
  }

  // No invite — redirect to org setup
  return NextResponse.json(
    { data: { userId: authData.user.id, redirectTo: "/org/setup" } },
    { status: 201 }
  );
}
