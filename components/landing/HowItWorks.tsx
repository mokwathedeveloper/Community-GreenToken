import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import {
  MPersonAdd, MShield, MCoin, MGift, MLeaf,
  MLink, MBarChart,
} from "@/components/icons";

const STEPS = [
  { num: 1, Icon: MPersonAdd, bg: "bg-green-500",  title: "Take Action",        desc: "Sign up and log your first eco-friendly action in your community." },
  { num: 2, Icon: MShield,    bg: "bg-blue-500",   title: "Verify Your Action", desc: "Community & AI verify your submission. Evidence stored on Stellar." },
  { num: 3, Icon: MCoin,      bg: "bg-amber-500",  title: "Earn GreenTokens",   desc: "Verified actions trigger GreenToken.mint() — tokens go to your wallet." },
  { num: 4, Icon: MGift,      bg: "bg-purple-500", title: "Redeem or Donate",   desc: "Spend tokens on rewards or donate to community eco-projects." },
];

const TRUST_CARDS = [
  {
    Icon: MLink,
    iconBg: "bg-primary-100",
    iconColor: "text-primary-700",
    title: "Blockchain Transparency",
    desc: "Every action, token, and donation is permanently recorded on Stellar. Anyone can verify the data at any time.",
  },
  {
    Icon: MLeaf,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    title: "Measurable Sustainability",
    desc: "Real-time metrics: trees planted, CO₂ offset, waste collected — all backed by on-chain proof of impact.",
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
            From your first eco-action to a permanent blockchain record — in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-0 mb-16">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0">
              <div className="flex flex-col items-center text-center w-44 lg:w-40 px-2">
                <div className={`relative w-16 h-16 rounded-full ${step.bg} flex items-center justify-center shadow-md mb-4 ring-4 ring-white`}>
                  <step.Icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-gray-200 text-xs font-extrabold text-gray-700 flex items-center justify-center shadow-sm">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div aria-hidden="true" className="hidden lg:flex items-center pb-10 flex-shrink-0 px-3">
                  <ArrowRight className="w-5 h-5 text-primary-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
              Built on Trust. Driven by Impact.
            </p>
            <h3 className="text-xl font-extrabold text-gray-900">
              Why You Can Count on GreenToken
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TRUST_CARDS.map(({ Icon, iconBg, iconColor, title, desc }) => (
              <div key={title} className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
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
