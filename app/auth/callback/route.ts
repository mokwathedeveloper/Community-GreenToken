import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the Supabase PKCE auth code exchange for:
 *   - Email magic links (inviteUserByEmail, signInWithOtp)
 *   - Email confirmation links (signUp with emailRedirectTo)
 *   - OAuth providers (if added later)
 *
 * Supabase redirects here with ?code=xxx&next=/join/[token] after
 * the user clicks the email link. We exchange the code for a session,
 * then redirect to the `next` param (the invite join URL).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the invite join page (or dashboard as fallback)
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Code missing or exchange failed — redirect to sign-in with error hint
  return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed`);
}
