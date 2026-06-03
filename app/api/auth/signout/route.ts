import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST /api/auth/signout
// Spec: saas/saas_api_endpoints.md — Authentication section
// Invalidates the current session server-side.
// Client should also call supabase.auth.signOut() to clear local cookies.

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return NextResponse.json({ data: { signed_out: true } });
  } catch {
    return NextResponse.json({ data: { signed_out: true } });
  }
}
