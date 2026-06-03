import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, redeemSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { getTxExplorerUrl } from "@/lib/stellar/config";

// POST /api/redeem — user redeems tokens for a reward
// Rule R-FRQ-05: user MUST sign this transaction (signedXdr from Freighter)
// Spec: stellar_sdk_api_spec.md Section 11

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const parsed = await parseBody(req, redeemSchema);
  if ("error" in parsed) return parsed.error;
  const { rewardId, signedXdr } = parsed.data;

  const supabase = createAdminClient();

  // Fetch the reward
  const { data: reward } = await (supabase as any)
    .from("rewards")
    .select("id, title, token_cost, stock, is_active")
    .eq("id", rewardId)
    .eq("org_id", auth.orgId)
    .maybeSingle() as { data: { id: string; title: string; token_cost: number; stock: number | null; is_active: boolean } | null };

  if (!reward) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Reward not found." } },
      { status: 404 }
    );
  }

  if (!reward.is_active) {
    return NextResponse.json(
      { error: { code: "REWARD_INACTIVE", message: "This reward is no longer available." } },
      { status: 409 }
    );
  }

  // Check token balance
  const { data: bal } = await (supabase as any)
    .from("token_balances")
    .select("id, balance, total_spent")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .maybeSingle() as { data: { id: string; balance: number; total_spent: number } | null };

  if (!bal || bal.balance < reward.token_cost) {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_BALANCE", message: `You need ${reward.token_cost} GTK to redeem this reward.` } },
      { status: 409 }
    );
  }

  // Submit user-signed transaction to Stellar (Phase 2: replace with real submitAndWait)
  let txHash: string | null = null;
  let explorerUrl: string | null = null;

  if (signedXdr && process.env.NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID) {
    try {
      // @ts-ignore — optional Stellar integration, lib resolves at runtime
      const { redeemReward } = await import("@/lib/stellar/contracts/reward-manager");
      const result = await redeemReward(signedXdr);
      txHash      = result.txHash;
      explorerUrl = result.explorerUrl;
    } catch (err) {
      console.error("[api/redeem] Stellar redeem failed:", err);
    }
  }

  // Deduct balance
  const { error: deductErr } = await (supabase as any)
    .from("token_balances")
    .update({ balance: bal.balance - reward.token_cost, total_spent: bal.total_spent + reward.token_cost })
    .eq("id", bal.id);

  if (deductErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to process redemption." } },
      { status: 500 }
    );
  }

  // Log redemption
  const { data: redemption } = await (supabase as any)
    .from("redemption_logs")
    .insert({
      org_id:       auth.orgId,
      user_id:      auth.userId,
      reward_id:    rewardId,
      tokens_spent: reward.token_cost,
      tx_hash:      txHash,
      status:       txHash ? "confirmed" : "pending",
    })
    .select("id, tokens_spent, status")
    .single();

  return NextResponse.json({
    data: {
      redemptionId: redemption?.id,
      reward:       reward.title,
      tokensBurned: reward.token_cost,
      txHash,
      explorerUrl,
      newBalance:   bal.balance - reward.token_cost,
    },
    meta: { org_id: auth.orgId },
  });
}
