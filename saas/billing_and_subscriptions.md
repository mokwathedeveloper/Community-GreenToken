# Community GreenToken — Billing and Subscriptions

## Billing Stack: Stripe

Stripe handles all subscription logic. The backend stores minimal billing data (`stripe_customer_id`, `stripe_subscription_id`, `plan`) in the `organizations` table and listens to Stripe webhooks for real-time state changes.

---

## 1. Subscription Plans

| Plan | Price | Members | Features |
|---|---|---|---|
| **Free** | $0/month | 50 | Basic dashboard, 3 action types, community leaderboard |
| **Starter** | $49/month | 500 | Analytics, custom token name/symbol, 10 action types |
| **Pro** | $199/month | 5,000 | White-label, custom branding, API access, priority support |
| **Enterprise** | Custom | Unlimited | Dedicated contract, SLA, custom integrations, onboarding call |

### Stripe Product IDs (set in `.env.local`)
```env
STRIPE_FREE_PRICE_ID=price_free_placeholder
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
```

---

## 2. Billing Flow

```
Org Admin clicks "Upgrade to Pro"
         │
         ▼
POST /api/billing/create-checkout  →  Stripe creates Checkout Session
         │
         ▼
User redirected to Stripe-hosted Checkout page
         │
         ▼
Payment confirmed → Stripe fires webhook: invoice.paid
         │
         ▼
POST /api/billing/webhook  →  Update organizations SET plan='pro'
         │
         ▼
Org Admin redirected to /billing?success=true
         │
         ▼
New plan features unlock immediately (plan_limits enforced in API)
```

---

## 3. API Routes

### Create Checkout Session
```typescript
// POST /api/billing/create-checkout
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId, orgId } = await req.json();

  // Get or create Stripe customer for the org
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, slug, name')
    .eq('id', orgId)
    .single();

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ name: org.name });
    customerId = customer.id;
    await supabase.from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', orgId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `https://${org.slug}.greentoken.app/billing?success=true`,
    cancel_url:  `https://${org.slug}.greentoken.app/billing?canceled=true`,
    metadata: { org_id: orgId },
  });

  return Response.json({ url: session.url });
}
```

### Stripe Webhook Handler
```typescript
// POST /api/billing/webhook
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Webhook signature invalid', { status: 400 });
  }

  const orgId = (event.data.object as any).metadata?.org_id;

  switch (event.type) {
    case 'invoice.paid':
    case 'customer.subscription.updated':
      await updateOrgPlan(orgId, event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await downgradeOrg(orgId);
      break;
    case 'invoice.payment_failed':
      await markOrgPastDue(orgId);
      break;
  }

  // Log every event for audit
  await supabase.from('billing_events').insert({
    org_id: orgId,
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object,
    processed: true,
  });

  return new Response('OK');
}

async function updateOrgPlan(orgId: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0].price.id;
  const planMap: Record<string, string> = {
    [process.env.STRIPE_STARTER_PRICE_ID!]: 'starter',
    [process.env.STRIPE_PRO_PRICE_ID!]:     'pro',
  };
  const plan = planMap[priceId] || 'free';
  const limits: Record<string, number> = { free: 50, starter: 500, pro: 5000 };

  await supabase.from('organizations').update({
    plan,
    subscription_status: sub.status,
    stripe_subscription_id: sub.id,
    member_limit: limits[plan],
  }).eq('id', orgId);
}

async function downgradeOrg(orgId: string) {
  await supabase.from('organizations')
    .update({ plan: 'free', subscription_status: 'canceled', member_limit: 50 })
    .eq('id', orgId);
}

async function markOrgPastDue(orgId: string) {
  await supabase.from('organizations')
    .update({ subscription_status: 'past_due' })
    .eq('id', orgId);
}
```

### Customer Portal (self-serve billing management)
```typescript
// POST /api/billing/portal
export async function POST(req: Request) {
  const { orgId } = await req.json();
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, slug')
    .eq('id', orgId)
    .single();

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `https://${org.slug}.greentoken.app/billing`,
  });

  return Response.json({ url: session.url });
}
```

---

## 4. Plan Enforcement in API Routes

Every API route that has plan-gated features must check the org's plan:

```typescript
// Utility: check plan limits
async function checkPlanLimit(orgId: string, feature: keyof PlanLimits) {
  const { data: org } = await supabase
    .from('organizations')
    .select('plan, member_limit, subscription_status')
    .eq('id', orgId)
    .single();

  if (org.subscription_status === 'canceled' || org.subscription_status === 'past_due') {
    throw new Error('Subscription inactive. Please update billing.');
  }

  const { data: limits } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', org.plan)
    .single();

  return limits;
}

// Example: block analytics on free plan
if (feature === 'analytics' && !limits.analytics) {
  return Response.json({ error: 'Upgrade to Starter to access Analytics' }, { status: 403 });
}
```

---

## 5. Free Trial Logic

All new organizations get a **14-day Pro trial**:

```typescript
// On org creation
await supabase.from('organizations').insert({
  ...orgData,
  plan: 'pro',                                   // trial as Pro
  subscription_status: 'trialing',
  trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
});
```

Cron job (daily) to downgrade expired trials:
```sql
-- Supabase scheduled function / Vercel cron
UPDATE organizations
SET plan = 'free', subscription_status = 'active', member_limit = 50
WHERE subscription_status = 'trialing'
  AND trial_ends_at < NOW()
  AND stripe_subscription_id IS NULL;
```

---

## 6. Billing UI Components

| Component | Route | Purpose |
|---|---|---|
| `PricingTable` | `/pricing` | Public plan comparison |
| `BillingCard` | `/billing` | Current plan, usage, upgrade button |
| `UpgradeModal` | All pages | Triggered when plan limit hit |
| `TrialBanner` | All org pages | Shows "X days left in trial" |
| `InvoiceList` | `/billing` | Past invoices via Stripe portal |
