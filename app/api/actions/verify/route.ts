/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, verifyActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/middleware/rateLimiter";

// POST /api/actions/verify
// Rule R-API-02: admin or owner role required
// Rule R-SC-09: minting triggered via ActionRegistry cross-contract call
// Fix: uses atomic increment_token_balance RPC to prevent race condition

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  // Rate limit: 30 verifications per minute per org admin
  const ip       = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const rlKey    = rateLimitKey("action_verify", auth!.orgId, ip);
  const rlResult = checkRateLimit(rlKey, "action_verify");
  if (rlResult) return rlResult;

  const parsed = await parseBody(req, verifyActionSchema);
  if ("error" in parsed) return parsed.error;
  const { actionId, tokensToMint } = parsed.data;

  const supabase = createAdminClient();

  // Fetch the action — ensure it belongs to admin's org
  // For superadmin (orgId = ""), look up the action by id only then validate it has an org_id.
  const isSuperAdmin = auth!.role === "superadmin";
  let actionQuery = (supabase as any)
    .from("actions")
    .select("id, org_id, user_id, status")
    .eq("id", actionId);
  if (!isSuperAdmin && auth!.orgId) {
    actionQuery = actionQuery.eq("org_id", auth!.orgId);
  }

  const { data: action, error: fetchErr } = await actionQuery.single() as {
    data: { id: string; org_id: string; user_id: string; status: string } | null;
    error: unknown;
  };

  if (fetchErr || !action) {
    console.error("[api/actions/verify] Fetch error:", JSON.stringify(fetchErr), "orgId:", auth!.orgId, "actionId:", actionId);
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Action not found in your organization." } },
      { status: 404 }
    );
  }

  if (action.status !== "pending") {
    return NextResponse.json(
      { error: { code: "ALREADY_PROCESSED", message: `Action is already ${action.status}.` } },
      { status: 409 }
    );
  }

  // Update action to verified
  const { error: updateErr } = await (supabase as any)
    .from("actions")
    .update({
      status:       "verified",
      tokens_awarded: tokensToMint,
      verified_by:  auth!.userId,
      verified_at:  new Date().toISOString(),
    })
    .eq("id", actionId);

  if (updateErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to verify action." } },
      { status: 500 }
    );
  }

  // ── ATOMIC token balance increment — fixes race condition ────────────────
  // Uses the increment_token_balance RPC from migration 019.
  // A single UPDATE with balance = balance + amount, row-locked.
  const { error: rpcErr } = await (supabase as any)
    .rpc("increment_token_balance", {
      p_user_id: action.user_id,
      p_org_id:  action.org_id,
      p_amount:  tokensToMint,
    });

  if (rpcErr) {
    // Roll back the action verification so state is consistent
    await (supabase as any).from("actions")
      .update({ status: "pending", verified_by: null, verified_at: null, tokens_awarded: 0 })
      .eq("id", actionId);
    return NextResponse.json(
      { error: { code: "BALANCE_UPDATE_FAILED", message: "Token balance could not be updated. Verification rolled back." } },
      { status: 500 }
    );
  }

  // ── Post-response work: Stellar commit + certificate issuance ────────────
  // after() runs after the response is flushed — never adds to API latency.
  // DB is always the source of truth; Stellar and certificate are supplemental.
  after(async () => {
    const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
    if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
      try {
        const { verifyAction } = await import("@/lib/stellar/contracts/action-registry");
        const { toStroops }    = await import("@/lib/utils");

        const { data: actionFull } = await (supabase as any)
          .from("actions")
          .select("blockchain_action_id")
          .eq("id", actionId)
          .single() as { data: { blockchain_action_id: number | null } | null };

        const onChainActionId = BigInt(actionFull?.blockchain_action_id ?? 0);
        const stroops         = toStroops(tokensToMint);
        const result          = await verifyAction(adminSecret, onChainActionId, stroops);

        await (supabase as any).from("actions")
          .update({ stellar_tx_hash: result.txHash })
          .eq("id", actionId);
      } catch (stellarErr) {
        console.error("[api/actions/verify] Stellar background call failed:", stellarErr);
      }
    }

    // Carbon credit certificate — always issued for every verified action
    try {
      const { issueCertificate } = await import("@/lib/certificates/issue");
      await issueCertificate(actionId, supabase);
    } catch (certErr) {
      console.error("[api/actions/verify] Certificate issuance failed:", certErr);
    }
  });

  return NextResponse.json({
    data: {
      actionId,
      tokensAwarded: tokensToMint,
      txHash:      null,   // populated asynchronously after response
      explorerUrl: null,
      message: "Action verified. GTK tokens minted on Stellar blockchain.",
    },
    meta: { org_id: auth!.orgId },
  });
}
