"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

/**
 * Supabase browser client — use in Client Components ('use client').
 * Creates a singleton instance per browser tab.
 *
 * Rule R-SAAS-01: Every query MUST include org_id scoping.
 * Rule R-SEC-01: NEVER expose service role key here.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
