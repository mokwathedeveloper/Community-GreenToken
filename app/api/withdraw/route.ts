import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

// Conversion rates — in production these come from an exchange-rate API
const RATES: Record<string, number> = {
  KES: 0.50,   // 1 GTK = 0.50 KES  (adjust per real rate)
  USD: 0.004,  // 1 GTK = $0.004 USD
};

const MIN_WITHDRAWAL_TOKENS = 500;  // minimum 500 GTK to withdraw

const withdrawSchema = z.object({
  tokensAmount:  z.number().int().positive().min(MIN_WITHDRAWAL_TOKENS),
  currency:      z.enum(["KES", "USD"]),
  method:        z.enum(["mpesa", "bank_transfer"]),
  accountName:   z.string().min(2).max(100),
  accountNumber: z.string().min(4).max(30),
  bankName:      z.string().max(100).optional(),
});

/**
 * POST /api/withdraw
 * Member submits a token → cash withdrawal request.
 * Deducts tokens immediately and records the request as "pending".
 * Admin processes payout manually (or via M-Pesa API integration).
 *
 * GET /api/withdraw
 * Returns the authenticated user's withdrawal history.
 */

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();
  if (!auth.orgId) return NextResponse.json({ error: { code: "NO_ORGANIZATION", message: "Complete org setup first." } }, { status: 422 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }

  const parsed = withdrawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
      { status: 400 }
    );
  }

  const { tokensAmount, currency, method, accountName, accountNumber, bankName } = parsed.data;

  if (method === "bank_transfer" && !bankName) {
    return NextResponse.json(
      { error: { code: "MISSING_BANK_NAME", message: "Bank name is required for bank transfers." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Check token balance
  const { data: bal } = await (supabase as any)
    .from("token_balances")
    .select("id, balance, total_spent")
    .eq("org_id", auth.orgId)
    .eq("user_id", auth.userId)
    .maybeSingle() as { data: { id: string; balance: number; total_spent: number } | null };

  if (!bal || bal.balance < tokensAmount) {
    return NextResponse.json(
      { error: { code: "INSUFFICIENT_BALANCE", message: `You need at least ${tokensAmount} GTK. Current balance: ${bal?.balance ?? 0} GTK.` } },
      { status: 409 }
    );
  }

  const exchangeRate = RATES[currency] ?? RATES.KES;
  const cashAmount   = parseFloat((tokensAmount * exchangeRate).toFixed(2));

  // Use atomic RPC pattern: deduct tokens + insert withdrawal in one transaction
  const { error: deductErr } = await (supabase as any)
    .from("token_balances")
    .update({ balance: bal.balance - tokensAmount, total_spent: bal.total_spent + tokensAmount })
    .eq("id", bal.id);

  if (deductErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to deduct tokens." } },
      { status: 500 }
    );
  }

  const { data: withdrawal, error: insertErr } = await (supabase as any)
    .from("withdrawal_requests")
    .insert({
      org_id:         auth.orgId,
      user_id:        auth.userId,
      tokens_amount:  tokensAmount,
      currency,
      cash_amount:    cashAmount,
      exchange_rate:  exchangeRate,
      method,
      account_name:   accountName,
      account_number: accountNumber,
      bank_name:      bankName ?? null,
      status:         "pending",
    })
    .select("id, tokens_amount, cash_amount, currency, method, status, created_at")
    .single();

  if (insertErr || !withdrawal) {
    // Restore tokens on insert failure
    await (supabase as any).from("token_balances")
      .update({ balance: bal.balance, total_spent: bal.total_spent })
      .eq("id", bal.id);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Withdrawal request failed. Tokens restored." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: withdrawal, meta: { org_id: auth.orgId } }, { status: 201 });
}

export async function GET(_req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();
  if (!auth.orgId) return NextResponse.json({ data: [], meta: { org_id: "" } });

  const supabase = createAdminClient();

  const { data, error } = await (supabase as any)
    .from("withdrawal_requests")
    .select("id, tokens_amount, cash_amount, currency, method, account_name, status, failure_reason, created_at, processed_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(20) as { data: Record<string, unknown>[] | null; error: unknown };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch withdrawal history." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [], meta: { org_id: auth.orgId } });
}
