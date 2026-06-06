"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AppLayout from "@/components/layouts/AppLayout";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { MTrophy, MCoin } from "@/components/icons";

type Period = "all_time" | "monthly" | "weekly";

const TABS: { key: Period; label: string }[] = [
  { key: "all_time", label: "Global Leaderboard" },
  { key: "monthly",  label: "Monthly"            },
  { key: "weekly",   label: "Weekly"             },
];

const RANK_BADGE: Record<number, string> = {
  1: "bg-yellow-400 text-white",
  2: "bg-gray-300 text-gray-700",
  3: "bg-amber-600 text-white",
};

type LeaderRow = {
  rank:        number;
  userId:      string;
  displayName: string;
  balance:     number;
  totalEarned: number;
  isMe?:       boolean;
};

export default function LeaderboardPage() {
  const [period,  setPeriod]  = useState<Period>("all_time");
  const [sortBy,  setSortBy]  = useState<"tokens" | "actions">("tokens");
  const [rows,    setRows]    = useState<LeaderRow[]>([]);
  const [myRank,  setMyRank]  = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&limit=50`)
      .then((r) => r.json())
      .then((res) => {
        setRows(res.data ?? []);
        setMyRank(res.meta?.my_rank ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const trophy = (rank: number) =>
    rank <= 3 ? <MTrophy className={cn("w-5 h-5", rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-400" : "text-amber-600")} aria-hidden="true" /> : null;

  return (
    <AppLayout title="Leaderboard">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MTrophy className="w-6 h-6 text-amber-500" aria-hidden="true" /> Leaderboard</h2>
          <p className="text-sm text-gray-500 mt-1">See how you rank among eco champions in the community.</p>
        </div>
        <div className="relative w-24 h-24 flex-shrink-0 hidden md:block">
          <Image src="/assets/image/leaderboard-dashboard/leaderboard_trophy.png"
            alt="Leaderboard trophy" fill className="object-contain" loading="lazy" />
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Participants",  value: rows.length ? rows.length.toLocaleString() : "—", sub: "Active Eco Champions" },
          { label: "Total Tokens Earned", value: rows.length ? rows.reduce((s, r) => s + r.totalEarned, 0).toLocaleString() : "—", sub: "Earned by Community" },
          { label: "Your Rank",           value: myRank ? `#${myRank}` : "—", sub: myRank ? `Out of ${rows.length}` : "Submit an action to rank" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{loading ? "…" : value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setPeriod(key)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              period === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Sort control */}
      <div className="flex justify-end gap-2 mb-4">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "tokens" | "actions")}
          aria-label="Sort by"
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="tokens">Sort by Tokens</option>
          <option value="actions">Sort by Total Earned</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10">Loading leaderboard…</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No data yet. Be the first to submit an action!</p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Community GreenToken leaderboard rankings</caption>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Rank", "User", "Total Earned", "Balance", "Trophy"].map((h) => (
                  <th key={h} scope="col"
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((u) => (
                <tr key={u.userId}
                  className={cn("hover:bg-gray-50 transition-colors",
                    u.isMe && "bg-primary-50 border-primary-100")}>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold",
                      RANK_BADGE[u.rank] ?? "bg-gray-100 text-gray-600")}>
                      {u.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.displayName}{u.isMe && <span className="ml-2 text-xs text-primary-600">(You)</span>}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{u.totalEarned.toLocaleString()} GTK</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <MCoin className="w-4 h-4 text-primary-500" aria-hidden="true" />
                      <span className="font-semibold text-gray-900">{u.balance.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{trophy(u.rank)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-xs text-center text-gray-400 py-3 border-t border-gray-50">
          Leaderboard updates in real time.
        </p>
      </div>
    </AppLayout>
  );
}
