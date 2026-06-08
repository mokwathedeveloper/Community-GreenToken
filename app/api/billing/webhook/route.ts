/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// POST /api/billing/webhook
// Rule R-SAAS-06: MUST verify Stripe signature — reject unsigned events with 400
// Fix: PLAN_MAP now covers all 4 plans; trial_will_end event handled

// ── Plan configuration ─────────────────────────────────────────────────────
const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID    ?? "price_starter"]:    "starter",
  [process.env.STRIPE_PRO_PRICE_ID        ?? "price_pro"]:        "pro",
  [process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "price_enterprise"]: "enterprise",
};

const MEMBER_LIMITS: Record<string, number> = {
  free:       50,
  starter:    500,
  pro:        5000,
  enterprise: 999999, // effectively unlimited
};

function planFromPriceId(priceId: string): string {
  return PLAN_MAP[priceId] ?? "free";
}

async function updateOrgPlan(
  supabase: ReturnType<typeof createAdminClient>,
  orgId:    string,
  sub:      Stripe.Subscription
) {
  const priceId = sub.items?.data[0]?.price?.id ?? "";
  const plan    = planFromPriceId(priceId);

  await (supabase as any).from("organizations").update({
    plan,
    subscription_status:    sub.status,
    stripe_subscription_id: sub.id,
    member_limit:           MEMBER_LIMITS[plan] ?? 50,
    updated_at:             new Date().toISOString(),
  }).eq("id", orgId);
}

// ── Webhook handler ────────────────────────────────────────────────────────
// Stripe requires the raw text body for signature verification
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[billing/webhook] signature verification failed:", err);
    return NextResponse.json(
      { error: { code: "INVALID_SIGNATURE", message: "Webhook signature verification failed." } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Extract org_id safely from event metadata
  const obj   = event.data.object as unknown as Record<string, unknown>;
  const orgId = (obj?.metadata as Record<string, string> | undefined)?.org_id
    ?? (obj?.subscription_details as any)?.metadata?.org_id as string | undefined;

  // ── Audit log every event ─────────────────────────────────────────────────
  await (supabase as any).from("billing_events").insert({
    org_id:          orgId ?? null,
    stripe_event_id: event.id,
    event_type:      event.type,
    amount_cents:    (obj?.amount_paid ?? obj?.amount ?? null) as number | null,
    currency:        (obj?.currency ?? null) as string | null,
    status:          (obj?.status   ?? null) as string | null,
    metadata:        { event_type: event.type, livemode: event.livemode },
    processed:       false,
  }).catch((e: unknown) => console.error("[billing/webhook] audit log failed:", e));

  if (!orgId) {
    // Log but don't fail — some events (e.g. customer.created) don't have org_id yet
    console.warn(`[billing/webhook] no org_id in event ${event.id} (${event.type})`);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {

      case "invoice.paid":
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await updateOrgPlan(supabase, orgId, sub);
        break;
      }

      case "customer.subscription.deleted": {
        await (supabase as any).from("organizations").update({
          plan:                "free",
          subscription_status: "canceled",
          member_limit:        50,
          updated_at:          new Date().toISOString(),
        }).eq("id", orgId);
        break;
      }

      case "invoice.payment_failed": {
        await (supabase as any).from("organizations")
          .update({ subscription_status: "past_due", updated_at: new Date().toISOString() })
          .eq("id", orgId);
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Trial ends in 3 days — send notification via Supabase email or dashboard alert
        const sub          = event.data.object as Stripe.Subscription;
        const trialEndsAt  = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;

        await (supabase as any).from("organizations").update({
          trial_ends_at: trialEndsAt,
          updated_at:    new Date().toISOString(),
        }).eq("id", orgId);

        // Log for admin dashboard notification
        console.info(`[billing/webhook] trial_will_end for org ${orgId}, ends ${trialEndsAt}`);
        break;
      }

      default:
        // Unknown event type — logged in audit table, no action needed
        break;
    }

    // Mark event as processed
    await (supabase as any).from("billing_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id)
      .catch(console.error);

  } catch (err) {
    console.error(`[billing/webhook] processing failed for ${event.type}:`, err);
    // Return 200 to prevent Stripe retries for processing errors
    // Unprocessed events remain in billing_events with processed=false for retry
  }

  return NextResponse.json({ received: true });
}
