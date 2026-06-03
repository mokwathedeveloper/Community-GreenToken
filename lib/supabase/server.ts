import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Supabase server client — use in Server Components and API Routes (App Router).
 * Uses service-level access but honors RLS through JWT in Authorization header.
 *
 * Rule R-API-01: ALL API routes MUST extract org_id from JWT before querying.
 */
export async function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
        detectSessionInUrl: false,
      },
    }
  );
}

/**
 * Supabase admin client — bypasses RLS entirely.
 * Use ONLY in server-side admin operations (billing webhooks, super admin).
 *
 * Rule R-SEC-01: NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 * Rule R-SAAS-04: Super admin routes MUST validate role server-side.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
