/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/anchor-actions
// Retroactively submits + verifies all org actions that have no blockchain anchor.
// Safe to call multiple times (skips actions that already have stellar_tx_hash).
// Admin/owner only.

export async function POST() {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (!adminSecret || !process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
    return NextResponse.json(
      { error: { code: "STELLAR_NOT_CONFIGURED", message: "STELLAR_ADMIN_SECRET_KEY or ACTION_REGISTRY_CONTRACT_ID is not set." } },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const isSuperAdmin = auth!.role === "superadmin";

  // Fetch verified actions with no stellar_tx_hash
  let query = (supabase as any)
    .from("actions")
    .select("id, org_id, user_id, action_type, description, proof_hash, tokens_awarded, blockchain_action_id")
    .eq("status", "verified")
    .is("stellar_tx_hash", null);

  if (!isSuperAdmin) query = query.eq("org_id", auth!.orgId);

  const { data: actions, error } = await query as {
    data: {
      id: string; org_id: string; user_id: string; action_type: string;
      description: string; proof_hash: string | null; tokens_awarded: number;
      blockchain_action_id: number | null;
    }[] | null;
    error: unknown;
  };

  if (error || !actions) {
    return NextResponse.json({ error: { code: "DB_ERROR", message: "Failed to fetch actions." } }, { status: 500 });
  }

  if (actions.length === 0) {
    return NextResponse.json({ data: { anchored: 0, skipped: 0, message: "All actions already anchored." } });
  }

  const { submitAction, verifyAction } = await import("@/lib/stellar/contracts/action-registry");
  const { toStroops } = await import("@/lib/utils");
  const { Keypair }   = await import("@stellar/stellar-sdk");
  const stellarUserAddress = Keypair.fromSecret(adminSecret).publicKey();

  let anchored = 0;
  const errors: string[] = [];

  for (const action of actions) {
    try {
      let blockchainActionId = action.blockchain_action_id;

      // Step 1: submitAction if not yet on-chain
      if (blockchainActionId === null) {
        const orgHex    = action.org_id.replace(/-/g, "").padEnd(64, "0").slice(0, 64);
        const proofHash = action.proof_hash ?? "0".repeat(64);

        const submitResult = await submitAction(
          adminSecret,
          stellarUserAddress,
          action.action_type as import("@/lib/stellar/types").ActionType,
          action.description,
          proofHash,
          orgHex,
        );

        blockchainActionId = submitResult.actionId !== undefined ? Number(submitResult.actionId) : null;
        if (blockchainActionId !== null) {
          await (supabase as any).from("actions")
            .update({ blockchain_action_id: blockchainActionId })
            .eq("id", action.id);
        }
      }

      if (blockchainActionId === null) {
        errors.push(`${action.id}: submitAction returned no actionId`);
        continue;
      }

      // Step 2: verifyAction — mints GTK on-chain
      const stroops = toStroops(action.tokens_awarded || 10);
      const result  = await verifyAction(adminSecret, BigInt(blockchainActionId), stroops);

      await (supabase as any).from("actions")
        .update({ stellar_tx_hash: result.txHash })
        .eq("id", action.id);
      await (supabase as any).from("certificates")
        .update({ stellar_tx_hash: result.txHash })
        .eq("action_id", action.id);

      anchored++;
    } catch (err) {
      errors.push(`${action.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    data: {
      anchored,
      total: actions.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Anchored ${anchored} of ${actions.length} actions to Stellar.`,
    },
  });
}
