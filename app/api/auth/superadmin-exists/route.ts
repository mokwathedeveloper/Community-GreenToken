import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/superadmin-exists
 * Returns whether a superadmin account already exists on the platform.
 * Public endpoint — used by signup page to show/hide the Super Admin option.
 * No auth required (checking existence, not exposing who it is).
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // List users and check for superadmin app_metadata role
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (error) {
      return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
    }

    const exists = (data?.users ?? []).some(
      (u) => u.app_metadata?.role === "superadmin"
    );

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
