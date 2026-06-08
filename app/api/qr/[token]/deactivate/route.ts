/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// PATCH /api/qr/[token]/deactivate
// Admin toggles the is_active flag on a QR event.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  let body: { is_active?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — defaults to deactivate
  }
  const is_active = typeof body.is_active === "boolean" ? body.is_active : false;

  const supabase = createAdminClient();

  // Fetch event to confirm it belongs to admin's org
  const { data: event } = await (supabase as any)
    .from("qr_events")
    .select("id, org_id")
    .eq("token", token)
    .single() as { data: { id: string; org_id: string } | null };

  if (!event) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "QR event not found." } },
      { status: 404 }
    );
  }

  const isSuperAdmin = auth!.role === "superadmin";
  if (!isSuperAdmin && event.org_id !== auth!.orgId) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "This QR event belongs to a different organization." } },
      { status: 403 }
    );
  }

  const { error: updateErr } = await (supabase as any)
    .from("qr_events")
    .update({ is_active })
    .eq("id", event.id);

  if (updateErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update QR event." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { id: event.id, is_active } });
}
