import Link from "next/link";
import { UserPlus, Leaf, ShieldCheck, Coins, Gift, Link2, BarChart3, ChevronRight } from "lucide-react";

// Mockup: 5-step horizontal flow with arrow connectors + trust cards
// Spec: how_it_works_page_md.md — condensed version for landing page

const STEPS = [
  { num: 1, Icon: UserPlus,    iconBg: "bg-green-50",   iconColor: "text-green-600",   title: "Sign Up",          desc: "Create an account or connect your Freighter wallet in 60 seconds." },
  { num: 2, Icon: Leaf,        iconBg: "bg-emerald-50", iconColor: "text-emerald-600", title: "Submit an Action", desc: "Log a sustainable action and upload photo evidence." },
  { num: 3, Icon: ShieldCheck, iconBg: "bg-blue-50",    iconColor: "text-blue-600",    title: "Verification",     desc: "Your action is verified on the Stellar blockchain via ActionRegistry." },
  { num: 4, Icon: Coins,       iconBg: "bg-amber-50",   iconColor: "text-amber-600",   title: "Earn GTK",         desc: "Verified actions trigger GreenToken.mint() — tokens appear in your wallet." },
  { num: 5, Icon: Gift,        iconBg: "bg-purple-50",  iconColor: "text-purple-600",  title: "Redeem or Donate", desc: "Spend tokens on rewards or donate to community eco-projects." },
];

const TRUST_CARDS = [
  {
    Icon: Link2,
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    title: "Blockchain Transparency",
    desc: "Every action, token, and donation is permanently recorded on Stellar. Anyone can verify the data.",
  },
  {
    Icon: BarChart3,
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

        {/* Heading */}
        <div className="text-center mb-14">
          <h2 id="how-heading" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            How Community GreenToken Works
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            From your first eco-action to a permanent blockchain record — in five simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-0 relative mb-14">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center px-2">
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div aria-hidden="true"
                  className="hidden lg:flex absolute top-[22px] left-[calc(50%+26px)] w-[calc(100%-52px)] items-center z-10 pointer-events-none">
                  <div className="flex-1 h-0.5 bg-primary-200" />
                  <ChevronRight className="w-4 h-4 text-primary-400 flex-shrink-0 -ml-1" />
                </div>
              )}
              {/* Step number circle */}
              <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center text-base font-extrabold mb-4 z-20 shadow-sm flex-shrink-0">
                {step.num}
              </div>
              {/* Icon */}
              <div className={`w-14 h-14 rounded-full ${step.iconBg} flex items-center justify-center mb-3 ring-1 ring-black/5 shadow-sm`}>
                <step.Icon className={`w-6 h-6 ${step.iconColor}`} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {TRUST_CARDS.map(({ Icon, iconBg, iconColor, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 items-start">
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Link */}
        <div className="text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Learn more about how it works <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
