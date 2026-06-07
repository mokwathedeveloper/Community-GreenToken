"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layouts/AppLayout";
import StatCard from "@/components/StatCard";
import MiniLeaderboard from "@/components/dashboard/MiniLeaderboard";
import DonationProgress from "@/components/dashboard/DonationProgress";
import AnalyticsChart, { type ChartAction } from "@/components/dashboard/AnalyticsChart";
import { useUser } from "@/hooks/useUser";
import { MCoin, MCheckCircle, MHeart, MTrophy, MWarning } from "@/components/icons";

type LeaderEntry  = { rank: number; name: string; handle: string; tokens: number };
type DonationEntry= { id: string; name: string; status: "Ongoing" | "Completed"; raised: number; goal: number };

export default function DashboardPage() {
  const { displayName, isLoading: userLoading } = useUser();

  const [balance,      setBalance]      = useState(0);
  const [totalEarned,  setTotalEarned]  = useState(0);
  const [actions,      setActions]      = useState({ verified: 0, pending: 0 });
  const [chartActions, setChartActions] = useState<ChartAction[]>([]);
  const [leaders,      setLeaders]      = useState<LeaderEntry[]>([]);
  const [myRank,       setMyRank]       = useState<number | null>(null);
  const [donations,    setDonations]    = useState<DonationEntry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [loadErr,      setLoadErr]      = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    Promise.all([
      // Balance
      fetch("/api/tokens/balance").then((r) => r.json()),
      // Verified actions — used for chart (limit=50) + exact total via pagination
      fetch("/api/actions?status=verified&limit=50").then((r) => r.json()),
      // Pending count only — limit=1, we only need pagination.total
      fetch("/api/actions?status=pending&limit=1").then((r) => r.json()),
      // Leaderboard top 5
      fetch("/api/leaderboard?limit=5").then((r) => r.json()),
      // Active donation projects
      fetch("/api/donations/projects?limit=2").then((r) => r.json()),
    ]).then(([balRes, verifiedRes, pendingRes, lbRes, donRes]) => {

      if (balRes.data) {
        setBalance(balRes.data.balance     ?? 0);
        setTotalEarned(balRes.data.totalEarned ?? 0);
      }

      // Exact counts from pagination totals — immune to per-page cap
      const verifiedTotal = verifiedRes.pagination?.total ?? (verifiedRes.data?.length ?? 0);
      const pendingTotal  = pendingRes.pagination?.total  ?? 0;
      setActions({ verified: verifiedTotal, pending: pendingTotal });
      setChartActions((verifiedRes.data ?? []) as ChartAction[]);

      if (lbRes.data) {
        setLeaders(
          (lbRes.data as { rank: number; displayName: string; balance: number }[]).map((r) => ({
            rank:   r.rank,
            name:   r.displayName,
            handle: `@${r.displayName.toLowerCase().replace(/\s+/g, "")}`,
            tokens: r.balance,
          }))
        );
        setMyRank(lbRes.meta?.my_rank ?? null);
      }

      if (donRes.data) {
        setDonations(
          (donRes.data as { id: string; name: string; raised_tokens: number; goal_tokens: number; is_active: boolean }[])
            .slice(0, 2)
            .map((d) => ({
              id:     d.id,
              name:   d.name,
              status: d.is_active ? "Ongoing" as const : "Completed" as const,
              raised: d.raised_tokens,
              goal:   d.goal_tokens,
            }))
        );
      }

    }).catch((err: unknown) => setLoadErr(err instanceof Error ? err.message : "Failed to load dashboard data.")).finally(() => setLoading(false));
  }, [userLoading]);

  const stats = [
    {
      icon: <MCoin className="w-6 h-6 text-green-600" />, iconBg: "bg-green-100", iconColor: "text-green-600",
      label: "Token Balance",
      value: loading ? "—" : balance.toLocaleString(),
      change: "", changeType: "up" as const,
      sublabel: "GTK",
    },
    {
      icon: <MCheckCircle className="w-6 h-6 text-blue-600" />, iconBg: "bg-blue-100", iconColor: "text-blue-600",
      label: "Actions Verified",
      value: loading ? "—" : String(actions.verified),
      change: "", changeType: "up" as const,
      sublabel: actions.pending > 0 ? `${actions.pending} pending` : "all clear",
    },
    {
      icon: <MHeart className="w-6 h-6 text-rose-500" />, iconBg: "bg-rose-100", iconColor: "text-rose-500",
      label: "Total Earned",
      value: loading ? "—" : totalEarned.toLocaleString(),
      change: "", changeType: "up" as const,
      sublabel: "GTK lifetime",
    },
    {
      icon: <MTrophy className="w-6 h-6 text-teal-600" />, iconBg: "bg-teal-100", iconColor: "text-teal-600",
      label: "Your Rank",
      value: loading ? "—" : (myRank ? `#${myRank}` : "—"),
      change: "", changeType: "up" as const,
      sublabel: "Community rank",
    },
  ];

  return (
    <AppLayout title="Dashboard" tokenBalance={BigInt(balance * 10_000_000)}>
      {loadErr && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{loadErr}</span>
          <button onClick={() => setLoadErr(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {userLoading ? "..." : (displayName ?? "GreenUser")}!
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Here&apos;s what&apos;s happening in your journey today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-1">
          <MiniLeaderboard entries={leaders} myRank={myRank} />
        </div>
        <div className="lg:col-span-2">
          <AnalyticsChart actions={chartActions} />
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <MHeart className="w-4 h-4 text-rose-500" aria-hidden="true" /> Donation Progress
          </h3>
          <Link href="/donations" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            View All Projects →
          </Link>
        </div>
        {donations.length > 0
          ? <DonationProgress projects={donations} />
          : (
            <p className="text-xs text-gray-400 text-center py-4">
              No donations yet.{" "}
              <Link href="/donations" className="text-primary-600 hover:underline">
                Support a project →
              </Link>
            </p>
          )
        }
      </div>
    </AppLayout>
  );
}
