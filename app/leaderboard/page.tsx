"use client";

// Rules: R-FE-01, R-FE-02, R-COMP-01, R-A11Y-08 (table scope), R-A11Y-01
// Spec: ux_ui/feature_specv2/leaderboard_page_md.md
// Mockup: mockup/leaderboard_page_mockup.png

import { useState } from "react";
import Image from "next/image";
import AppLayout from "@/components/layouts/AppLayout";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Period = "all_time" | "monthly" | "weekly";

const TABS: { key: Period; label: string }[] = [
  { key: "all_time", label: "Global Leaderboard" },
  { key: "monthly",  label: "My Rank" },
  { key: "weekly",   label: "Friends" },
];

const MOCK_USERS = [
  { rank: 1, name: "Alice Green",  handle: "@alicegreen",  actions: 158, tokens: 3450, trophy: "🥇" },
  { rank: 2, name: "Bob Earth",    handle: "@bobearth",    actions: 142, tokens: 2890, trophy: "🥈" },
  { rank: 3, name: "Charlie Leaf", handle: "@charlieleaf", actions: 128, tokens: 2500, trophy: "🥉" },
  { rank: 4, name: "Diana Nature", handle: "@dianature",   actions: 177, tokens: 2100, trophy: ""   },
  { rank: 5, name: "Ethan Planet", handle: "@ethanplanet", actions: 98,  tokens: 1960, trophy: ""   },
  { rank: 6, name: "Fiona Forest", handle: "@fionaforest", actions: 85,  tokens: 1840, trophy: ""   },
  { rank: 7, name: "George Green", handle: "@georgegreen",  actions: 88, tokens: 1780, trophy: ""   },
  { rank: 8, name: "You (GreenUser)", handle: "@greenuser", actions: 76, tokens: 1250, trophy: "", isMe: true },
];

const RANK_BADGE: Record<number, string> = {
  1: "bg-yellow-400 text-white",
  2: "bg-gray-300 text-gray-700",
  3: "bg-amber-600 text-white",
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all_time");
  const [sortBy, setSortBy] = useState<"tokens" | "actions">("tokens");

  const sorted = [...MOCK_USERS].sort((a, b) =>
    sortBy === "tokens" ? b.tokens - a.tokens : b.actions - a.actions
  );

  return (
    <AppLayout title="Leaderboard">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🏆 Leaderboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">See how you rank among eco champions in the community.</p>
        </div>
        {/* Trophy illustration */}
        <div className="relative w-24 h-24 flex-shrink-0 hidden md:block">
          <Image
            src="/assets/image/leaderboard-dashboard/leaderboard_trophy.png"
            alt="Leaderboard trophy"
            fill className="object-contain"
            loading="lazy"
          />
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Participants",  value: "1,248", sub: "Active Eco Champions" },
          { label: "Total Tokens Earned", value: "128,450", sub: "Earned by Community"  },
          { label: "Your Rank",           value: "#8",    sub: "Out of 1,248"          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
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

      {/* Controls */}
      <div className="flex justify-end gap-2 mb-4">
        <select value="all_time" onChange={() => {}} aria-label="Time period"
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option>All Time</option>
          <option>Monthly</option>
          <option>Weekly</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "tokens" | "actions")}
          aria-label="Sort by"
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="tokens">Sort by Tokens</option>
          <option value="actions">Sort by Actions</option>
        </select>
      </div>

      {/* Table — R-A11Y-08: th scope, caption */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Community GreenToken leaderboard rankings</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Rank", "User", "Actions", "GreenTokens", "Trophy"].map((h) => (
                <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((u) => (
              <tr key={u.rank}
                className={cn("hover:bg-gray-50 transition-colors",
                  (u as any).isMe && "bg-primary-50 border-primary-100"
                )}>
                <td className="px-5 py-3.5">
                  <span className={cn("inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold",
                    RANK_BADGE[u.rank] ?? "bg-gray-100 text-gray-600")}>
                    {u.rank}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name}{(u as any).isMe && <span className="ml-2 text-xs text-primary-600">(You)</span>}</p>
                      <p className="text-xs text-gray-400">{u.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-700 font-medium">{u.actions}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-primary-500" aria-hidden="true">🪙</span>
                    <span className="font-semibold text-gray-900">{u.tokens.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-lg">{u.trophy}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-center text-gray-400 py-3 border-t border-gray-50">
          Leaderboard updates every 15 minutes.
        </p>
      </div>
    </AppLayout>
  );
}
