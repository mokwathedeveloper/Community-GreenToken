import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/tokens/balance
// Rule R-SDK-08: display balance = raw / 10^7

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from("token_balances")
    .select("balance, total_earned, total_spent")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .single() as { data: { balance: number; total_earned: number; total_spent: number } | null; error: unknown };

  const balance = data ?? { balance: 0, total_earned: 0, total_spent: 0 };

  return NextResponse.json({
    data: {
      balance:      balance.balance,
      totalEarned:  balance.total_earned,
      totalSpent:   balance.total_spent,
      displayBalance: balance.balance,           // already in GTK units (whole tokens)
    },
    meta: { org_id: auth.orgId },
  });
}
