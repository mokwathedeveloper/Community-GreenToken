import type { Metadata } from "next";
import Link from "next/link";
import AppLayout from "@/components/layouts/AppLayout";
import StatCard from "@/components/StatCard";
import MiniLeaderboard from "@/components/dashboard/MiniLeaderboard";
import DonationProgress from "@/components/dashboard/DonationProgress";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";

// Rebuilt to exactly match mockup/dashboard_page_mockup.png
export const metadata: Metadata = { title: "Dashboard" };

const MOCK_STATS = [
  {
    icon: "🪙",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    label: "Token Balance",
    value: "1,250",
    change: "12%",
    changeType: "up" as const,
    sublabel: "Free Balance",
  },
  {
    icon: "✅",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "Actions Completed",
    value: "24",
    change: "8%",
    changeType: "up" as const,
    sublabel: "Free Balance",
  },
  {
    icon: "💝",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    label: "Total Donations",
    value: "$320",
    change: "3%",
    changeType: "down" as const,
    sublabel: "Free Balance",
  },
  {
    icon: "🌿",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    label: "CO₂ Offset",
    value: "24.6 kg",
    change: "15%",
    changeType: "up" as const,
    sublabel: "Free Balance",
  },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alice Green",  handle: "@alicegreen",  tokens: 3450 },
  { rank: 2, name: "Bob Earth",    handle: "@bobearth",    tokens: 2890 },
  { rank: 3, name: "Charlie Leaf", handle: "@charlieleaf", tokens: 2500 },
  { rank: 4, name: "Diana Nature", handle: "@dianature",   tokens: 2100 },
  { rank: 5, name: "Ethan Planet", handle: "@ethanplanet", tokens: 1960 },
];

const MOCK_DONATIONS = [
  { id: "1", name: "Tree Planting Initiative", status: "Ongoing" as const, raised: 80,  goal: 120 },
  { id: "2", name: "Recycling Drive",          status: "Ongoing" as const, raised: 62,  goal: 100 },
];

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard" tokenBalance={BigInt(12500000000)}>

      {/* Greeting — matches mockup */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, GreenUser! 🌿
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Here&apos;s what&apos;s happening in your journey today.
        </p>
      </div>

      {/* 4 Stat Cards — exactly matches mockup row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {MOCK_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column content: Leaderboard (1/3) + Analytics Chart (2/3) */}
      {/* Exact column ratio matches mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Leaderboard — left column */}
        <div className="lg:col-span-1">
          <MiniLeaderboard entries={MOCK_LEADERBOARD} myRank={8} />
        </div>

        {/* Analytics Chart — right column, larger */}
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>
      </div>

      {/* Donation Progress — full width */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">❤️ Donation Progress</h3>
          <Link href="/donations" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            View All Projects →
          </Link>
        </div>
        <DonationProgress projects={MOCK_DONATIONS} />
      </div>

    </AppLayout>
  );
}
