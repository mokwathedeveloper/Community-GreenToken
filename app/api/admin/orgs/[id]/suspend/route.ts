/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireSuperAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { parseBody } from "@/lib/validation/schemas";

// PUT /api/admin/orgs/[id]/suspend
// Super admin: suspend or reactivate an organization.
// Suspended orgs cannot login or access the app.
// Spec: saas/saas_api_endpoints.md — Super Admin

const suspendSchema = z.object({
  action: z.enum(["suspend", "reactivate"]),
  reason: z.string().min(3).max(200).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const { id: orgId } = await params;
  const parsed = await parseBody(req, suspendSchema);
  if ("error" in parsed) return parsed.error;
  const { action } = parsed.data;

  const isSuspending = action === "suspend";
  const supabase     = createAdminClient();

  const { error } = await (supabase as any)
    .from("organizations")
    .update({
      is_active:           !isSuspending,
      subscription_status: isSuspending ? "canceled" : "active",
      updated_at:          new Date().toISOString(),
    })
    .eq("id", orgId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update org status." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      org_id:    orgId,
      is_active: !isSuspending,
      action,
    },
  });
}
