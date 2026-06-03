// Rules: R-FE-01, R-A11Y-01
// Spec: ux_ui/feature_specv2/terms_of_service_md.md

import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Community GreenToken Terms of Service — your agreement with our platform.",
};

const TERMS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: "By creating an account or using the Service, you agree to be bound by these Terms. Organizations must be legally authorized to accept these Terms on behalf of their entity. If you do not agree, do not use the Service.",
  },
  {
    id: "service-description",
    title: "2. Description of Service",
    body: "Community GreenToken is a SaaS platform that enables organizations to create and manage blockchain-based token reward programs for sustainable actions, powered by the Stellar blockchain (Soroban smart contracts).",
  },
  {
    id: "account-registration",
    title: "3. Account Registration",
    items: [
      "You must provide accurate and complete information when registering.",
      "You are responsible for maintaining the security of your account and Freighter wallet.",
      "One organization per subscription plan (unless Enterprise).",
      "Minimum age for account ownership: 18 years.",
    ],
  },
  {
    id: "billing",
    title: "4. Subscription and Billing",
    items: [
      "Subscriptions are billed monthly or annually via Stripe.",
      "Free trial: 14 days with full Pro feature access. No credit card required.",
      "After trial, accounts downgrade to Free plan unless upgraded.",
      "No refunds for partial months unless required by applicable law.",
      "We may change pricing with 30 days' notice.",
    ],
  },
  {
    id: "token-system",
    title: "5. Token System",
    items: [
      "GreenTokens (GTK) have no monetary value outside the platform.",
      "Tokens cannot be exchanged for fiat currency.",
      "Token balances may be reset if an organization is deleted.",
      "On-chain tokens are subject to the smart contract terms embedded in the Stellar blockchain.",
    ],
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable Use",
    body: "You must NOT:",
    items: [
      "Submit fraudulent or falsified eco-action evidence.",
      "Attempt to manipulate leaderboards or token balances.",
      "Share account credentials with unauthorized parties.",
      "Use automated bots or scripts to submit actions.",
      "Attempt to exploit, hack, or reverse-engineer our smart contracts.",
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    items: [
      "The platform software and branding are owned by Community GreenToken.",
      "Organizations retain ownership of their uploaded content (logos, custom action types).",
      "Our open-source smart contracts are licensed under MIT.",
    ],
  },
  {
    id: "availability",
    title: "8. Service Availability",
    items: [
      "We target 99.5% uptime but do not guarantee uninterrupted access.",
      "Scheduled maintenance windows will be communicated 24 hours in advance.",
      "No SLA for Free or Starter plans. SLA available on Enterprise.",
    ],
  },
  {
    id: "termination",
    title: "9. Termination",
    items: [
      "You may cancel your subscription at any time (effective end of billing period).",
      "We may terminate accounts for violation of these Terms.",
      "Upon termination, organization data is available for export for 30 days.",
    ],
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    body: "To the maximum extent permitted by applicable law, Community GreenToken shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of tokens or data.",
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    body: "These Terms are governed by the laws of South Africa. Disputes shall be resolved in Cape Town jurisdiction unless otherwise agreed in writing for Enterprise clients.",
  },
  {
    id: "changes",
    title: "12. Changes to Terms",
    body: "We may update these Terms with 30 days' notice via email and in-app notification. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.",
  },
];

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500">
            <time dateTime="2026-06-03">Effective date: 3 June 2026</time>
          </p>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            Please read these Terms of Service carefully before using Community GreenToken.
          </p>
        </div>

        {/* ToC */}
        <nav aria-label="Table of contents" className="bg-gray-50 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-gray-700 mb-3">Contents</p>
          <ol className="space-y-1.5 list-decimal list-inside">
            {TERMS.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                >
                  {t.title.replace(/^\d+\.\s/, "")}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {TERMS.map((t) => (
            <section key={t.id} id={t.id} aria-labelledby={`heading-${t.id}`}>
              <h2 id={`heading-${t.id}`} className="text-xl font-bold text-gray-900 mb-3 scroll-mt-20">
                {t.title}
              </h2>
              {t.body && <p className="text-sm text-gray-600 leading-relaxed mb-3">{t.body}</p>}
              {t.items && (
                <ul className="space-y-2">
                  {t.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            ⚠️ This is a template Terms of Service for hackathon purposes. Have a qualified legal professional
            review before production launch, especially regarding consumer protection laws in your jurisdiction.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Back to{" "}
            <Link href="/" className="text-primary-600 hover:underline">Home</Link>
            {" · "}
            <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
