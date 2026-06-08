/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgOwner } from "@/lib/middleware/adminGuard";
import { parseBody, createCheckoutSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// POST /api/billing/create-checkout
// Rule R-SAAS-06: Stripe signature verified in webhook — checkout just creates session
// Spec: saas/billing_and_subscriptions.md Section 3

export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgOwner(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, createCheckoutSchema);
  if ("error" in parsed) return parsed.error;

  // Map planId → Stripe price ID server-side (env vars never exposed to client)
  const PLAN_PRICE_MAP: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro:     process.env.STRIPE_PRO_PRICE_ID,
  };
  const priceId = parsed.data.priceId ?? (parsed.data.planId ? PLAN_PRICE_MAP[parsed.data.planId] : undefined);

  if (!priceId || !priceId.startsWith("price_")) {
    return NextResponse.json(
      { error: { code: "MISSING_PRICE_ID", message: "Stripe price ID not configured. Set STRIPE_STARTER_PRICE_ID / STRIPE_PRO_PRICE_ID in environment variables." } },
      { status: 503 }
    );
  }

  // Always use orgId from JWT — never trust client-sent orgId (Rule R-SAAS-01)
  const orgId = auth!.orgId;

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase  = createAdminClient();

  // Get or create Stripe customer
  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("stripe_customer_id, name, slug")
    .eq("id", orgId)
    .single() as { data: { stripe_customer_id: string | null; name: string; slug: string } | null };

  if (!org) {
    return NextResponse.json(
      { error: { code: "ORG_NOT_FOUND", message: "Organization not found." } },
      { status: 404 }
    );
  }

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ name: org.name, metadata: { org_id: orgId } });
    customerId = customer.id;
    await (supabase as any).from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", orgId);
  }

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer:    customerId,
    mode:        "subscription",
    line_items:  [{ price: priceId, quantity: 1 }],
    success_url: `https://${org.slug}.${appDomain}/org/admin/billing?success=true`,
    cancel_url:  `https://${org.slug}.${appDomain}/org/admin/billing?canceled=true`,
    metadata:    { org_id: orgId },
  });

  return NextResponse.json({ data: { url: session.url } });
}
