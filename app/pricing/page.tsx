"use client";

// Rules: R-FE-01, R-COLOR-02, R-A11Y-01, R-A11Y-10 (FAQ accordion), R-FE-08
// Spec: ux_ui/feature_specv2/pricing_page_md.md
// Mockup: mockup/pricing_page_mockup.png

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/layouts/PublicLayout";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "FREE", price: { monthly: 0, annual: 0 }, highlight: false,
    description: "Perfect for getting started",
    features: ["50 members", "3 action types", "Basic leaderboard", "Community dashboard", "14-day Pro trial"],
    cta: "Start Free", href: "/org/setup",
  },
  {
    name: "STARTER", price: { monthly: 49, annual: 490 }, highlight: false,
    description: "For growing your org in scale",
    badge: "",
    features: ["500 members", "10 action types", "Analytics dashboard", "Custom token name/symbol", "Email support"],
    cta: "Get Started", priceId: "starter",
  },
  {
    name: "PRO", price: { monthly: 199, annual: 1990 }, highlight: true,
    description: "For serious impact at scale",
    badge: "MOST POPULAR",
    features: ["5,000 members", "Unlimited actions", "White-label branding", "API access", "Per-org smart contract", "Priority support"],
    cta: "Get Started", priceId: "pro",
  },
  {
    name: "ENTERPRISE", price: { monthly: null, annual: null }, highlight: false,
    description: "Custom needs and dedicated support",
    features: ["Unlimited members", "Custom integrations", "Dedicated contract", "SLA guarantee", "Onboarding call"],
    cta: "Contact Us", href: "mailto:hello@greentoken.app",
  },
];

const COMPARISON_ROWS = [
  { feature: "Members",             free: "50",    starter: "500",   pro: "5,000",    enterprise: "Unlimited" },
  { feature: "Action types",        free: "3",     starter: "10",    pro: "Unlimited", enterprise: "Custom"    },
  { feature: "Custom token name",   free: false,   starter: true,    pro: true,        enterprise: true        },
  { feature: "Analytics dashboard", free: false,   starter: true,    pro: true,        enterprise: true        },
  { feature: "White-label",         free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "API access",          free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "Per-org contract",    free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "Priority support",    free: false,   starter: false,   pro: true,        enterprise: true        },
  { feature: "SLA / Onboarding",    free: false,   starter: false,   pro: false,       enterprise: true        },
];

const FAQ_PRICING = [
  { q: "Is there a free trial?",      a: "Yes — all new organizations start with a 14-day Pro trial, no credit card required. After the trial, you stay on the Free plan unless you upgrade." },
  { q: "Can I switch plans later?",   a: "Absolutely. You can upgrade or downgrade at any time from your Billing page. Changes take effect immediately." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe. Enterprise customers can arrange invoicing." },
  { q: "Does GreenToken work with Stellar?", a: "Yes — every token is minted on the Stellar blockchain using Soroban smart contracts. You own your GTK in your Freighter wallet." },
];

function CheckIcon() {
  return <span className="text-primary-500 font-bold text-sm" aria-hidden="true">✓</span>;
}
function CrossIcon() {
  return <span className="text-gray-300 text-sm" aria-hidden="true">–</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  async function handleSelect(plan: typeof PLANS[0]) {
    if (plan.href) { window.location.href = plan.href; return; }
    // Phase 2: POST /api/billing/create-checkout with { priceId }
    alert(`Stripe checkout for ${plan.name} — wired in Phase 2`);
  }

  return (
    <PublicLayout>
      {/* Hero — R-IMG-02 */}
      <section className="relative min-h-[360px] flex items-center overflow-hidden">
        <Image src="/assets/image/pages/pricing/pricing_hero.png"
          alt="Collaborative eco-friendly workspace for organizations choosing their sustainability plan"
          fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 text-primary-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            🎁 14-day Pro trial — no credit card required
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3">Simple pricing.<br />Powerful impact.</h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Choose the perfect plan to grow your green community, reward positive actions, and scale your impact.
          </p>

          {/* Monthly / Annual toggle — R-A11Y-01 */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cn("text-sm font-medium", !annual ? "text-white" : "text-white/60")}>Monthly</span>
            <button
              role="switch" aria-checked={annual}
              onClick={() => setAnnual((a) => !a)}
              className={cn("relative w-12 h-6 rounded-full transition-colors duration-200",
                annual ? "bg-primary-500" : "bg-white/30",
                "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
              )}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                annual && "translate-x-6")} />
            </button>
            <span className={cn("text-sm font-medium", annual ? "text-white" : "text-white/60")}>
              Annual <span className="ml-1 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Save 17%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section aria-labelledby="plans-heading" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 id="plans-heading" className="sr-only">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name}
                className={cn("relative bg-white rounded-2xl flex flex-col border-2 p-7 transition-all",
                  plan.highlight ? "border-primary-500 shadow-lg" : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
                )}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">{plan.badge}</span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="my-4">
                  {plan.price.monthly === null
                    ? <p className="text-3xl font-bold text-gray-900">Custom</p>
                    : <p className="text-3xl font-bold text-gray-900">
                        <span className="text-lg font-normal text-gray-400">$</span>
                        {annual ? Math.round((plan.price.annual ?? 0) / 12) : plan.price.monthly}
                        <span className="text-sm font-normal text-gray-400">/mo</span>
                      </p>
                  }
                  {annual && plan.price.annual && (
                    <p className="text-xs text-gray-400 mt-1">Billed ${plan.price.annual}/year</p>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                <ul className="space-y-2.5 text-sm text-gray-600 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckIcon />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelect(plan)}
                  className={cn("w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150",
                    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
                    plan.highlight
                      ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                      : "border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
                  )}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section aria-labelledby="compare-heading" className="py-20 bg-white overflow-x-auto">
        <div className="max-w-5xl mx-auto px-6">
          <h2 id="compare-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">Compare all features</h2>
          <table className="w-full text-sm">
            <caption className="sr-only">Feature comparison across all pricing plans</caption>
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="text-left py-3 text-gray-500 font-medium w-1/3">Features</th>
                {["Free", "Starter", "Pro", "Enterprise"].map((h) => (
                  <th key={h} scope="col" className="text-center py-3 text-gray-700 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {COMPARISON_ROWS.map(({ feature, free, starter, pro, enterprise }) => (
                <tr key={feature} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-gray-700">{feature}</td>
                  {[free, starter, pro, enterprise].map((val, i) => (
                    <td key={i} className="py-3 text-center">
                      {typeof val === "boolean"
                        ? (val ? <CheckIcon /> : <CrossIcon />)
                        : <span className="text-gray-700">{val}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ — R-A11Y-10 */}
      <section aria-labelledby="faq-pricing-heading" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 id="faq-pricing-heading" className="text-2xl font-bold text-gray-900 mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ_PRICING.map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-100 rounded-xl shadow-sm group">
                <summary className="flex justify-between items-center px-6 py-4 cursor-pointer text-sm font-medium text-gray-900 list-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded-xl">
                  {q}
                  <span className="text-primary-500 text-lg ml-4 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
