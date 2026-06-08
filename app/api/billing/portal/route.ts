/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgOwner } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// POST /api/billing/portal — open Stripe Customer Portal

export async function POST() {
  const auth  = await getAuthContext();
  const guard = requireOrgOwner(auth);
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("stripe_customer_id, slug")
    .eq("id", auth!.orgId)
    .single() as { data: { stripe_customer_id: string | null; slug: string } | null };

  if (!org?.stripe_customer_id) {
    return NextResponse.json(
      { error: { code: "NO_CUSTOMER", message: "No billing account found. Please subscribe first." } },
      { status: 404 }
    );
  }

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer:   org.stripe_customer_id,
    return_url: `https://${org.slug}.${appDomain}/org/admin/billing`,
  });

  return NextResponse.json({ data: { url: session.url } });
}
