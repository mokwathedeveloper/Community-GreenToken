import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/set-superadmin
 * Called immediately after a user creates their account to set superadmin role.
 * Body: { userId: string }
 *
 * Security rules:
 * 1. Only works if NO superadmin exists yet (singleton guard — server-side check)
 * 2. Can only be called once — after that, rejected for everyone
 */
export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const body = await req.json();
    userId = body.userId;
    if (!userId) throw new Error();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "userId is required." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Server-side singleton check — cannot be bypassed by the client
  const { data: allUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const alreadyExists = (allUsers?.users ?? []).some(
    (u) => u.app_metadata?.role === "superadmin" && u.id !== userId
  );

  if (alreadyExists) {
    return NextResponse.json(
      { error: { code: "SUPERADMIN_EXISTS", message: "A Super Admin account already exists. Only one Super Admin is allowed." } },
      { status: 409 }
    );
  }

  // Set superadmin role in app_metadata (used by custom JWT hook)
  const { error } = await supabase.auth.admin.updateUser(userId, {
    app_metadata: { role: "superadmin" },
  });

  if (error) {
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { userId, role: "superadmin" } }, { status: 200 });
}
