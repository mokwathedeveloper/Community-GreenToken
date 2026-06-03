import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase server client for API Route Handlers (Next.js 16).
 *
 * Uses createRouteHandlerClient from auth-helpers so the library's own
 * cookie parsing handles chunking, encoding, and expiry — no manual parsing.
 *
 * In Next.js 15+, cookies() is async. We await it and pass the already-
 * resolved store so the library doesn't receive a Promise it can't handle.
 *
 * Rule R-SEC-01: anon key + RLS — never service_role.
 */
export async function createServerSupabaseClient() {
  // Await the async cookies() — gives us the ReadonlyRequestCookies store
  const cookieStore = await cookies();

  // Pass the resolved store as a synchronous function so auth-helpers
  // can read cookies without needing to await a Promise itself.
  return createRouteHandlerClient<Database>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { cookies: () => cookieStore as any },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );
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
