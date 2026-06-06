import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

// Google Material Icons style — filled SVG paths matching mockup

function IconPersonAdd() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}
function IconVerifyShield() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
  );
}
function IconEarnToken() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  );
}
function IconRedeem() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.73 0 13.45 0 12.07 0 10.89.7 10 1.77 9.1.7 7.93 0 6.55 0 4.27 0 2 2.06 2 4.64 2 5.12 2.12 5.56 2.18 6H0v14h24V6h-4zm-7-4c.95 0 1.64.68 1.64 1.64 0 1.07-.7 1.62-1.64 1.73V6h-1.36v-.63c-.94-.11-1.64-.66-1.64-1.73C11.36 2.68 12.05 2 13 2zM6.55 2c.95 0 1.64.68 1.64 1.64 0 1.07-.7 1.62-1.64 1.73V6H5.19v-.63c-.94-.11-1.64-.66-1.64-1.73C3.55 2.68 4.24 2 5.19 2H6.55zM2 18V8h9v10H2zm11 0V8h9v10h-9z"/>
    </svg>
  );
}
function IconChainLink() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"/>
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71c.51-1.2 1.06-2.38 1.78-3.47C9.09 20.44 11.43 21 14 21c4.97 0 9-4.03 9-9V3C19 4.5 17 8 17 8z"/>
    </svg>
  );
}

const STEPS = [
  { num: 1, IconComp: IconPersonAdd, bg: "bg-green-500",   title: "Take Action",         desc: "Sign up and log your first eco-friendly action in your community." },
  { num: 2, IconComp: IconVerifyShield, bg: "bg-blue-500", title: "Verify Your Action",  desc: "Community & AI verify your submission. Evidence stored on Stellar." },
  { num: 3, IconComp: IconEarnToken, bg: "bg-amber-500",   title: "Earn GreenTokens",    desc: "Verified actions trigger GreenToken.mint() — tokens go to your wallet." },
  { num: 4, IconComp: IconRedeem,    bg: "bg-purple-500",  title: "Redeem or Donate",    desc: "Spend tokens on rewards or donate to community eco-projects." },
];

const TRUST_CARDS = [
  {
    IconComp: IconChainLink,
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    title: "Blockchain Transparency",
    desc: "Every action, token, and donation is permanently recorded on Stellar. Anyone can verify the data.",
  },
  {
    IconComp: IconLeaf,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "Measurable Sustainability",
    desc: "Real-time metrics: trees planted, CO₂ offset, waste collected — all backed by on-chain proof.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-14">
          <h2 id="how-heading" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            How Community GreenToken Works
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            From your first eco-action to a permanent blockchain record — in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-0 mb-14">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0">
              <div className="flex flex-col items-center text-center w-44 lg:w-40 px-2">
                <div className={`relative w-16 h-16 rounded-full ${step.bg} flex items-center justify-center shadow-md mb-4 ring-4 ring-white`}>
                  <step.IconComp />
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-gray-200 text-xs font-extrabold text-gray-700 flex items-center justify-center shadow-sm">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div aria-hidden="true" className="hidden lg:flex items-center pb-10 flex-shrink-0 px-2">
                  <ArrowRight className="w-6 h-6 text-primary-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust section */}
        <p className="text-center text-xs font-bold text-primary-600 uppercase tracking-widest mb-6">
          Built on Trust. Driven by Impact.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {TRUST_CARDS.map(({ IconComp, iconBg, iconColor, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 items-start">
              <div className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <IconComp />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/how-it-works"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Learn more about how it works <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
