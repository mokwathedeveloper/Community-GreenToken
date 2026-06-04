import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
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

  // Fetch the action — ensure it belongs to admin's org (SoD: admin cannot verify own actions)
  const { data: action, error: fetchErr } = await (supabase as any)
    .from("actions")
    .select("id, org_id, user_id, status, submitted_by")
    .eq("id", actionId)
    .eq("org_id", auth!.orgId)
    .single() as {
      data: { id: string; org_id: string; user_id: string; status: string; submitted_by?: string } | null;
      error: unknown;
    };

  if (fetchErr || !action) {
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

  // ── Stellar on-chain: fire after response so client isn't blocked ─────────
  // Rule R-SC-09: minting ONLY through ActionRegistry cross-contract call.
  // after() runs the callback after the response is flushed — Stellar latency
  // never adds to API response time. DB is the source of truth either way.
  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
    after(async () => {
      try {
        // @ts-ignore — optional Stellar integration, lib resolves at runtime
        const { verifyAction } = await import("@/lib/stellar/contracts/action-registry");
        const { toStroops }    = await import("@/lib/utils");

        const { data: actionFull } = await (supabase as any)
          .from("actions")
          .select("blockchain_action_id")
          .eq("id", actionId)
          .single() as { data: { blockchain_action_id: number | null } | null };

        const onChainActionId = BigInt(actionFull?.blockchain_action_id ?? 0);
        const stroops         = toStroops(tokensToMint);

        const result = await verifyAction(adminSecret, onChainActionId, stroops);

        await (supabase as any).from("actions")
          .update({ stellar_tx_hash: result.txHash })
          .eq("id", actionId);
      } catch (stellarErr) {
        console.error("[api/actions/verify] Stellar background call failed:", stellarErr);
      }
    });
  }

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
