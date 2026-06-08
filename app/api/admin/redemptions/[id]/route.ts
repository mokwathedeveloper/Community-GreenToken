/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// PATCH /api/admin/redemptions/[id]
// Admin marks a redemption as fulfilled (status pending → confirmed).

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();

  // Verify it belongs to this org and is still pending
  const { data: log } = await (supabase as any)
    .from("redemption_logs")
    .select("id, org_id, status")
    .eq("id", id)
    .eq("org_id", auth!.orgId)
    .maybeSingle() as { data: { id: string; org_id: string; status: string } | null };

  if (!log) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Redemption not found in your organization." } },
      { status: 404 }
    );
  }

  if (log.status === "confirmed") {
    return NextResponse.json(
      { error: { code: "ALREADY_FULFILLED", message: "This redemption is already marked as fulfilled." } },
      { status: 409 }
    );
  }

  const { error } = await (supabase as any)
    .from("redemption_logs")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update redemption." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { id, status: "confirmed" }, meta: { org_id: auth!.orgId } });
}
