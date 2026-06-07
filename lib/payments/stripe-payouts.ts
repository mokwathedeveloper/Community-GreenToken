// Stripe payout helper
// Tracks outgoing USD payout intent and links admin to Stripe Dashboard.
//
// Required env vars:
//   STRIPE_SECRET_KEY  — sk_live_... or sk_test_...  (already used for billing)
//
// Note: Stripe Payouts (stripe.payouts.create) send money from YOUR Stripe
// balance to YOUR bank account — not directly to the member's account.
// For true member payouts you need Stripe Connect (stripe.transfers.create).
// This implementation records the payout intent and provides a Dashboard link
// so the admin can complete the transfer. Add STRIPE_CONNECT_ACCOUNT_ID to
// enable automatic Stripe Connect transfers in future.

import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
}

export type StripePayoutResult = {
  payoutId:     string;
  status:       string;
  dashboardUrl: string;
};

export async function createStripePayout(params: {
  amountUsd:    number;   // USD float
  withdrawalId: string;
  memberName:   string;
  bankAccount:  string;
}): Promise<StripePayoutResult> {
  const stripe  = getStripe();
  const cents   = Math.round(params.amountUsd * 100);

  // Create a payout from the platform's Stripe balance.
  // Requires funds in your Stripe balance — top up via Stripe Dashboard first.
  const payout = await stripe.payouts.create({
    amount:      cents,
    currency:    "usd",
    description: `GreenToken withdrawal — ${params.memberName} — ${params.withdrawalId}`,
    metadata: {
      withdrawal_id: params.withdrawalId,
      member_name:   params.memberName,
      bank_account:  params.bankAccount,
    },
  });

  const isLive = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live");
  const dashboardUrl = isLive
    ? `https://dashboard.stripe.com/payouts/${payout.id}`
    : `https://dashboard.stripe.com/test/payouts/${payout.id}`;

  return {
    payoutId:     payout.id,
    status:       payout.status,
    dashboardUrl,
  };
}
