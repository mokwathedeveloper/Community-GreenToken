import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase server client for API Route Handlers.
 * Uses createRouteHandlerClient so it can read session cookies
 * from the incoming HTTP request (Next.js App Router).
 *
 * Rule R-API-01: ALL API routes MUST extract org_id before querying.
 * Rule R-SEC-01: NEVER use service_role key here — uses anon key + RLS.
 */
export async function createServerSupabaseClient() {
  // cookies() returns a Promise in Next.js 15+ — pass it directly so
  // auth-helpers can await it internally when reading the cookie store.
  return createRouteHandlerClient<Database>({
    cookies,
  });
}

/**
 * Supabase admin client — bypasses RLS entirely.
 * Use ONLY for server-side admin operations:
 *   - billing webhooks
 *   - auth triggers / migrations
 *   - super admin API routes
 *
 * Rule R-SEC-01: NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
