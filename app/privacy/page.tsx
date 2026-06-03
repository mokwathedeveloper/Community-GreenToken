// Rules: R-FE-01, R-A11Y-01
// Spec: ux_ui/feature_specv2/privacy_policy_md.md

import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Community GreenToken Privacy Policy — how we collect, use, and protect your data.",
};

const SECTIONS = [
  {
    id: "data-we-collect",
    title: "1. Data We Collect",
    content: [
      "**Account info:** name, email address, and wallet public key (G... address).",
      "**Usage data:** eco-actions submitted, tokens earned, leaderboard rankings, and donation records.",
      "**Billing data:** processed by Stripe. We never store card numbers — only a Stripe Customer ID reference.",
      "**Blockchain data:** every verified action and token transaction is publicly visible on the Stellar blockchain by design.",
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Data",
    content: [
      "Provide, improve, and secure the GreenToken platform.",
      "Process token rewards and redemptions.",
      "Send transactional emails (action confirmed, trial expiring, payment receipts).",
      "Comply with applicable legal obligations.",
    ],
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing",
    content: [
      "**Supabase:** database and authentication hosting. Supabase processes data under its own DPA.",
      "**Stripe:** payment processing. Stripe has its own privacy policy and DPA.",
      "**Stellar Network:** action verification and token records are on-chain (public by nature).",
      "We never sell personal data to third parties.",
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: [
      "Active account data is retained while your account exists.",
      "Deleted organization data is purged within 30 days of deletion request.",
      "Blockchain records are immutable and cannot be deleted by nature.",
    ],
  },
  {
    id: "your-rights",
    title: "5. Your Rights (POPIA / GDPR)",
    content: [
      "**Access:** Request a copy of your personal data.",
      "**Correction:** Request corrections to inaccurate data.",
      "**Deletion:** Request deletion of your data (subject to blockchain immutability).",
      "**Portability:** Export your data as CSV from your account settings.",
      "**Object:** Object to certain processing activities.",
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies",
    content: [
      "Session cookies for authentication only — no advertising or tracking cookies.",
      "Analytics (if enabled) use privacy-preserving aggregate data only.",
    ],
  },
  {
    id: "security",
    title: "7. Security",
    content: [
      "All data is encrypted at rest and in transit (TLS 1.3).",
      "Supabase Row-Level Security enforces data isolation per organization.",
      "Smart contracts are audited before mainnet deployment.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact",
    content: [
      "Privacy questions: privacy@greentoken.app",
      "Data Protection Officer: [Name], [Country]",
    ],
  },
];

function renderContent(text: string) {
  if (text.startsWith("**")) {
    const [bold, ...rest] = text.split(":**");
    return (
      <span>
        <strong>{bold.replace("**", "")}</strong>:
        {rest.join(":").replace("**", "")}
      </span>
    );
  }
  return <span>{text}</span>;
}

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500">
            <time dateTime="2026-06-03">Last updated: 3 June 2026</time>
          </p>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            This Privacy Policy explains how Community GreenToken (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;)
            collects, uses, and protects your personal information when you use our platform.
          </p>
        </div>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="bg-gray-50 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-gray-700 mb-3">Contents</p>
          <ol className="space-y-1.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`heading-${s.id}`}>
              <h2 id={`heading-${s.id}`} className="text-xl font-bold text-gray-900 mb-4 scroll-mt-20">
                {s.title}
              </h2>
              <ul className="space-y-2">
                {s.content.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true">•</span>
                    {renderContent(item)}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            ⚠️ This is a template privacy policy for hackathon purposes. Have a qualified legal professional
            review before production launch, especially for POPIA (South Africa) and GDPR (EU) compliance.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Back to{" "}
            <Link href="/" className="text-primary-600 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              Home
            </Link>
            {" · "}
            <Link href="/terms" className="text-primary-600 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
