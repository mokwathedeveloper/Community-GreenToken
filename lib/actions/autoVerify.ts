/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared auto-verification logic — called from submit route's after() when confidence >= threshold.
// Mirrors the manual verify route: DB update → atomic balance increment → Stellar → certificate.
// All steps after DB update are best-effort; failures are logged but never throw.

import { createAdminClient } from "@/lib/supabase/server";
import { toStroops } from "@/lib/utils";

export interface AutoVerifyParams {
  actionId:          string;
  userId:            string;
  orgId:             string;
  tokensToMint:      number;
  blockchainActionId: number | null;
}

export async function autoVerifyAction(params: AutoVerifyParams): Promise<void> {
  const supabase = createAdminClient();

  // Mark as verified with auto_verified flag; only proceed if still pending
  // (guards against double-fire if after() is somehow called twice)
  const { error: updateErr } = await (supabase as any)
    .from("actions")
    .update({
      status:         "verified",
      tokens_awarded: params.tokensToMint,
      verified_at:    new Date().toISOString(),
    })
    .eq("id", params.actionId)
    .eq("status", "pending");

  if (updateErr) {
    console.error("[autoVerify] DB update failed:", updateErr);
    return;
  }

  // Atomic token balance increment — same RPC used by manual verify route
  const { error: rpcErr } = await (supabase as any).rpc("increment_token_balance", {
    p_user_id: params.userId,
    p_org_id:  params.orgId,
    p_amount:  params.tokensToMint,
  });

  if (rpcErr) {
    // Rollback so action returns to the admin queue
    await (supabase as any)
      .from("actions")
      .update({ status: "pending", tokens_awarded: 0, verified_at: null })
      .eq("id", params.actionId);
    console.error("[autoVerify] Balance RPC failed, rolled back:", rpcErr);
    return;
  }

  // Stellar on-chain verify — requires a blockchain_action_id from the prior submitAction call
  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID && params.blockchainActionId !== null) {
    try {
      const { verifyAction } = await import("@/lib/stellar/contracts/action-registry");
      const result = await verifyAction(adminSecret, BigInt(params.blockchainActionId), toStroops(params.tokensToMint));
      await (supabase as any)
        .from("actions")
        .update({ stellar_tx_hash: result.txHash })
        .eq("id", params.actionId);
    } catch (stellarErr) {
      console.error("[autoVerify] Stellar verifyAction failed (non-fatal):", stellarErr);
    }
  }

  // Carbon credit certificate
  try {
    const { issueCertificate } = await import("@/lib/certificates/issue");
    await issueCertificate(params.actionId, supabase);
  } catch (certErr) {
    console.error("[autoVerify] Certificate issuance failed (non-fatal):", certErr);
  }
}
