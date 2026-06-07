// Spec: ux_ui/feature_specv2/how_it_works_page_md.md
// Mockup: mockup/how_it_works_page_mockup.png

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  MPersonAdd, MLeaf, MShield, MCoin, MGift,
  MSmartphone, MSearch, MLink,
} from "@/components/icons";
import PublicLayout from "@/components/layouts/PublicLayout";

export const metadata: Metadata = { title: "How It Works — Community GreenToken" };

const STEPS = [
  {
    num: 1,
    Icon: MPersonAdd,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    title: "Sign Up",
    desc: "Create your account in seconds and connect your Freighter wallet on Stellar.",
  },
  {
    num: 2,
    Icon: MLeaf,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Submit a Sustainable Action",
    desc: "Share your eco-friendly action and upload photo evidence for on-chain verification.",
  },
  {
    num: 3,
    Icon: MShield,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Verification",
    desc: "Our community and AI review your action to ensure authenticity.",
  },
  {
    num: 4,
    Icon: MCoin,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Earn GreenTokens",
    desc: "Once verified, you earn GTK tokens to your Stellar wallet instantly.",
  },
  {
    num: 5,
    Icon: MGift,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Redeem or Donate",
    desc: "Redeem tokens for rewards from your tokens to causes.",
  },
];

const LIFECYCLE = [
  { Icon: MSmartphone, label: "Submit a sustainable action on the app",   color: "text-green-600",  bg: "bg-green-50",   ring: "ring-green-200",   highlight: false },
  { Icon: MSearch,     label: "Community & AI verify authenticity",        color: "text-blue-600",   bg: "bg-blue-50",    ring: "ring-blue-200",    highlight: false },
  { Icon: MLink,       label: "Action recorded on Stellar blockchain",     color: "text-indigo-600", bg: "bg-indigo-50",  ring: "ring-indigo-200",  highlight: false },
  { Icon: MCoin,       label: "You earn GreenTokens to your wallet",       color: "text-white",      bg: "bg-primary-600",ring: "ring-primary-400", highlight: true  },
  { Icon: MGift,       label: "Redeem rewards or donate to causes",        color: "text-purple-600", bg: "bg-purple-50",  ring: "ring-purple-200",  highlight: false },
];

const FAQ = [
  {
    q: "How are actions verified?",
    a: "Actions are verified through a combination of community voting, AI analysis, and photo evidence. Once verified, the result is stored permanently on the Stellar blockchain via our ActionRegistry contract.",
  },
  {
    q: "What is a GreenToken?",
    a: "A GreenToken (GTK) is a SEP-41 compliant digital token on the Stellar blockchain. Every GTK was earned by a verified real-world eco-action — there is no pre-minted supply.",
  },
  {
    q: "Can I donate my tokens?",
    a: "Yes! You can allocate your GTK tokens to any active community eco-project on the Donation Tracking page. Every donation is recorded on-chain for full transparency.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[420px] flex items-center overflow-hidden">
        <Image
          src="/assets/image/pages/how-it-works/how_it_works_hero.png"
          alt="Green earth illustration"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ objectPosition: "right center" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-5">
              How It Works
            </h1>
            <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-lg">
              Take climate action. Earn rewards. Make an impact.<br />
              Submit sustainable actions, get them verified, earn GreenTokens,
              and redeem or donate to build a greener tomorrow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup"
                className="px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                Get Started
              </Link>
              <Link href="/impact"
                className="px-7 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                Explore Network
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 STEPS ────────────────────────────────────────────────────────── */}
      <section aria-labelledby="steps-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 id="steps-heading" className="text-3xl font-extrabold text-gray-900 mb-3">
              Five Simple Steps
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              From your first eco-action to a permanent blockchain record — in five simple steps.
            </p>
          </div>

          {/* Steps row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 relative">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center px-2">

                {/* Arrow connector between steps — desktop only */}
                {i < STEPS.length - 1 && (
                  <div aria-hidden="true"
                    className="hidden lg:flex absolute top-[22px] left-[calc(50%+26px)] w-[calc(100%-52px)] items-center z-10 pointer-events-none">
                    <div className="flex-1 h-0.5 bg-primary-200" />
                    <ChevronRight className="w-4 h-4 text-primary-400 flex-shrink-0 -ml-1" />
                  </div>
                )}

                {/* Numbered circle */}
                <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center text-base font-extrabold mb-4 z-20 shadow-sm flex-shrink-0">
                  {step.num}
                </div>

                {/* Icon in circle */}
                <div className={`w-16 h-16 rounded-full ${step.iconBg} flex items-center justify-center mb-4 ring-1 ring-black/5 shadow-sm`}>
                  <step.Icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GREENTOKEN LIFECYCLE ───────────────────────────────────────────── */}
      <section aria-labelledby="lifecycle-heading" className="relative py-16 overflow-hidden">
        <Image
          src="/assets/image/pages/how-it-works/flow_diagram_background.png"
          alt=""
          fill
          className="object-cover"
          aria-hidden="true"
          sizes="100vw"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h2 id="lifecycle-heading" className="text-2xl font-extrabold text-gray-900 text-center mb-12">
            The GreenToken Lifecycle
          </h2>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-0">
            {LIFECYCLE.map(({ Icon, label, color, bg, ring, highlight }, i) => (
              <div key={label} className="flex flex-col lg:flex-row items-center gap-2 lg:gap-0">
                {/* Node */}
                <div className="flex flex-col items-center text-center w-36">
                  <div className={`${highlight ? "w-20 h-20 shadow-lg shadow-primary-200" : "w-16 h-16 shadow-sm"} rounded-full ${bg} flex items-center justify-center mb-3 ring-2 ${ring} transition-all`}>
                    <Icon className={`${highlight ? "w-9 h-9" : "w-7 h-7"} ${color}`} />
                  </div>
                  <p className={`text-xs font-medium leading-snug ${highlight ? "text-primary-700 font-bold" : "text-gray-700"}`}>{label}</p>
                </div>
                {/* Arrow */}
                {i < LIFECYCLE.length - 1 && (
                  <div aria-hidden="true" className="flex items-center lg:mb-8">
                    <ChevronRight className="w-6 h-6 text-primary-400 rotate-90 lg:rotate-0 flex-shrink-0 mx-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <ol className="sr-only">
            {LIFECYCLE.map(({ label }) => <li key={label}>{label}</li>)}
          </ol>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section heading — centred, no logo */}
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-3xl font-extrabold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Everything you need to know about earning and using GreenTokens.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">

            {/* Left: accordion */}
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="bg-white border border-gray-100 rounded-2xl shadow-sm group overflow-hidden">
                  <summary className="flex justify-between items-center px-6 py-5 cursor-pointer text-sm font-semibold text-gray-900 list-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded-2xl select-none">
                    {q}
                    <span className="w-7 h-7 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 text-lg font-bold flex-shrink-0 ml-4 group-open:rotate-45 transition-transform duration-200" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 border-t border-gray-50">
                    <p className="text-sm text-gray-500 leading-relaxed pt-4">{a}</p>
                  </div>
                </details>
              ))}
            </div>

            {/* Right: impact stats */}
            <div className="hidden lg:block sticky top-24">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Community Impact</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Actions Verified", value: "2.4M+",  bg: "bg-green-50",   text: "text-green-700",   border: "border-green-100" },
                  { label: "GTK Minted",        value: "18.7M",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100" },
                  { label: "CO₂ Offset",        value: "7.9M kg",bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100"  },
                  { label: "Active Members",    value: "142K",   bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-100"},
                ].map(({ label, value, bg, text, border }) => (
                  <div key={label} className={`${bg} rounded-2xl p-4 text-center border ${border} shadow-sm`}>
                    <p className={`text-xl font-extrabold ${text}`}>{value}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── READY TO MAKE A DIFFERENCE ─────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden text-center">
        <Image
          src="/assets/image/pages/how-it-works/how_it_works_banner.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <Image
              src="/branding/community-greentoken-logo.png"
              alt="Community GreenToken"
              fill
              className="object-contain drop-shadow-md"
              sizes="64px"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-primary-900 mb-3">
            Ready to Make a Difference?
          </h2>
          <p className="text-primary-800/80 text-sm mb-8 leading-relaxed max-w-md mx-auto">
            Join thousands of changemakers building a greener tomorrow. Every action counts — start yours today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              Get Started
            </Link>
            <Link href="/impact"
              className="px-8 py-3 bg-white/80 hover:bg-white text-primary-800 font-semibold rounded-xl border border-primary-300 transition-colors shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              Explore Network
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
