import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/tokens/balance
// Rule R-SDK-08: display balance = raw stroops / 10^7
// Rule: returns both Supabase (fast) and on-chain (authoritative) balance

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();
  const { data } = await (supabase as any)
    .from("token_balances")
    .select("balance, total_earned, total_spent")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .maybeSingle() as { data: { balance: number; total_earned: number; total_spent: number } | null };

  const dbBalance = data ?? { balance: 0, total_earned: 0, total_spent: 0 };

  // Read on-chain GTK balance from Stellar
  let onChainBalance: number | null = null;
  let inSync = true;

  try {
    const walletAddressResult = await (supabase as any)
      .from("users")
      .select("wallet_address")
      .eq("id", auth.userId)
      .maybeSingle() as { data: { wallet_address: string | null } | null };

    const walletAddress = walletAddressResult?.data?.wallet_address;
    if (walletAddress && process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID) {
      // @ts-ignore — optional Stellar integration, lib resolves at runtime
      const { getDisplayBalance } = await import("@/lib/stellar/contracts/green-token");
      onChainBalance = await getDisplayBalance(walletAddress);
      inSync = Math.abs(onChainBalance - dbBalance.balance) < 1; // within 1 GTK
    }
  } catch {
    // Stellar read failed — return DB balance only
    onChainBalance = null;
  }

  return NextResponse.json({
    data: {
      balance:       dbBalance.balance,
      totalEarned:   dbBalance.total_earned,
      totalSpent:    dbBalance.total_spent,
      onChainBalance,
      inSync,
      displayBalance: onChainBalance ?? dbBalance.balance,
    },
    meta: { org_id: auth.orgId },
  });
}
