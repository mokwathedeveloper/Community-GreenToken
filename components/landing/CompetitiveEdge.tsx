import Link from "next/link";
import {
  MShield, MPeople, MBarChart, MCoin, MGift, MBolt,
  MCheckCircle, MAttachMoney, MLeaf,
} from "@/components/icons";

// Unique differentiators — one clear advantage per card
const ADVANTAGES = [
  {
    Icon: MShield,
    title: "Verified, Not Pledged",
    desc: "Every action is reviewed by an org admin and recorded on Stellar. Competitors accept unverified pledges — we require proof.",
    accent: "bg-primary-600",
  },
  {
    Icon: MPeople,
    title: "Full Org Admin Dashboard",
    desc: "The only platform where an NGO or company can onboard, create campaigns, approve actions, and track impact — all in one place.",
    accent: "bg-emerald-600",
  },
  {
    Icon: MBolt,
    title: "$0.000001 Transaction Fees",
    desc: "ZeLoop collapsed because BSC fees killed micro-rewards. On Stellar, 10,000 verified actions cost less than $0.01 in total fees.",
    accent: "bg-teal-600",
  },
  {
    Icon: MCoin,
    title: "Real Token Utility",
    desc: "GTK is redeemable for actual goods, vouchers, or withdrawn as KES/USD via M-Pesa. Not a speculative asset — a real reward.",
    accent: "bg-lime-700",
  },
  {
    Icon: MBarChart,
    title: "Live Impact Analytics",
    desc: "Orgs and members see real-time dashboards: actions verified, tokens distributed, CO₂ offset, and leaderboard standings.",
    accent: "bg-amber-600",
  },
  {
    Icon: MGift,
    title: "Gamified Leaderboard",
    desc: "Public leaderboard drives community competition. Members earn bonus GTK for streaks and top rankings — no competitor ships this.",
    accent: "bg-rose-600",
  },
];

// Competitor weakness callouts
const WEAKNESSES = [
  { project: "EcoLedger",  flaw: "Blockchain never built — it's a mockup with planned Soroban contracts that were never deployed." },
  { project: "ZeLoop",     flaw: "Token lost 99.8% of its value. BSC fees made micro-rewards uneconomic. Platform is effectively dead." },
  { project: "TikCoin",    flaw: "Creator economy only — no sustainability angle, no org tools, no real-world action verification." },
  { project: "Green Earth",flaw: "Unverified climate pledges on a chain with no live product. Heavy legal disclaimers signal zero maturity." },
];

export default function CompetitiveEdge() {
  return (
    <section aria-label="Why GreenToken wins" className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-4">
            <MCheckCircle className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Competitive Advantage</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Why GreenToken Is{" "}
            <span className="text-primary-600">the Only Platform</span>{" "}
            That Does All of This
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Every competitor fails on at least one critical dimension. We ship all six — in a single, production-ready product on Stellar.
          </p>
        </div>

        {/* Advantage cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {ADVANTAGES.map(({ Icon, title, desc, accent }) => (
            <div
              key={title}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center mb-4 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Competitor weakness strip */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5 text-center">
            Why Our Competitors Failed
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WEAKNESSES.map(({ project, flaw }) => (
              <div key={project} className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">✗</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-0.5">{project}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{flaw}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/tokenomics"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <MAttachMoney className="w-5 h-5" aria-hidden="true" />
            View Full GTK Tokenomics
          </Link>
          <Link
            href="/org/setup"
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-colors text-sm ml-3"
          >
            <MLeaf className="w-5 h-5" aria-hidden="true" />
            Set Up Your Org — Free
          </Link>
        </div>
      </div>
    </section>
  );
}
