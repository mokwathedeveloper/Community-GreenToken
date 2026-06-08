/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireSuperAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { parseBody } from "@/lib/validation/schemas";

// PUT /api/admin/orgs/[id]/plan
// Super admin: override an organization's plan (without Stripe).
// Used for manual plan grants, comp plans, or testing.
// Spec: saas/saas_api_endpoints.md — Super Admin

const planSchema = z.object({
  plan:   z.enum(["free", "starter", "pro", "enterprise"]),
  reason: z.string().min(3).max(200).optional(),
});

const PLAN_LIMITS: Record<string, number> = { free: 50, starter: 500, pro: 5000, enterprise: 999999 };

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const { id: orgId } = await params;
  const parsed = await parseBody(req, planSchema);
  if ("error" in parsed) return parsed.error;
  const { plan } = parsed.data;

  const supabase = createAdminClient();

  const { error } = await (supabase as any)
    .from("organizations")
    .update({
      plan,
      member_limit: PLAN_LIMITS[plan],
      subscription_status: "active",
      updated_at:   new Date().toISOString(),
    })
    .eq("id", orgId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update org plan." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: { org_id: orgId, plan, member_limit: PLAN_LIMITS[plan] },
  });
}
