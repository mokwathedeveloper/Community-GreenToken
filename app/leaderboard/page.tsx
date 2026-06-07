"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import AppLayout from "@/components/layouts/AppLayout";
import { cn } from "@/lib/utils";
import { MTrophy, MCoin, MTrending } from "@/components/icons";

type Period = "all_time" | "monthly" | "weekly";
type SortKey = "totalEarned" | "balance";

const TABS: { key: Period; label: string }[] = [
  { key: "all_time", label: "All Time"  },
  { key: "monthly",  label: "Monthly"   },
  { key: "weekly",   label: "Weekly"    },
];

type LeaderRow = {
  rank:        number;
  userId:      string;
  displayName: string;
  balance:     number;
  totalEarned: number;
  isMe?:       boolean;
};

// Deterministic avatar colour from userId so the same person always gets the same colour
const AVATAR_PALETTE = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100   text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100   text-rose-700",
  "bg-amber-100  text-amber-700",
  "bg-cyan-100   text-cyan-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-lime-100   text-lime-700",
];
function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const MEDAL_BG   = ["bg-yellow-400", "bg-gray-300", "bg-amber-500"];
const MEDAL_TEXT = ["text-yellow-900", "text-gray-700", "text-amber-900"];
const MEDAL_RING = ["ring-yellow-300", "ring-gray-200", "ring-amber-300"];
const MEDAL_LABEL = ["Gold", "Silver", "Bronze"];
const PODIUM_HEIGHT = ["h-28", "h-20", "h-16"];

export default function LeaderboardPage() {
  const [period,  setPeriod]  = useState<Period>("all_time");
  const [sortBy,  setSortBy]  = useState<SortKey>("totalEarned");
  const [rows,    setRows]    = useState<LeaderRow[]>([]);
  const [meta,    setMeta]    = useState<{ my_rank: number | null; total_participants: number }>({
    my_rank: null, total_participants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&limit=50`)
      .then(r => r.json())
      .then(res => {
        setRows(res.data ?? []);
        setMeta({
          my_rank:            res.meta?.my_rank            ?? null,
          total_participants: res.meta?.total_participants ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  // Sort in the UI (API sorts by totalEarned by default)
  const sorted = useMemo(() => {
    if (sortBy === "balance") return [...rows].sort((a, b) => b.balance - a.balance);
    return rows; // API already sorted by totalEarned
  }, [rows, sortBy]);

  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);
  const myRow  = sorted.find(r => r.isMe);
  const totalEarned = rows.reduce((s, r) => s + r.totalEarned, 0);

  // Re-rank after sort
  const withRank = (list: LeaderRow[]) =>
    list.map((r, i) => ({ ...r, rank: i + 1 }));

  const rankedTop3 = withRank(top3);
  const rankedRest = withRank(rest).map(r => ({ ...r, rank: r.rank + top3.length }));

  const trophy = (rank: number) =>
    rank <= 3
      ? <MTrophy className={cn("w-4 h-4", rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-400" : "text-amber-500")} />
      : null;

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [rankedTop3[1], rankedTop3[0], rankedTop3[2]].filter(Boolean);
  const podiumHeights = [PODIUM_HEIGHT[1], PODIUM_HEIGHT[0], PODIUM_HEIGHT[2]];
  const podiumMedalIdx = [1, 0, 2];

  return (
    <AppLayout title="Leaderboard">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MTrophy className="w-6 h-6 text-amber-500" aria-hidden="true" />
            Leaderboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            See how you rank among eco champions in your community.
          </p>
        </div>
        <div className="relative w-20 h-20 flex-shrink-0 hidden md:block">
          <Image src="/assets/image/leaderboard-dashboard/leaderboard_trophy.png"
            alt="Leaderboard trophy" fill className="object-contain" loading="lazy" />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Participants",
            value: loading ? "…" : meta.total_participants.toLocaleString(),
            sub:   "Active eco champions",
          },
          {
            label: "Total Tokens Earned",
            value: loading ? "…" : totalEarned.toLocaleString() + " GTK",
            sub:   "Earned by community",
          },
          {
            label: "Your Rank",
            value: loading ? "…" : (meta.my_rank ? `#${meta.my_rank}` : "—"),
            sub:   meta.my_rank
              ? `Out of ${meta.total_participants}`
              : "Submit an action to rank",
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Period tabs + sort ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                period === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}>
              {label}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}
          aria-label="Sort leaderboard"
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="totalEarned">Sort by Total Earned</option>
          <option value="balance">Sort by Current Balance</option>
        </select>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="space-y-3 animate-pulse">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-14 bg-white rounded-xl border border-gray-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <MTrophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">No rankings yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to submit a verified action!</p>
        </div>
      ) : (
        <>
          {/* ── Top 3 Podium ── */}
          {rankedTop3.length >= 1 && (
            <div className="bg-gradient-to-br from-primary-600 to-emerald-700 rounded-2xl p-6 mb-5 shadow-lg">
              <p className="text-center text-xs font-bold text-white/60 uppercase tracking-widest mb-6">
                {period === "all_time" ? "All-Time Champions" : period === "monthly" ? "This Month's Champions" : "This Week's Champions"}
              </p>
              <div className="flex items-end justify-center gap-4">
                {podiumOrder.map((row, pi) => {
                  if (!row) return <div key={pi} className="w-24" />;
                  const medalIdx = podiumMedalIdx[pi];
                  return (
                    <div key={row.userId} className="flex flex-col items-center gap-2 w-24">
                      {/* Avatar */}
                      <div className={cn(
                        "w-14 h-14 rounded-full ring-4 flex items-center justify-center text-lg font-bold shadow-lg",
                        row.isMe ? "ring-white" : MEDAL_RING[medalIdx],
                        "bg-white"
                      )}>
                        <span className={cn("text-sm font-bold", MEDAL_TEXT[medalIdx])}>
                          {initials(row.displayName)}
                        </span>
                      </div>
                      {/* Name */}
                      <p className={cn("text-xs font-bold text-center text-white truncate w-full text-center",
                        row.isMe && "underline underline-offset-2")}>
                        {row.displayName}
                        {row.isMe && <span className="block text-white/70 text-[10px]">You</span>}
                      </p>
                      {/* Tokens */}
                      <p className="text-xs text-white/80 font-semibold">
                        {(sortBy === "balance" ? row.balance : row.totalEarned).toLocaleString()} GTK
                      </p>
                      {/* Podium block */}
                      <div className={cn(
                        "w-full rounded-t-xl flex items-center justify-center",
                        MEDAL_BG[medalIdx], podiumHeights[pi]
                      )}>
                        <span className={cn("text-lg font-black", MEDAL_TEXT[medalIdx])}>
                          #{row.rank}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Your position banner (if outside top 3) ── */}
          {myRow && myRow.rank > 3 && (
            <div className="flex items-center gap-4 bg-primary-50 border border-primary-200 rounded-xl px-5 py-3 mb-4">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", avatarColor(myRow.userId))}>
                {initials(myRow.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary-800">Your position</p>
                <p className="text-xs text-primary-600 truncate">{myRow.displayName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-black text-primary-700">#{meta.my_rank}</p>
                <p className="text-xs text-primary-500">{myRow.totalEarned.toLocaleString()} GTK earned</p>
              </div>
              <MTrending className="w-4 h-4 text-primary-400 flex-shrink-0" aria-hidden="true" />
            </div>
          )}

          {/* ── Full rankings table ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">
                {period === "all_time" ? "Full Rankings" : period === "monthly" ? "Monthly Rankings" : "Weekly Rankings"}
              </p>
              <p className="text-xs text-gray-400">{sorted.length} participants</p>
            </div>

            <table className="w-full text-sm">
              <caption className="sr-only">Community GreenToken leaderboard</caption>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Rank", "Participant", "Total Earned", "Balance", ""].map((h, i) => (
                    <th key={i} scope="col"
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...rankedTop3, ...rankedRest].map(row => (
                  <tr key={row.userId}
                    className={cn(
                      "transition-colors",
                      row.isMe
                        ? "bg-primary-50 hover:bg-primary-100"
                        : "hover:bg-gray-50"
                    )}>

                    {/* Rank */}
                    <td className="px-5 py-3.5 w-16">
                      <span className={cn(
                        "inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold",
                        row.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                        row.rank === 2 ? "bg-gray-300 text-gray-700"    :
                        row.rank === 3 ? "bg-amber-500 text-white"       :
                                         "bg-gray-100 text-gray-600"
                      )}>
                        {row.rank}
                      </span>
                    </td>

                    {/* Participant */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                          avatarColor(row.userId)
                        )}>
                          {initials(row.displayName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {row.displayName}
                            {row.isMe && (
                              <span className="ml-2 text-[10px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {MEDAL_LABEL[row.rank - 1] ?? `Rank #${row.rank}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total Earned */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MCoin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-gray-900">
                          {row.totalEarned.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">GTK</span>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "text-sm font-semibold",
                        row.balance > 0 ? "text-primary-600" : "text-gray-400"
                      )}>
                        {row.balance.toLocaleString()} GTK
                      </span>
                    </td>

                    {/* Trophy */}
                    <td className="px-5 py-3.5 text-right">
                      {trophy(row.rank)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-center text-gray-400 py-3 border-t border-gray-50">
              Rankings update in real time · Only verified actions count
            </p>
          </div>
        </>
      )}
    </AppLayout>
  );
}
