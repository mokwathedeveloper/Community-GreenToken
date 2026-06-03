import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { parseBody } from "@/lib/validation/schemas";
import { z } from "zod";

// PUT    /api/rewards/[id] — admin updates a reward
// DELETE /api/rewards/[id] — admin deactivates a reward
// Spec: saas/saas_api_endpoints.md — Token Redemption

const updateRewardSchema = z.object({
  title:       z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  token_cost:  z.number().int().positive().optional(),
  is_active:   z.boolean().optional(),
  image_url:   z.string().url().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;
  const parsed  = await parseBody(req, updateRewardSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createAdminClient();

  // Verify reward belongs to this org
  const { data: existing } = await (supabase as any)
    .from("rewards")
    .select("id, org_id")
    .eq("id", id)
    .eq("org_id", auth!.orgId)
    .maybeSingle() as { data: { id: string; org_id: string } | null };

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Reward not found in your organization." } },
      { status: 404 }
    );
  }

  const { data, error } = await (supabase as any)
    .from("rewards")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single() as { data: Record<string, unknown> | null; error: unknown };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to update reward." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data, meta: { org_id: auth!.orgId } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();

  // Soft delete — deactivate rather than hard delete (preserve redemption history)
  const { error } = await (supabase as any)
    .from("rewards")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", auth!.orgId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to deactivate reward." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { deactivated: true, id }, meta: { org_id: auth!.orgId } });
}
