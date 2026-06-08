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
  const {
    actionType, description, evidenceHash,
    exifLat, exifLng, exifCapturedAt, exifDevice, exifPresent, proofHash,
  } = parsed.data;

  const orgId   = auth.orgId;  // Rule R-SAAS-01: always from JWT, never from body

  // User must belong to an org before submitting actions
  if (!orgId) {
    return NextResponse.json(
      {
        error: {
          code: "NO_ORGANIZATION",
          message: "You need to set up your organization before submitting actions.",
          redirect: "/org/setup",
        },
      },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();

  // 4a. Same-org duplicate check (hard reject)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // 4b. EXIF age check — reject photos captured more than 30 days ago (prevents using old stockpile)
  if (exifCapturedAt) {
    const captureAge = Date.now() - new Date(exifCapturedAt).getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (captureAge > thirtyDays) {
      return NextResponse.json(
        {
          error: {
            code: "EVIDENCE_TOO_OLD",
            message: "Photo evidence is more than 30 days old. Please submit a recent photo.",
          },
        },
        { status: 422 }
      );
    }
  }

  // 5. Insert action — include EXIF metadata columns (migration 029)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertResult = await (supabase as any)
    .from("actions")
    .insert({
      org_id:           orgId,
      user_id:          auth.userId,
      type:             actionType,   // original column (NOT NULL)
      action_type:      actionType,   // added in migration 020
      description,
      evidence_hash:    evidenceHash,
      status:           "pending",
      tokens_awarded:   0,
      submitted_at:     new Date().toISOString(),
      // EXIF anti-fraud fields (migration 029) — null when metadata not available
      exif_lat:         exifLat        ?? null,
      exif_lng:         exifLng        ?? null,
      exif_captured_at: exifCapturedAt ?? null,
      exif_device:      exifDevice     ?? null,
      exif_present:     exifPresent    ?? false,
      proof_hash:       proofHash      ?? null,
    })
    .select("id, action_type, status, submitted_at, created_at")
    .single();

  const action = insertResult.data as {
    id: string; action_type: string; status: string; submitted_at: string; created_at: string;
  } | null;
  const dbError = insertResult.error;

  if (dbError || !action) {
    console.error("[api/actions/submit] DB insert failed:", dbError);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to submit action." } },
      { status: 500 }
    );
  }

  // 5b. Cross-org duplicate flag (non-blocking — runs after insert so it can update our new row)
  // Uses the flag_cross_org_duplicate() RPC from migration 029
  let isCrossOrgDup = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flagResult } = await (supabase as any)
      .rpc("flag_cross_org_duplicate", {
        p_action_id:     action.id,
        p_org_id:        orgId,
        p_evidence_hash: evidenceHash,
      });
    isCrossOrgDup = flagResult === true;
  } catch {
    // Non-critical — fraud flag failure doesn't block submission
  }

  // 6. Stellar on-chain: ActionRegistry.submit_action()
  // Non-blocking — DB record is the source of truth, chain is secondary
  let txHash:      string | null = null;
  let explorerUrl: string | null = null;
  let blockchainActionId: number | null = null;

  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
    try {
      const { submitAction } = await import("@/lib/stellar/contracts/action-registry");
      const orgHex = orgId.replace(/-/g, "").padEnd(64, "0").slice(0, 64);

      // Pass proofHash to Stellar so the on-chain record commits to both
      // the image AND its EXIF metadata (location + time). If no proofHash,
      // fall back to evidenceHash alone.
      const result = await submitAction(
        adminSecret,
        auth.userId,
        actionType as import("@/lib/stellar/types").ActionType,
        description,
        proofHash ?? evidenceHash,
        orgHex
      );
      txHash              = result.txHash;
      explorerUrl         = result.explorerUrl;
      blockchainActionId  = result.actionId ? Number(result.actionId) : null;

      // Store on-chain references so verify can use the real on-chain action ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        actionId:      action.id,
        type:          action.action_type,
        status:        action.status,
        createdAt:     action.submitted_at,
        txHash,
        explorerUrl,
        isCrossOrgDup,
        message:       "Action submitted. Awaiting admin verification.",
      },
      meta: { org_id: orgId },
    },
    { status: 201 }
  );
}
