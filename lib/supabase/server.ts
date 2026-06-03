import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase server client for API Route Handlers (Next.js 16).
 *
 * Why not createRouteHandlerClient?
 * @supabase/auth-helpers-nextjs v0.10.0 was built for Next.js 13/14.
 * In Next.js 15+, cookies() is async — createRouteHandlerClient breaks.
 * This implementation reads the session cookie directly, which works in all versions.
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
        autoRefreshToken:  false,
        persistSession:    false,
        detectSessionInUrl: false,
      },
    }
  );

  // Read session from the Supabase cookie.
  // auth-helpers stores it as: sb-[project-ref]-auth-token
  // Long tokens are chunked: .0, .1, .2 …
  const ref      = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "").split(".")[0];
  const baseName = `sb-${ref}-auth-token`;

  // Try single cookie first
  let raw = cookieStore.get(baseName)?.value ?? "";

  // If empty, try chunked cookies (.0, .1, …)
  if (!raw) {
    let chunk = "";
    let i = 0;
    while (true) {
      const part = cookieStore.get(`${baseName}.${i}`)?.value;
      if (!part) break;
      chunk += part;
      i++;
    }
    raw = chunk;
  }

  if (raw) {
    try {
      // Cookie may be URI-encoded
      const decoded = decodeURIComponent(raw);
      const session = JSON.parse(decoded);
      if (session?.access_token) {
        await supabase.auth.setSession({
          access_token:  session.access_token,
          refresh_token: session.refresh_token ?? "",
        });
      }
    } catch {
      // Malformed cookie — continue without session
    }
  }

  return supabase;
}

/**
 * Supabase admin client — bypasses RLS entirely.
 * Use ONLY in server-side admin operations.
 * Rule R-SEC-01: NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
