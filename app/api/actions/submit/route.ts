import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, submitActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/actions/submit
// Rule R-API-01: org_id extracted from JWT — never from request body
// Spec: saas/saas_api_endpoints.md + stellar_sdk_api_spec.md Section 9

export async function POST(req: NextRequest) {
  // 1. Auth check
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  // 2. Validate body
  const parsed = await parseBody(req, submitActionSchema);
  if ("error" in parsed) return parsed.error;
  const { actionType, description, evidenceHash } = parsed.data;

  // Rule R-SAAS-01: scope to JWT org_id, reject mismatched orgId
  const orgId = auth.orgId;

  // 3. Check duplicate evidence hash (prevent replay)
  const supabase = createAdminClient();
  // Use .maybeSingle() so it returns null (not PGRST116 error) when no row exists
  const { data: existing } = await (supabase as any)
    .from("actions")
    .select("id")
    .eq("org_id", orgId)
    .eq("description", `[hash:${evidenceHash}] ${description}`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_EVIDENCE", message: "This evidence has already been submitted." } },
      { status: 409 }
    );
  }

  // 4. Insert action into Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertResult = await (supabase as any)
    .from("actions")
    .insert({
      org_id:         orgId,
      user_id:        auth.userId,
      type:           actionType,
      description:    `[hash:${evidenceHash}] ${description}`,
      status:         "pending",
      tokens_awarded: 0,
    })
    .select("id, type, status, created_at")
    .single();
  const action = insertResult.data as { id: string; type: string; status: string; created_at: string } | null;
  const error  = insertResult.error;

  if (error || !action) {
    console.error("[api/actions/submit]", error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to submit action." } },
      { status: 500 }
    );
  }

  // TODO Phase 2: Call ActionRegistry.submit_action() on Stellar via lib/stellar/contracts/action-registry.ts
  // const txHash = await submitActionOnChain(auth.userId, actionType, description, evidenceHash, orgId);

  return NextResponse.json(
    {
      data: {
        actionId:  action.id,
        type:      action.type,
        status:    action.status,
        createdAt: action.created_at,
        message:   "Action submitted. Awaiting admin verification.",
      },
      meta: { org_id: orgId },
    },
    { status: 201 }
  );
}
