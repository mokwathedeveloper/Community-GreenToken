// Rules: R-FE-01, R-FE-07, R-IMG-02, R-COLOR-02, R-A11Y-10 (FAQ accordion)
// Spec: ux_ui/feature_specv2/how_it_works_page_md.md
// Mockup: mockup/how_it_works_page_mockup.png

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";
import SharedBanner from "@/components/SharedBanner";

export const metadata: Metadata = { title: "How It Works" };

const STEPS = [
  { num: 1, icon: "✍️", title: "Sign Up",               desc: "Create your account in seconds and connect your Freighter wallet on Stellar." },
  { num: 2, icon: "♻️", title: "Submit a Sustainable Action", desc: "Share your eco-action and upload photo evidence for on-chain verification." },
  { num: 3, icon: "✅", title: "Verification",           desc: "Our community and AI review your action to ensure authenticity via ActionRegistry." },
  { num: 4, icon: "🪙", title: "Earn GreenTokens",       desc: "Once verified, you earn GTK tokens to your Stellar wallet. Instantly, on-chain." },
  { num: 5, icon: "🎁", title: "Redeem or Donate",       desc: "Redeem tokens for community rewards or donate to fund eco-projects transparently." },
];

const LIFECYCLE = [
  { icon: "📱", label: "Submit a sustainable action on the app" },
  { icon: "🔍", label: "Community & AI verify authenticity" },
  { icon: "⛓️", label: "Action recorded on Stellar blockchain" },
  { icon: "🪙", label: "GTK tokens minted to your wallet" },
  { icon: "🎁", label: "Redeem rewards or donate to causes" },
];

const FAQ = [
  { q: "How are actions verified?",       a: "Actions are verified through a combination of community voting, AI analysis, and photo evidence. Once verified, the result is stored permanently on the Stellar blockchain via our ActionRegistry contract." },
  { q: "What is a GreenToken?",           a: "A GreenToken (GTK) is a SEP-41 compliant digital token on the Stellar blockchain. Every GTK was earned by a verified real-world eco-action — there is no pre-minted supply." },
  { q: "Can I donate my tokens?",         a: "Yes! You can allocate your GTK tokens to any active community eco-project on the Donation Tracking page. Every donation is recorded on-chain for full transparency." },
  { q: "Is my data safe?",               a: "Your personal data is stored securely in our Supabase database with Row-Level Security. Only the cryptographic hash of your evidence photo is stored on the blockchain — never the photo itself." },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>

      {/* Hero — R-FE-07, R-IMG-02 */}
      <section className="relative min-h-[420px] flex items-center overflow-hidden">
        <Image
          src="/assets/image/pages/how-it-works/how_it_works_hero.png"
          alt="Eco-friendly illustration showing the global token lifecycle for sustainable actions"
          fill className="object-cover" priority sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center w-full">
          <h1 className="text-5xl font-extrabold text-white mb-4">How It Works</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Take climate action. Earn rewards. Make an impact.<br />
            Submit sustainable actions, get them verified, earn GreenTokens, and redeem or donate to fund a greener tomorrow.
          </p>
        </div>
      </section>

      {/* 5 Steps */}
      <section aria-labelledby="steps-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 id="steps-heading" className="text-3xl font-bold text-gray-900 text-center mb-14">
            Five Simple Steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-extrabold mb-3 z-10">
                  {step.num}
                </div>
                <div className="text-2xl mb-2" aria-hidden="true">{step.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GreenToken Lifecycle diagram — R-IMG-02 */}
      <section aria-labelledby="lifecycle-heading" className="py-16 bg-primary-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 id="lifecycle-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">
            The GreenToken Lifecycle
          </h2>
          <div className="relative">
            <Image
              src="/assets/image/pages/how-it-works/flow_diagram_background.png"
              alt="GreenToken lifecycle flow: Submit → Verify → Record on Stellar → Mint GTK → Redeem or Donate"
              width={1200} height={300}
              className="w-full rounded-2xl shadow-sm object-cover"
              loading="lazy"
            />
          </div>
          {/* Text fallback for screen readers — R-A11Y-02 */}
          <ol className="sr-only">
            {LIFECYCLE.map(({ icon, label }) => <li key={label}>{label}</li>)}
          </ol>
        </div>
      </section>

      {/* FAQ — R-A11Y-10: <details>/<summary> */}
      <section aria-labelledby="faq-heading" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-100 rounded-xl shadow-sm group">
                <summary className={[
                  "flex justify-between items-center px-6 py-4 cursor-pointer",
                  "text-sm font-medium text-gray-900 list-none",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded-xl",
                ].join(" ")}>
                  {q}
                  <span className="text-primary-500 text-lg ml-4 group-open:rotate-45 transition-transform duration-200" aria-hidden="true">+</span>
                </summary>
                <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <SharedBanner
        title="Ready to Make a Difference?"
        subtitle="Join thousands of changemakers building a greener tomorrow."
        ctaLabel="Get Started"
        ctaHref="/org/setup"
        secondaryCta={{ label: "Explore Network", href: "/impact" }}
        overlayStrength="dark"
      />
    </PublicLayout>
  );
}
