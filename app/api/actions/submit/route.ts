import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, submitActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/middleware/rateLimiter";

// POST /api/actions/submit
// Rule R-API-01: org_id extracted from JWT — never from request body
// Rule: evidence_hash stored in dedicated column (not embedded in description)
// Fix: rate limiting + proper evidence_hash column usage

export async function POST(req: NextRequest) {
  // 1. Auth check
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  // 2. Rate limit: 10 submissions per minute per org (prevents token farming)
  const ip       = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const rlKey    = rateLimitKey("action_submit", auth.orgId, ip);
  const rlResult = checkRateLimit(rlKey, "action_submit");
  if (rlResult) return rlResult;

  // 3. Validate body — Zod ensures evidenceHash is exactly 64-char lowercase hex
  const parsed = await parseBody(req, submitActionSchema);
  if ("error" in parsed) return parsed.error;
  const { actionType, description, evidenceHash } = parsed.data;

  const orgId   = auth.orgId;  // Rule R-SAAS-01: always from JWT, never from body
  const supabase = createAdminClient();

  // 4. Check duplicate evidence hash using dedicated column (not description text)
  const { data: existing } = await (supabase as any)
    .from("actions")
    .select("id")
    .eq("org_id", orgId)
    .eq("evidence_hash", evidenceHash)
    .neq("status", "rejected")    // rejected actions allow re-submission with same evidence
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_EVIDENCE", message: "This evidence has already been submitted." } },
      { status: 409 }
    );
  }

  // 5. Insert action with evidence_hash in its own column
  const insertResult = await (supabase as any)
    .from("actions")
    .insert({
      org_id:         orgId,
      user_id:        auth.userId,
      action_type:    actionType,
      description,
      evidence_hash:  evidenceHash,   // dedicated column — not embedded in description
      status:         "pending",
      tokens_awarded: 0,
      submitted_at:   new Date().toISOString(),
    })
    .select("id, action_type, status, submitted_at")
    .single();

  const action = insertResult.data as {
    id: string; action_type: string; status: string; submitted_at: string;
  } | null;
  const dbError = insertResult.error;

  if (dbError || !action) {
    console.error("[api/actions/submit] DB insert failed:", dbError);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to submit action." } },
      { status: 500 }
    );
  }

  // 6. Stellar on-chain: ActionRegistry.submit_action()
  // Non-blocking — DB record is the source of truth, chain is secondary
  let txHash:      string | null = null;
  let explorerUrl: string | null = null;
  let blockchainActionId: number | null = null;

  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
    try {
      // @ts-ignore — optional Stellar integration, lib resolves at runtime
      const { submitAction } = await import("@/lib/stellar/contracts/action-registry");
      const orgHex = orgId.replace(/-/g, "").padEnd(64, "0").slice(0, 64);

      const result = await submitAction(
        adminSecret,
        auth.userId,
        actionType as import("@/lib/stellar/types").ActionType,
        description,
        evidenceHash,
        orgHex
      );
      txHash              = result.txHash;
      explorerUrl         = result.explorerUrl;
      blockchainActionId  = result.actionId ? Number(result.actionId) : null;

      // Store on-chain references so verify can use the real on-chain action ID
      await (supabase as any).from("actions").update({
        stellar_tx_hash:      txHash,
        blockchain_action_id: blockchainActionId,
      }).eq("id", action.id);

    } catch (stellarErr) {
      console.error("[api/actions/submit] Stellar submit failed (DB record saved):", stellarErr);
    }
  }

  return NextResponse.json(
    {
      data: {
        actionId:   action.id,
        type:       action.action_type,
        status:     action.status,
        createdAt:  action.submitted_at,
        txHash,
        explorerUrl,
        message:    "Action submitted. Awaiting admin verification.",
      },
      meta: { org_id: orgId },
    },
    { status: 201 }
  );
}
