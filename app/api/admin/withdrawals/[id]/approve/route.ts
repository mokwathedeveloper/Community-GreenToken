import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { b2cPayment, formatPhone, isMpesaConfigured } from "@/lib/payments/mpesa";
import { createStripePayout, isStripeConfigured } from "@/lib/payments/stripe-payouts";
import { z } from "zod";

// POST /api/admin/withdrawals/[id]/approve
// Body: { paymentProvider: "mpesa" | "stripe" | "manual", adminNote?: string }
// Flow:
//   mpesa  → triggers Daraja B2C; status → "processing" until callback confirms
//   stripe → creates Stripe payout; status → "processing"; admin finalises from Stripe Dashboard
//   manual → status → "completed" immediately; admin confirms they've sent money

const approveSchema = z.object({
  paymentProvider: z.enum(["mpesa", "stripe", "manual"]),
  adminNote:       z.string().max(200).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }

  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
      { status: 400 }
    );
  }

  const { paymentProvider, adminNote } = parsed.data;

  const supabase = createAdminClient();

  // Fetch the withdrawal request
  const { data: wr } = await (supabase as any)
    .from("withdrawal_requests")
    .select("id, org_id, user_id, tokens_amount, cash_amount, currency, method, account_name, account_number, status")
    .eq("id", id)
    .eq("org_id", auth!.orgId)
    .maybeSingle() as {
      data: {
        id: string; org_id: string; user_id: string; tokens_amount: number;
        cash_amount: number; currency: string; method: string;
        account_name: string; account_number: string; status: string;
      } | null;
    };

  if (!wr) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Withdrawal request not found." } },
      { status: 404 }
    );
  }

  if (wr.status !== "pending") {
    return NextResponse.json(
      { error: { code: "ALREADY_PROCESSED", message: `Withdrawal is already ${wr.status}.` } },
      { status: 409 }
    );
  }

  // ── Validate provider availability ────────────────────────────────────────
  if (paymentProvider === "mpesa" && !isMpesaConfigured()) {
    return NextResponse.json(
      { error: { code: "PROVIDER_NOT_CONFIGURED", message: "M-Pesa credentials are not configured. Add MPESA_* environment variables." } },
      { status: 422 }
    );
  }
  if (paymentProvider === "stripe" && !isStripeConfigured()) {
    return NextResponse.json(
      { error: { code: "PROVIDER_NOT_CONFIGURED", message: "Stripe is not configured. Add STRIPE_SECRET_KEY environment variable." } },
      { status: 422 }
    );
  }
  if (paymentProvider === "mpesa" && wr.currency !== "KES") {
    return NextResponse.json(
      { error: { code: "INVALID_PROVIDER", message: "M-Pesa can only process KES withdrawals." } },
      { status: 422 }
    );
  }
  if (paymentProvider === "stripe" && wr.currency !== "USD") {
    return NextResponse.json(
      { error: { code: "INVALID_PROVIDER", message: "Stripe payouts are for USD withdrawals." } },
      { status: 422 }
    );
  }

  let paymentReference: string | null = null;
  let finalStatus: string = "processing";

  try {
    if (paymentProvider === "mpesa") {
      // ── M-Pesa B2C ───────────────────────────────────────────────────────
      const phone  = formatPhone(wr.account_number);
      const result = await b2cPayment({
        amountKes:    wr.cash_amount,
        phoneNumber:  phone,
        withdrawalId: wr.id,
        remarks:      `GreenToken withdrawal for ${wr.account_name}`,
      });
      paymentReference = result.conversationId;
      finalStatus      = "processing"; // Daraja callback will flip to completed/failed

    } else if (paymentProvider === "stripe") {
      // ── Stripe payout ────────────────────────────────────────────────────
      // Get member name for Stripe metadata
      const { data: user } = await (supabase as any)
        .from("users").select("display_name, email").eq("id", wr.user_id).maybeSingle() as
        { data: { display_name: string | null; email: string | null } | null };

      const result = await createStripePayout({
        amountUsd:    wr.cash_amount,
        withdrawalId: wr.id,
        memberName:   user?.display_name ?? user?.email ?? wr.account_name,
        bankAccount:  wr.account_number,
      });
      paymentReference = result.payoutId;
      finalStatus      = "processing";

    } else {
      // ── Manual ───────────────────────────────────────────────────────────
      finalStatus      = "completed";
      paymentReference = null;
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment initiation failed.";
    console.error(`[api/admin/withdrawals/approve] ${paymentProvider} error:`, msg);

    // Don't change withdrawal status on payment failure — stays pending so admin can retry
    return NextResponse.json(
      { error: { code: "PAYMENT_FAILED", message: msg } },
      { status: 502 }
    );
  }

  // ── Update withdrawal record ───────────────────────────────────────────────
  const { error: updateErr } = await (supabase as any)
    .from("withdrawal_requests")
    .update({
      status:            finalStatus,
      payment_provider:  paymentProvider,
      payment_reference: paymentReference,
      processed_by:      auth!.userId,
      processed_at:      new Date().toISOString(),
      admin_note:        adminNote ?? null,
    })
    .eq("id", id);

  if (updateErr) {
    console.error("[api/admin/withdrawals/approve] DB update error:", JSON.stringify(updateErr));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Payment sent but status update failed. Check DB." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      withdrawalId:      id,
      status:            finalStatus,
      paymentProvider,
      paymentReference,
      message:
        paymentProvider === "mpesa"  ? "M-Pesa payment initiated. Member will receive funds shortly." :
        paymentProvider === "stripe" ? "Stripe payout created. Monitor progress in Stripe Dashboard." :
                                       "Withdrawal marked as manually paid and completed.",
    },
    meta: { org_id: auth!.orgId },
  });
}
