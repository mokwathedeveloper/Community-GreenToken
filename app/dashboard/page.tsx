import type { Metadata } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import StatCard from "@/components/StatCard";
import MiniLeaderboard from "@/components/dashboard/MiniLeaderboard";
import DonationProgress from "@/components/dashboard/DonationProgress";
import SharedBanner from "@/components/SharedBanner";

// Spec: dashboard_page_md.md | Mockup: mockup/dashboard_page_mockup.png
export const metadata: Metadata = { title: "Dashboard" };

// ── Mock data (replaced by real API calls in Phase 2) ─────────────────────────
const MOCK_STATS = [
  { icon: "🪙", iconBg: "bg-primary-100", iconColor: "text-primary-600", label: "Token Balance",     value: "1,250",  change: "12%", changeType: "up"   as const },
  { icon: "✅", iconBg: "bg-blue-100",    iconColor: "text-blue-600",    label: "Actions Completed", value: "24",     change: "8%",  changeType: "up"   as const },
  { icon: "❤️", iconBg: "bg-red-100",     iconColor: "text-red-500",     label: "Total Donations",   value: "320",    change: "3%",  changeType: "down" as const },
  { icon: "🌿", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", label: "CO₂ Offset",        value: "24.6 kg", change: "15%", changeType: "up"   as const },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice Green",   handle: "@alicegreen",   tokens: 3450 },
  { rank: 2, name: "Bob Earth",     handle: "@bobearth",     tokens: 2890 },
  { rank: 3, name: "Charlie Leaf",  handle: "@charlieleaf",  tokens: 2500 },
  { rank: 4, name: "Diana Nature",  handle: "@dianature",    tokens: 2100 },
  { rank: 5, name: "Ethan Planet",  handle: "@ethanplanet",  tokens: 1960 },
];

const MOCK_DONATIONS = [
  { id: "1", name: "Tree Planting Initiative",  status: "Ongoing"   as const, raised: 80,  goal: 120 },
  { id: "2", name: "Recycling Drive",           status: "Ongoing"   as const, raised: 62,  goal: 100 },
];

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard" tokenBalance={BigInt(12500000000)} userName="GreenUser">

      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, GreenUser! 🌿
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening in your journey today.
        </p>
      </div>

      {/* Stat Cards — 4 across */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {MOCK_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Leaderboard — 1/3 */}
        <div className="lg:col-span-1">
          <MiniLeaderboard entries={MOCK_LEADERBOARD} myRank={8} />
        </div>

        {/* Analytics chart placeholder — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">📊 Analytics Overview</h3>
            <select
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Time period filter"
              defaultValue="month"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Chart placeholder — replaced by Recharts in Phase 2 */}
          <div
            role="img"
            aria-label="Analytics chart — token growth over time (chart coming in Phase 2)"
            className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-sm font-medium text-primary-700">Token Growth Chart</p>
              <p className="text-xs text-primary-500 mt-1">Recharts integration — Phase 2</p>
            </div>
          </div>

          {/* Quick stats below chart */}
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-50">
            {[
              { label: "Actions", value: "320" },
              { label: "Trees Planted", value: "24" },
              { label: "GTK Earned", value: "24.6" },
              { label: "CO₂ Offset", value: "24.6 kg" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Progress */}
      <div className="mb-6">
        <DonationProgress projects={MOCK_DONATIONS} />
      </div>

      {/* CTA Banner */}
      <SharedBanner
        title="Small Actions. Big Impact."
        subtitle="Join thousands of changemakers building a greener tomorrow."
        ctaLabel="Submit an Action"
        ctaHref="/feature"
        overlayStrength="dark"
      />

    </AppLayout>
  );
}
