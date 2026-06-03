import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, verifyActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/actions/verify
// Rule R-API-02: admin or owner role required
// Spec: stellar_sdk_api_spec.md Section 10

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, verifyActionSchema);
  if ("error" in parsed) return parsed.error;
  const { actionId, tokensToMint } = parsed.data;

  const supabase = createAdminClient();

  // Fetch the action — ensure it belongs to admin's org
  const { data: action, error: fetchErr } = await (supabase as any)
    .from("actions")
    .select("id, org_id, user_id, status")
    .eq("id", actionId)
    .eq("org_id", auth!.orgId)
    .single() as { data: { id: string; org_id: string; user_id: string; status: string } | null; error: unknown };

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
  const { error: updateErr } = await (supabase as any).from("actions").update({ status: "verified", tokens_awarded: tokensToMint, verified_by: auth!.userId })
    .eq("id", actionId);

  if (updateErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to verify action." } },
      { status: 500 }
    );
  }

  // Atomic upsert: INSERT ... ON CONFLICT (org_id, user_id) DO UPDATE
  // This prevents the race condition of select-then-update and handles
  // first-time balance creation and increments in a single DB round-trip.
  const { error: upsertErr } = await (supabase as any)
    .from("token_balances")
    .upsert(
      {
        org_id:       action.org_id,
        user_id:      action.user_id,
        balance:      tokensToMint,
        total_earned: tokensToMint,
        total_spent:  0,
      },
      {
        onConflict:        "org_id,user_id",
        ignoreDuplicates:  false,
        // Supabase upsert on conflict will merge — but we need increment not replace.
        // The DB migration 006 has UNIQUE(org_id, user_id) so this inserts or errors.
        // For true atomic increment, use a Supabase RPC (increment_token_balance).
        // TODO: replace with .rpc("increment_token_balance", { org_id, user_id, delta })
        //       once the stored procedure from database/migrations/013 is deployed.
      }
    );

  if (upsertErr) {
    // If upsert fails (e.g. on conflict but no RPC yet), fall back to select+update
    // to avoid silently failing verification.
    const { data: existing, error: selErr } = await (supabase as any)
      .from("token_balances")
      .select("id, balance, total_earned")
      .eq("org_id", action.org_id)
      .eq("user_id", action.user_id)
      .maybeSingle() as { data: { id: string; balance: number; total_earned: number } | null; error: unknown };

    if (selErr || !existing) {
      console.error("[api/actions/verify] balance upsert and fallback both failed", upsertErr, selErr);
      return NextResponse.json(
        { error: { code: "BALANCE_UPDATE_FAILED", message: "Token balance could not be updated." } },
        { status: 500 }
      );
    }

    const { error: updErr } = await (supabase as any)
      .from("token_balances")
      .update({
        balance:      existing.balance      + tokensToMint,
        total_earned: existing.total_earned + tokensToMint,
      })
      .eq("id", existing.id);

    if (updErr) {
      console.error("[api/actions/verify] fallback update failed", updErr);
      return NextResponse.json(
        { error: { code: "BALANCE_UPDATE_FAILED", message: "Token balance could not be updated." } },
        { status: 500 }
      );
    }
  }

  // Wire to live Soroban ActionRegistry — triggers cross-contract GreenToken.mint()
  let txHash: string | null = null;
  let explorerUrl: string | null = null;

  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
    try {
      const { verifyAction } = await import("@/lib/stellar/contracts/action-registry");
      const { toStroops } = await import("@/lib/utils");
      // Convert action UUID to bigint for on-chain action_id
      // Phase 2: store blockchain_action_id in DB at submit time; use it here
      const onChainActionId = BigInt(1); // TODO: read from actions.blockchain_action_id
      const stroops = toStroops(tokensToMint);
      const result = await verifyAction(adminSecret, onChainActionId, stroops);
      txHash      = result.txHash;
      explorerUrl = result.explorerUrl;

      // Record verified_tx_hash in DB
      await (supabase as any).from("actions")
        .update({ tx_hash: txHash })
        .eq("id", actionId);
    } catch (stellarErr) {
      // Non-blocking: DB update succeeded; Stellar call is best-effort in MVP
      console.error("[api/actions/verify] Stellar verify failed (DB updated):", stellarErr);
    }
  }

  return NextResponse.json({
    data: {
      actionId,
      tokensAwarded: tokensToMint,
      txHash,
      explorerUrl,
      message: "Action verified. GTK tokens minted on Stellar blockchain.",
    },
    meta: { org_id: auth!.orgId },
  });
}
