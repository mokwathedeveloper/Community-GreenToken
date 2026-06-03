// Pricing page data — source of truth for all plan info
// Rule: all pricing data lives here, never hard-coded in components
// Owner: RockieRaheem | Spec: ux_ui/feature_specv2/pricing_page.md

export interface Plan {
  id:          string;
  name:        string;
  price:       { monthly: number | null; annual: number | null };
  description: string;
  badge?:      string;
  highlight:   boolean;
  features:    string[];
  cta:         string;
  href?:       string;
  priceId?:    string;  // Stripe price ID env key
}

export interface ComparisonRow {
  feature:    string;
  free:       boolean | string;
  starter:    boolean | string;
  pro:        boolean | string;
  enterprise: boolean | string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SocialProofOrg {
  name:  string;
  emoji: string;
  desc:  string;
}

// ── Plans ─────────────────────────────────────────────────────────────────────
export const PLANS: Plan[] = [
  {
    id:          "free",
    name:        "FREE",
    price:       { monthly: 0, annual: 0 },
    description: "Perfect for getting started",
    highlight:   false,
    features:    [
      "50 members",
      "3 action types",
      "Basic leaderboard",
      "Community dashboard",
      "14-day Pro trial included",
    ],
    cta:  "Start Free",
    href: "/org/setup",
  },
  {
    id:          "starter",
    name:        "STARTER",
    price:       { monthly: 49, annual: 490 },
    description: "For growing organizations",
    highlight:   false,
    features:    [
      "500 members",
      "10 action types",
      "Analytics dashboard",
      "Custom token name & symbol",
      "Email support",
    ],
    cta:     "Get Started",
    priceId: "STRIPE_STARTER_PRICE_ID",
  },
  {
    id:          "pro",
    name:        "PRO",
    price:       { monthly: 199, annual: 1990 },
    description: "For serious impact at scale",
    badge:       "MOST POPULAR",
    highlight:   true,
    features:    [
      "5,000 members",
      "Unlimited action types",
      "White-label branding",
      "API access",
      "Per-org smart contract",
      "Priority support",
    ],
    cta:     "Get Started",
    priceId: "STRIPE_PRO_PRICE_ID",
  },
];

// Enterprise is separate — full-width row below the 3-card grid
export const ENTERPRISE_PLAN: Plan = {
  id:          "enterprise",
  name:        "ENTERPRISE",
  price:       { monthly: null, annual: null },
  description: "Custom needs and dedicated support for large organizations",
  highlight:   false,
  features:    [
    "Unlimited members",
    "Custom integrations",
    "Dedicated smart contract",
    "SLA guarantee",
    "Dedicated onboarding call",
    "Custom reporting",
  ],
  cta:  "Contact Us",
  href: "mailto:hello@greentoken.app",
};

// ── Feature comparison ────────────────────────────────────────────────────────
export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Members",              free: "50",    starter: "500",   pro: "5,000",    enterprise: "Unlimited" },
  { feature: "Action types",         free: "3",     starter: "10",    pro: "Unlimited", enterprise: "Custom"    },
  { feature: "Custom token name",    free: false,   starter: true,    pro: true,        enterprise: true        },
  { feature: "Analytics dashboard",  free: false,   starter: true,    pro: true,        enterprise: true        },
  { feature: "White-label branding", free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "API access",           free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "Per-org contract",     free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "Priority support",     free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "SLA / Onboarding",     free: false,   starter: false,   pro: false,       enterprise: true        },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is there a free trial?",
    a: "Yes — all new organizations start with a 14-day Pro trial, no credit card required. After the trial, you stay on the Free plan unless you upgrade.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time from your Billing page. Changes take effect immediately with prorated billing.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe. Enterprise customers can arrange annual invoicing.",
  },
  {
    q: "Does GreenToken work with Stellar?",
    a: "Yes — every GTK token is minted on the Stellar blockchain using Soroban smart contracts. Tokens live in your Freighter wallet and are fully on-chain.",
  },
  {
    q: "What happens when the trial ends?",
    a: "You drop to the Free plan (50 members, 3 action types) automatically. Your data is preserved. Upgrade any time to restore Pro features.",
  },
  {
    q: "Is annual billing a commitment?",
    a: "Annual plans are billed once per year and save you 2 months. You can cancel before the renewal date for a full refund of any unused months.",
  },
];

// ── Social Proof ──────────────────────────────────────────────────────────────
export const SOCIAL_PROOF_ORGS: SocialProofOrg[] = [
  { name: "EcoPlanet",   emoji: "🌍", desc: "500+ members" },
  { name: "EarthFirst",  emoji: "🌱", desc: "Municipality" },
  { name: "GreenMoment", emoji: "🌿", desc: "NGO" },
  { name: "NatureCare",  emoji: "🦋", desc: "School network" },
  { name: "CleanCity",   emoji: "🏙️", desc: "Corporate" },
  { name: "ReLeaf SA",   emoji: "🍃", desc: "Community org" },
];

// ── Annual savings helpers ────────────────────────────────────────────────────
export function annualSavings(plan: Plan): number {
  if (!plan.price.monthly || !plan.price.annual) return 0;
  return plan.price.monthly * 12 - plan.price.annual;
}

export function monthlyFromAnnual(plan: Plan): number {
  if (!plan.price.annual) return 0;
  return Math.round(plan.price.annual / 12);
}
