import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";
import {
  MLeaf, MCoin, MShield, MPeople, MBarChart, MCheckCircle,
  MRecycle, MGift, MBolt, MAttachMoney, MPublic, MLock,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "GTK Tokenomics — Community GreenToken",
  description:
    "How GreenToken (GTK) is minted, distributed, and redeemed — fully transparent on Stellar.",
};

// ── Token fundamentals ───────────────────────────────────────────────────────
const FUNDAMENTALS = [
  { label: "Token Name",    value: "GreenToken",       icon: MLeaf       },
  { label: "Symbol",        value: "GTK",              icon: MCoin       },
  { label: "Blockchain",    value: "Stellar (Soroban)", icon: MPublic    },
  { label: "Total Supply",  value: "100,000,000 GTK",  icon: MBarChart   },
  { label: "Tx Fee",        value: "< $0.00001",       icon: MBolt       },
  { label: "Smart Contract",value: "Soroban WASM",     icon: MLock       },
];

// ── Distribution ─────────────────────────────────────────────────────────────
const DISTRIBUTION = [
  { label: "Org Action Rewards",   pct: 60, color: "bg-primary-600",  desc: "Minted per verified eco-action, controlled by org budget"       },
  { label: "Platform Treasury",    pct: 20, color: "bg-emerald-500",  desc: "Sustains platform development, audits, and infrastructure"       },
  { label: "Community Incentives", pct: 12, color: "bg-teal-400",     desc: "Leaderboard bonuses, referrals, first-action grants"             },
  { label: "Founding Team",        pct:  8, color: "bg-lime-500",     desc: "12-month cliff, 36-month linear vest — fully disclosed"          },
];

// ── Fee comparison ────────────────────────────────────────────────────────────
const FEE_TABLE = [
  { chain: "Stellar (GreenToken)", fee: "$0.000001",  finality: "3–5 s",   eco: "Carbon-neutral", highlight: true  },
  { chain: "BSC (ZeLoop)",         fee: "$0.10–$2.00", finality: "3–5 s",   eco: "PoA — centralised", highlight: false },
  { chain: "Ethereum",             fee: "$2–$50",      finality: "12–60 s", eco: "PoS — moderate",    highlight: false },
  { chain: "Polygon",              fee: "$0.01–$0.05", finality: "2–5 s",   eco: "PoS — moderate",    highlight: false },
];

// ── Flow steps ────────────────────────────────────────────────────────────────
const FLOW = [
  {
    step: "01", Icon: MPeople,
    title: "Org Onboarding",
    desc:  "Organisation signs up, configures GTK budget, deploys Soroban contract, and invites members — all in one guided wizard.",
    href:  "/org/setup",
    cta:   "Set Up Org",
    color: "bg-primary-600",
  },
  {
    step: "02", Icon: MRecycle,
    title: "Member Submits Action",
    desc:  "Member logs an eco-action (recycling, tree planting, clean-up) with description, photo proof, and GPS timestamp.",
    href:  "/submit-action",
    cta:   "Submit Action",
    color: "bg-emerald-600",
  },
  {
    step: "03", Icon: MShield,
    title: "Admin Verifies",
    desc:  "Org admin reviews evidence in the verification queue. Approval triggers the on-chain Soroban mint call automatically.",
    href:  "/org/admin/actions",
    cta:   "View Queue",
    color: "bg-teal-600",
  },
  {
    step: "04", Icon: MCoin,
    title: "GTK Minted & Distributed",
    desc:  "Smart contract mints exact GTK amount, records immutable proof on Stellar ledger, and credits the member wallet.",
    href:  "/dashboard",
    cta:   "See Dashboard",
    color: "bg-lime-700",
  },
  {
    step: "05", Icon: MGift,
    title: "Member Redeems",
    desc:  "Members redeem GTK for vouchers, goods, or withdraw as KES/USD via M-Pesa or bank transfer.",
    href:  "/redeem",
    cta:   "Redeem GTK",
    color: "bg-amber-600",
  },
];

// ── Why Stellar ───────────────────────────────────────────────────────────────
const WHY_STELLAR = [
  { Icon: MBolt,         title: "Ultra-low fees",        desc: "~$0.000001 per transaction — 100,000× cheaper than Ethereum. Micro-rewards are economically viable." },
  { Icon: MCheckCircle,  title: "3-second finality",     desc: "Actions are confirmed on-chain in under 5 seconds. No waiting, no gas wars." },
  { Icon: MPublic,       title: "Carbon-neutral ledger", desc: "Stellar is certified carbon-neutral by the Stellar Development Foundation — aligns with our eco mission." },
  { Icon: MLock,         title: "Soroban smart contracts", desc: "Rust-based WASM contracts with formal verification support — same security guarantees as Ethereum." },
  { Icon: MAttachMoney,  title: "Built-in payment rails", desc: "Native USD, EURC, and local-currency anchors enable seamless token-to-cash withdrawals." },
  { Icon: MShield,       title: "SEP-compliant KYC",     desc: "Stellar Ecosystem Proposals provide standard KYC/AML hooks — enterprise-grade compliance out of the box." },
];

// ── Competitive grid ─────────────────────────────────────────────────────────
const COMPETITORS = [
  { feature: "Multi-org admin dashboard",       us: true,  ecoledger: false, zeloop: false, tikcoin: false },
  { feature: "Verified action submissions",     us: true,  ecoledger: false, zeloop: "partial", tikcoin: false },
  { feature: "Soroban smart contract (live)",   us: true,  ecoledger: false, zeloop: false, tikcoin: true },
  { feature: "Leaderboard & gamification",      us: true,  ecoledger: false, zeloop: false, tikcoin: false },
  { feature: "Impact analytics dashboard",      us: true,  ecoledger: false, zeloop: false, tikcoin: false },
  { feature: "Token redemption (real rewards)", us: true,  ecoledger: false, zeloop: "partial", tikcoin: false },
  { feature: "Cash withdrawal (KES/USD)",       us: true,  ecoledger: false, zeloop: false, tikcoin: false },
  { feature: "Member invite + RBAC",            us: true,  ecoledger: false, zeloop: false, tikcoin: false },
  { feature: "Mobile-responsive UI",            us: true,  ecoledger: false, zeloop: "app only", tikcoin: false },
  { feature: "Carbon-neutral chain",            us: true,  ecoledger: false, zeloop: false, tikcoin: true },
];

function Tick({ val }: { val: boolean | string }) {
  if (val === true)  return <span className="text-primary-600 font-bold text-lg">✓</span>;
  if (val === "partial" || typeof val === "string") return <span className="text-amber-500 text-xs font-semibold">{val}</span>;
  return <span className="text-gray-300 font-bold">✗</span>;
}

export default function TokenomicsPage() {
  return (
    <PublicLayout>
      <div className="bg-white">

        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 py-20 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <MCoin className="w-4 h-4 text-green-300" aria-hidden="true" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">GTK Token Economics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Transparent Tokenomics.<br />
              <span className="text-green-300">Real Impact.</span>
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              GreenToken (GTK) is minted only for verified eco-actions, controlled by org budgets,
              and redeemable for real goods — backed by Stellar&apos;s ultra-low-fee blockchain.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/org/setup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm">
                <MLeaf className="w-4 h-4" />  Start Your Org
              </Link>
              <Link href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-colors text-sm">
                <MCoin className="w-4 h-4" />  Earn GTK Tokens
              </Link>
            </div>
          </div>
        </section>

        {/* ── Fundamentals ── */}
        <section className="py-16 px-6 bg-gray-50 border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">Token Fundamentals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {FUNDAMENTALS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Token Flow ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How GTK Flows</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                From org onboarding to member reward — every step is on-chain and auditable.
              </p>
            </div>

            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block" aria-hidden="true" />

              <div className="space-y-6">
                {FLOW.map(({ step, Icon, title, desc, href, cta, color }, i) => (
                  <div key={step} className="relative flex gap-6 items-start">
                    {/* Step circle */}
                    <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full ${color} flex flex-col items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                      <span className="text-[9px] font-bold text-white/70 mt-0.5">{step}</span>
                    </div>
                    {/* Card */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                        <Link href={href}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white ${color} hover:opacity-90 rounded-lg transition-opacity flex-shrink-0`}>
                          {cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Distribution ── */}
        <section className="py-20 px-6 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Token Distribution</h2>
              <p className="text-gray-500">Total supply: 100,000,000 GTK — minted on demand, never pre-mined</p>
            </div>
            <div className="space-y-5">
              {DISTRIBUTION.map(({ label, pct, color, desc }) => (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                    <span className="text-sm font-bold text-gray-900">{pct}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fee Comparison ── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Why Stellar? The Fee Advantage</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                ZeLoop collapsed because BSC fees eroded micro-rewards. Stellar makes sub-cent token distribution economically viable at scale.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Blockchain</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Tx Fee</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Finality</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Eco Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {FEE_TABLE.map(({ chain, fee, finality, eco, highlight }) => (
                    <tr key={chain}
                      className={`border-b border-gray-50 ${highlight ? "bg-primary-50" : "bg-white hover:bg-gray-50"}`}>
                      <td className="px-5 py-4 font-semibold text-gray-900 flex items-center gap-2">
                        {highlight && <MLeaf className="w-4 h-4 text-primary-600 flex-shrink-0" />}
                        {chain}
                        {highlight && <span className="ml-1 text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">OUR CHOICE</span>}
                      </td>
                      <td className={`px-5 py-4 text-center font-bold ${highlight ? "text-primary-700" : "text-gray-700"}`}>{fee}</td>
                      <td className="px-5 py-4 text-center text-gray-600">{finality}</td>
                      <td className="px-5 py-4 text-center text-gray-600">{eco}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              At 10,000 daily verified actions, Stellar costs ~$0.01/day in fees. The same on Ethereum would cost $500–$50,000.
            </p>
          </div>
        </section>

        {/* ── Why Stellar ── */}
        <section className="py-20 px-6 bg-primary-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-white mb-3">Why Stellar Is the Right Chain</h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Every design decision in GreenToken is optimised for Stellar&apos;s unique capabilities.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_STELLAR.map(({ Icon, title, desc }) => (
                <div key={title} className="bg-white/10 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Competitive Grid ── */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Feature Comparison</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                No competitor ships all of this in one product. GreenToken does.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</th>
                    <th className="text-center px-5 py-3.5 text-xs font-bold text-primary-700 uppercase tracking-wide bg-primary-50">GreenToken</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">EcoLedger</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ZeLoop</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">TikCoin</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map(({ feature, us, ecoledger, zeloop, tikcoin }) => (
                    <tr key={feature} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{feature}</td>
                      <td className="px-5 py-3.5 text-center bg-primary-50"><Tick val={us} /></td>
                      <td className="px-5 py-3.5 text-center"><Tick val={ecoledger} /></td>
                      <td className="px-5 py-3.5 text-center"><Tick val={zeloop} /></td>
                      <td className="px-5 py-3.5 text-center"><Tick val={tikcoin} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-6 bg-gradient-to-r from-primary-800 to-emerald-800 text-center">
          <div className="max-w-2xl mx-auto">
            <MLeaf className="w-12 h-12 text-green-300 mx-auto mb-5" />
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to Build a Greener Community?
            </h2>
            <p className="text-white/75 mb-8 text-lg">
              Set up your organisation in under 5 minutes. No blockchain experience required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/org/setup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-sm">
                <MLeaf className="w-4 h-4" /> Start Your Organisation
              </Link>
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/25 transition-colors text-sm">
                <MCoin className="w-4 h-4" /> Join as a Member
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
