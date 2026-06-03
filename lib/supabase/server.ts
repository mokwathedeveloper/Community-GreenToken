import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase server client for API Route Handlers (Next.js 16 / Vercel).
 *
 * Handles ALL cookie formats used by @supabase/auth-helpers-nextjs:
 *   1. sb-{ref}-auth-token          — full session JSON (local dev)
 *   2. sb-{ref}-auth-token.0/.1/... — chunked (large tokens)
 *   3. sb-access-token + sb-refresh-token — separate cookies (some versions)
 *
 * Rule R-SEC-01: uses anon key + RLS, not service_role key.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken:   false,
        persistSession:     false,
        detectSessionInUrl: false,
      },
    }
  );

  const ref      = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace("https://", "")
    .split(".")[0];
  const baseName = `sb-${ref}-auth-token`;

  // ── Strategy 1: full JSON cookie ────────────────────────────────────
  let raw = cookieStore.get(baseName)?.value ?? "";

  // ── Strategy 2: chunked cookies (.0, .1, .2 …) ──────────────────────
  if (!raw) {
    let chunks = "";
    for (let i = 0; i < 10; i++) {
      const part = cookieStore.get(`${baseName}.${i}`)?.value;
      if (!part) break;
      chunks += part;
    }
    raw = chunks;
  }

  // ── Strategy 3: separate access + refresh token cookies ─────────────
  if (!raw) {
    const accessToken  = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;
    if (accessToken) {
      try {
        await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken ?? "",
        });
      } catch { /* not valid — continue */ }
      return supabase;
    }
  }

  // ── Parse the raw cookie value ───────────────────────────────────────
  if (raw) {
    try {
      const decoded = decodeURIComponent(raw);
      const session = JSON.parse(decoded);
      if (session?.access_token) {
        await supabase.auth.setSession({
          access_token:  session.access_token,
          refresh_token: session.refresh_token ?? "",
        });
      }
    } catch {
      // Malformed cookie — user is not authenticated, continue without session
    }
  }

  return supabase;
}

/**
 * Supabase admin client — bypasses RLS entirely.
 * Use ONLY for server-side admin operations.
 * Rule R-SEC-01: NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
