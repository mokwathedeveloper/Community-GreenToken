import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// POST /api/billing/webhook
// Rule R-SAAS-06: MUST verify Stripe signature — reject unsigned events with 400
// Spec: saas/billing_and_subscriptions.md Section 3

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
  [process.env.STRIPE_PRO_PRICE_ID     ?? ""]: "pro",
};

const MEMBER_LIMITS: Record<string, number> = {
  free: 50, starter: 500, pro: 5000,
};

async function updateOrgPlan(
  supabase: ReturnType<typeof createAdminClient>,
  orgId: string,
  sub: Stripe.Subscription
) {
  const priceId = sub.items.data[0]?.price.id ?? "";
  const plan    = PLAN_MAP[priceId] ?? "free";
  await (supabase as any).from("organizations").update({
    plan,
    subscription_status:    sub.status,
    stripe_subscription_id: sub.id,
    member_limit:           MEMBER_LIMITS[plan] ?? 50,
  }).eq("id", orgId);
}

// Stripe requires raw body for signature verification
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[billing/webhook] signature verification failed", err);
    return NextResponse.json(
      { error: { code: "INVALID_SIGNATURE", message: "Webhook signature invalid." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgId = (event.data.object as any)?.metadata?.org_id as string | undefined;

  // Log every event for audit — Rule R-SAAS-06
  await (supabase as any).from("billing_events").insert({
    org_id:          orgId ?? null,
    stripe_event_id: event.id,
    event_type:      event.type,
    payload:         event.data.object,
    processed:       false,
  }).catch(console.error);

  if (!orgId) {
    return NextResponse.json({ received: true });
  }

  try {
    const sub = event.data.object as Stripe.Subscription;
    switch (event.type) {
      case "invoice.paid":
      case "customer.subscription.updated":
        await updateOrgPlan(supabase, orgId, sub);
        break;
      case "customer.subscription.deleted":
        await (supabase as any).from("organizations").update({
          plan: "free", subscription_status: "canceled", member_limit: 50,
        }).eq("id", orgId);
        break;
      case "invoice.payment_failed":
        await (supabase as any).from("organizations")
          .update({ subscription_status: "past_due" })
          .eq("id", orgId);
        break;
    }
    // Mark event as processed
    await (supabase as any).from("billing_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);
  } catch (err) {
    console.error("[billing/webhook] processing failed", err);
  }

  return NextResponse.json({ received: true });
}
