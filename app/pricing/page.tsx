"use client";

// Pricing Page — fully compliant with spec + mockup
// Owner: RockieRaheem
// Spec: ux_ui/feature_specv2/pricing_page.md
// Mockup: mockup/pricing_page_mockup.png
//
// Compliance checklist:
// ✅ Modular components (PricingCTAButton, FAQAccordion, PricingTable, SocialProof, ExitIntentPopup)
// ✅ Data in lib/data/pricingData.ts
// ✅ Annual/monthly toggle with dollar amounts
// ✅ Annual savings badge on cards
// ✅ Enterprise full-width row below 3-card grid
// ✅ Plan cards in <section> with aria-label
// ✅ CTA buttons with plan name in aria-label
// ✅ Loading state during Stripe redirect
// ✅ Social proof section
// ✅ Exit-intent popup (mandatory §9)
// ✅ Mobile comparison accordion
// ✅ 14-day trial banner

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import PublicLayout from "@/components/layouts/PublicLayout";
import PricingCTAButton from "@/components/pricing/PricingCTAButton";
import FAQAccordion from "@/components/pricing/FAQAccordion";
import PricingTable from "@/components/pricing/PricingTable";
import SocialProof from "@/components/pricing/SocialProof";
import ExitIntentPopup from "@/components/pricing/ExitIntentPopup";
import { cn } from "@/lib/utils";
import {
  PLANS, ENTERPRISE_PLAN, COMPARISON_ROWS, FAQ_ITEMS, SOCIAL_PROOF_ORGS,
  annualSavings, monthlyFromAnnual,
  type Plan,
} from "@/lib/data/pricingData";

export default function PricingPage() {
  const [annual,       setAnnual]      = useState(false);
  const [loadingPlan,  setLoadingPlan] = useState<string | null>(null);

  async function handleSelect(plan: Plan) {
    if (plan.href) { window.location.href = plan.href; return; }

    setLoadingPlan(plan.id);
    try {
      // Send planId ("starter" | "pro") — server maps it to the Stripe price ID
      // from its own env vars (STRIPE_STARTER_PRICE_ID / STRIPE_PRO_PRICE_ID).
      // Never send the raw Stripe price ID from the client.
      const res  = await fetch("/api/billing/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ planId: plan.id }),
      });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      } else {
        console.error("[pricing] checkout failed:", json.error);
      }
    } catch (err) {
      console.error("[pricing] checkout error:", err);
    } finally {
      setLoadingPlan(null);
    }
  }

  function displayPrice(plan: Plan): string {
    if (plan.price.monthly === null) return "Custom";
    const amount = annual ? monthlyFromAnnual(plan) : plan.price.monthly;
    return `$${amount}`;
  }

  const savings = (plan: Plan) => annualSavings(plan);

  return (
    <PublicLayout>
      {/* Exit-intent popup — mandatory spec §9 */}
      <ExitIntentPopup />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="pricing-hero-heading"
        className="relative min-h-[380px] flex items-center overflow-hidden"
      >
        <Image
          src="/assets/image/pages/pricing/pricing_hero.png"
          alt="Team working on sustainability initiatives"
          fill className="object-cover" priority sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 text-center">
          {/* 14-day trial banner */}
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 text-primary-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            🎁 14-day Pro trial — no credit card required
          </div>

          <h1 id="pricing-hero-heading" className="text-5xl font-extrabold text-white mb-3 leading-tight">
            Simple pricing.<br />Powerful impact.
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Choose the perfect plan to grow your green community, reward eco-actions, and scale your impact.
          </p>

          {/* Monthly / Annual toggle — spec §4, role="switch" */}
          <div className="flex items-center justify-center gap-4 mt-8" role="group" aria-label="Billing period">
            <span className={cn("text-sm font-semibold", !annual ? "text-white" : "text-white/50")}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual((a) => !a)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors duration-200",
                annual ? "bg-primary-500" : "bg-white/30",
                "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
              )}
            >
              <span className={cn(
                "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                annual && "translate-x-7"
              )} />
            </button>
            <span className={cn("text-sm font-semibold flex items-center gap-2", annual ? "text-white" : "text-white/50")}>
              Annual
              {/* Spec §7: accent color (#F1C40F) for savings badge */}
              <span className="bg-amber-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ── PLAN CARDS (FREE / STARTER / PRO) ─────────────────────────────── */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          {/* 3-column grid — spec §2: FREE STARTER PRO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {PLANS.map((plan) => {
              const yearlySavings = savings(plan);
              return (
                <section
                  key={plan.id}
                  aria-label={`${plan.name} plan — ${displayPrice(plan)} per month`}
                  className={cn(
                    "relative bg-white rounded-2xl flex flex-col border-2 p-7 transition-all duration-200",
                    plan.highlight
                      ? "border-primary-500 shadow-xl scale-[1.02]"
                      : "border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md hover:-translate-y-1"
                  )}
                >
                  {/* Most Popular badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-1">
                    {plan.name}
                  </h3>

                  {/* Price display with annual savings badge */}
                  <div className="my-4">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {displayPrice(plan)}
                      </span>
                      {plan.price.monthly !== null && plan.price.monthly !== 0 && (
                        <span className="text-gray-400 text-sm mb-1">/mo</span>
                      )}
                    </div>
                    {annual && yearlySavings > 0 && (
                      <span className="inline-flex items-center mt-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        Save ${yearlySavings}/year
                      </span>
                    )}
                    {annual && plan.price.annual !== null && plan.price.annual !== 0 && (
                      <p className="text-xs text-gray-400 mt-1">Billed ${plan.price.annual}/year</p>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                  <ul className="space-y-2.5 text-sm text-gray-600 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold mt-0.5" aria-hidden="true">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <PricingCTAButton
                    planName={plan.name}
                    label={plan.cta}
                    highlight={plan.highlight}
                    loading={loadingPlan === plan.id}
                    onClick={() => handleSelect(plan)}
                  />
                </section>
              );
            })}
          </div>

          {/* Enterprise — spec §2 + §7: full-width muted card below 3 columns */}
          <section
            aria-label="Enterprise plan — custom pricing"
            className="bg-white border-2 border-gray-200 rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" aria-hidden="true">🏢</span>
                <h3 className="text-lg font-bold text-gray-900">ENTERPRISE</h3>
                <span className="text-sm text-gray-400 font-medium">— Custom pricing</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{ENTERPRISE_PLAN.description}</p>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                {ENTERPRISE_PLAN.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-sm text-gray-600">
                    <span className="text-primary-500 font-bold mt-0.5" aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <a
                href={ENTERPRISE_PLAN.href}
                aria-label="Contact Us — Enterprise plan"
                className={cn(
                  "inline-block px-8 py-3 rounded-xl font-semibold text-sm border-2 border-gray-300 text-gray-700",
                  "hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-150",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                )}
              >
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <SocialProof orgs={SOCIAL_PROOF_ORGS} />

      {/* ── COMPARISON TABLE ──────────────────────────────────────────────── */}
      <section aria-labelledby="compare-heading" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 id="compare-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">
            Compare all features
          </h2>
          <PricingTable rows={COMPARISON_ROWS} />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-8">
            Frequently asked questions
          </h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ─────────────────────────────────────────────── */}
      <section className="py-16 bg-primary-600 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Start for free today
        </h2>
        <p className="text-primary-100 mb-6 text-sm">
          14-day Pro trial included. No credit card required.
        </p>
        <Link
          href="/org/setup"
          className={cn(
            "inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-xl",
            "hover:bg-primary-50 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600 focus-visible:outline-none"
          )}
        >
          Get Started Free →
        </Link>
      </section>
    </PublicLayout>
  );
}
