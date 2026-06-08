/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, redeemSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/redeem — member redeems GTK tokens for a reward.
//
// Ordering contract:
//   1. Validate inputs (Zod)
//   2. Fetch reward (check active + stock)
//   3. Fetch + lock balance (check sufficient)
//   4. Deduct balance
//   5. Insert redemption log  ← if this fails, tokens are restored (rollback)
//   6. Decrement reward stock (if limited)

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();
  if (!auth.orgId) {
    return NextResponse.json(
      { error: { code: "NO_ORGANIZATION", message: "Complete org setup first." } },
      { status: 422 }
    );
  }

  const parsed = await parseBody(req, redeemSchema);
  if ("error" in parsed) return parsed.error;
  const { rewardId, signedXdr } = parsed.data;

  const supabase = createAdminClient();

  // ── 1. Fetch reward ────────────────────────────────────────────────────────
  const { data: reward } = await (supabase as any)
    .from("rewards")
    .select("id, title, token_cost, stock, is_active")
    .eq("id", rewardId)
    .eq("org_id", auth.orgId)
    .maybeSingle() as {
      data: { id: string; title: string; token_cost: number; stock: number | null; is_active: boolean } | null;
    };

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

  // ── 2. Stock check ────────────────────────────────────────────────────────
  if (reward.stock !== null && reward.stock <= 0) {
    return NextResponse.json(
      { error: { code: "OUT_OF_STOCK", message: "This reward is out of stock." } },
      { status: 409 }
    );
  }

  // ── 3. Balance check ──────────────────────────────────────────────────────
  const { data: bal } = await (supabase as any)
    .from("token_balances")
    .select("id, balance, total_spent")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .maybeSingle() as { data: { id: string; balance: number; total_spent: number } | null };

  if (!bal || bal.balance < reward.token_cost) {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_BALANCE", message: `You need ${reward.token_cost} GTK to redeem this reward. Your balance: ${bal?.balance ?? 0} GTK.` } },
      { status: 409 }
    );
  }

  // ── 4. Optional Stellar tx (Phase 2) ─────────────────────────────────────
  let txHash: string | null = null;
  let explorerUrl: string | null = null;

  if (signedXdr && process.env.NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID) {
    try {
      const { redeemReward } = await import("@/lib/stellar/contracts/reward-manager");
      const result = await redeemReward(signedXdr);
      txHash      = result.txHash;
      explorerUrl = result.explorerUrl;
    } catch (err) {
      console.error("[api/redeem] Stellar redeem failed:", err);
    }
  }

  // ── 5. Deduct balance ─────────────────────────────────────────────────────
  const { error: deductErr } = await (supabase as any)
    .from("token_balances")
    .update({
      balance:     bal.balance - reward.token_cost,
      total_spent: bal.total_spent + reward.token_cost,
    })
    .eq("id", bal.id);

  if (deductErr) {
    console.error("[api/redeem] Token deduction failed:", JSON.stringify(deductErr));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to process redemption." } },
      { status: 500 }
    );
  }

  // ── 6. Insert redemption log ──────────────────────────────────────────────
  // If this fails, restore the balance (rollback).
  const { data: redemption, error: logErr } = await (supabase as any)
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

  if (logErr || !redemption) {
    console.error("[api/redeem] Log insert failed — restoring tokens:", JSON.stringify(logErr));
    await (supabase as any)
      .from("token_balances")
      .update({ balance: bal.balance, total_spent: bal.total_spent })
      .eq("id", bal.id);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Redemption failed. Your tokens have been restored." } },
      { status: 500 }
    );
  }

  // ── 7. Decrement stock ────────────────────────────────────────────────────
  // Only for limited-stock rewards (stock !== null).
  if (reward.stock !== null) {
    await (supabase as any)
      .from("rewards")
      .update({ stock: Math.max(0, reward.stock - 1) })
      .eq("id", rewardId);
  }

  return NextResponse.json({
    data: {
      redemptionId: redemption.id,
      reward:       reward.title,
      tokensBurned: reward.token_cost,
      txHash,
      explorerUrl,
      newBalance:   bal.balance - reward.token_cost,
    },
    meta: { org_id: auth.orgId },
  });
}
