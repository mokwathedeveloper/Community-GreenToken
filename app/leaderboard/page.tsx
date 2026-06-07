"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import AppLayout from "@/components/layouts/AppLayout";
import { cn } from "@/lib/utils";
import { MTrophy, MCoin, MTrending, MCrown, MStar } from "@/components/icons";

type Period  = "all_time" | "monthly" | "weekly";
type SortKey = "totalEarned" | "balance";

const TABS: { key: Period; label: string; icon: string }[] = [
  { key: "all_time", label: "All Time", icon: "public"   },
  { key: "monthly",  label: "Monthly",  icon: "calendar_month" },
  { key: "weekly",   label: "Weekly",   icon: "date_range"     },
];

type LeaderRow = {
  rank:        number;
  userId:      string;
  displayName: string;
  balance:     number;
  totalEarned: number;
  isMe?:       boolean;
};

// Gradient avatars — deterministic per userId
const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-600",
  "from-blue-400    to-indigo-600",
  "from-violet-400  to-purple-600",
  "from-rose-400    to-pink-600",
  "from-amber-400   to-orange-500",
  "from-cyan-400    to-sky-600",
  "from-fuchsia-400 to-pink-600",
  "from-lime-400    to-green-600",
];
function avatarGradient(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Podium medal config — index 0 = gold, 1 = silver, 2 = bronze
const MEDAL = [
  {
    label:      "1st Place",
    ringColor:  "ring-yellow-400",
    podiumBg:   "bg-gradient-to-t from-yellow-500 to-yellow-300",
    podiumText: "text-yellow-900",
    badgeBg:    "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
    height:     "h-32",
    avatarSize: "w-20 h-20 text-xl",
  },
  {
    label:      "2nd Place",
    ringColor:  "ring-gray-300",
    podiumBg:   "bg-gradient-to-t from-gray-400 to-gray-300",
    podiumText: "text-gray-700",
    badgeBg:    "bg-white/10 text-white/80 border-white/20",
    height:     "h-24",
    avatarSize: "w-16 h-16 text-base",
  },
  {
    label:      "3rd Place",
    ringColor:  "ring-amber-600",
    podiumBg:   "bg-gradient-to-t from-amber-700 to-amber-500",
    podiumText: "text-amber-100",
    badgeBg:    "bg-white/10 text-white/80 border-white/20",
    height:     "h-20",
    avatarSize: "w-14 h-14 text-sm",
  },
];

// Rank table badge colours
const RANK_BADGE: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-sm",
  2: "bg-gradient-to-br from-gray-300  to-gray-400  text-gray-700",
  3: "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
};

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

  const sorted = useMemo(() => {
    if (sortBy === "balance") return [...rows].sort((a, b) => b.balance - a.balance);
    return rows;
  }, [rows, sortBy]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myRow = sorted.find(r => r.isMe);
  const totalEarned = rows.reduce((s, r) => s + r.totalEarned, 0);

  // Assign display rank after client-side sort
  const ranked = (list: LeaderRow[], offset = 0) =>
    list.map((r, i) => ({ ...r, rank: i + 1 + offset }));

  const rankedTop3 = ranked(top3);
  const rankedRest = ranked(rest, top3.length);

  // Podium order: silver(2nd) | gold(1st) | bronze(3rd)
  const podiumSlots = [rankedTop3[1], rankedTop3[0], rankedTop3[2]];
  const podiumMedalIdx = [1, 0, 2];

  const trophy = (rank: number) =>
    rank === 1 ? <MCrown className="w-4 h-4 text-yellow-400" /> :
    rank === 2 ? <MStar  className="w-4 h-4 text-gray-400"   /> :
    rank === 3 ? <MTrophy className="w-4 h-4 text-amber-500" /> : null;

  const periodLabel =
    period === "all_time" ? "All-Time Champions" :
    period === "monthly"  ? "This Month's Champions" :
                            "This Week's Champions";

  return (
    <AppLayout title="Leaderboard">

      {/* ── Page header ─────────────────────────────────────────────────── */}
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

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Participants",
            value: loading ? "…" : meta.total_participants.toLocaleString(),
            sub:   "Active eco champions",
            icon:  <MPeople />,
          },
          {
            label: "Community Tokens",
            value: loading ? "…" : `${totalEarned.toLocaleString()} GTK`,
            sub:   "Earned collectively",
            icon:  <MCoin />,
          },
          {
            label: "Your Rank",
            value: loading ? "…" : (meta.my_rank ? `#${meta.my_rank}` : "—"),
            sub:   meta.my_rank
              ? `Out of ${meta.total_participants} participants`
              : period !== "all_time" ? "No activity this period" : "Earn tokens to rank",
            icon:  <MTrophy />,
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Period tabs + sort ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                period === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}>
              <span className="material-icons text-base leading-none" aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}
          aria-label="Sort leaderboard"
          className="text-xs border border-gray-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm">
          <option value="totalEarned">Sort by Total Earned</option>
          <option value="balance">Sort by Current Balance</option>
        </select>
      </div>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-72 bg-gray-100 rounded-2xl" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-14 bg-white rounded-xl border border-gray-100" />
          ))}
        </div>

      ) : rows.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MTrophy className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-700">
            {period === "all_time" ? "No participants yet"
             : period === "monthly" ? "No activity this month"
             : "No activity this week"}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            {period === "all_time"
              ? "Members appear here once they earn their first GreenTokens."
              : "Rankings update when members have verified actions in this period."}
          </p>
        </div>

      ) : (
        <>
          {/* ── Podium ─────────────────────────────────────────────────── */}
          {rankedTop3.length >= 1 && (
            <div className="relative rounded-2xl overflow-hidden mb-5 shadow-xl">

              {/* Background: dark green gradient with subtle pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.15),transparent_60%)]" />

              <div className="relative px-6 pt-6 pb-0">

                {/* Section title */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <MCrown className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                  <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">
                    {periodLabel}
                  </p>
                  <MCrown className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                </div>

                {/* Champion cards + podium blocks */}
                <div className="flex items-end justify-center gap-3 sm:gap-6">
                  {podiumSlots.map((row, pi) => {
                    if (!row) return <div key={pi} className="w-28 sm:w-32" />;
                    const m   = MEDAL[podiumMedalIdx[pi]];
                    const isFirst = podiumMedalIdx[pi] === 0;
                    return (
                      <div key={row.userId} className="flex flex-col items-center w-28 sm:w-32">

                        {/* Crown icon above rank 1 */}
                        {isFirst && (
                          <div className="mb-1 animate-bounce">
                            <MCrown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" aria-hidden="true" />
                          </div>
                        )}

                        {/* Avatar */}
                        <div className={cn(
                          "rounded-full ring-4 flex items-center justify-center font-black text-white shadow-2xl flex-shrink-0",
                          `bg-gradient-to-br ${avatarGradient(row.userId)}`,
                          m.avatarSize,
                          m.ringColor,
                          isFirst && "shadow-[0_0_24px_rgba(251,191,36,0.4)]"
                        )}>
                          {initials(row.displayName)}
                        </div>

                        {/* "You" chip */}
                        {row.isMe && (
                          <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                            <span className="material-icons text-[10px]">person</span>
                            You
                          </span>
                        )}

                        {/* Name */}
                        <p className={cn(
                          "mt-2 font-bold text-white text-center leading-tight w-full truncate px-1",
                          isFirst ? "text-sm" : "text-xs"
                        )} title={row.displayName}>
                          {row.displayName}
                        </p>

                        {/* Token count */}
                        <div className={cn(
                          "mt-1 mb-3 flex items-center gap-1 px-2.5 py-1 rounded-full border backdrop-blur-sm",
                          m.badgeBg
                        )}>
                          <MCoin className="w-3 h-3 text-amber-300 flex-shrink-0" aria-hidden="true" />
                          <span className={cn("text-xs font-bold", isFirst ? "text-white" : "text-white/80")}>
                            {(sortBy === "balance" ? row.balance : row.totalEarned).toLocaleString()}
                            <span className="font-normal ml-0.5 text-[10px] opacity-70">GTK</span>
                          </span>
                        </div>

                        {/* Podium block */}
                        <div className={cn(
                          "w-full rounded-t-2xl flex flex-col items-center justify-center gap-1 pt-3",
                          m.podiumBg, m.height
                        )}>
                          <span className={cn("text-2xl font-black leading-none", m.podiumText)}>
                            #{row.rank}
                          </span>
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider opacity-70", m.podiumText)}>
                            {m.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── "Your position" banner (outside top 3) ─────────────────── */}
          {myRow && myRow.rank > 3 && (
            <div className="flex items-center gap-4 bg-primary-50 border border-primary-200 rounded-2xl px-5 py-4 mb-5 shadow-sm">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0",
                `bg-gradient-to-br ${avatarGradient(myRow.userId)}`
              )}>
                {initials(myRow.displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-wide">Your position</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{myRow.displayName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black text-primary-700">#{meta.my_rank}</p>
                <p className="text-xs text-primary-500">
                  {myRow.totalEarned.toLocaleString()} GTK earned
                </p>
              </div>
              <MTrending className="w-4 h-4 text-primary-400 flex-shrink-0" aria-hidden="true" />
            </div>
          )}

          {/* ── Full rankings table ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons text-gray-400 text-base" aria-hidden="true">format_list_numbered</span>
                <p className="text-sm font-bold text-gray-900">Full Rankings</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {sorted.length} participants
              </span>
            </div>

            <table className="w-full text-sm">
              <caption className="sr-only">Community GreenToken leaderboard rankings</caption>
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  {["Rank", "Participant", "Total Earned", "Balance", ""].map((h, i) => (
                    <th key={i} scope="col"
                      className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...rankedTop3, ...rankedRest].map(row => (
                  <tr key={row.userId}
                    className={cn(
                      "group transition-colors",
                      row.isMe
                        ? "bg-primary-50/60 hover:bg-primary-50"
                        : "hover:bg-gray-50/80"
                    )}>

                    {/* Rank */}
                    <td className="px-5 py-4 w-16">
                      <span className={cn(
                        "inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-black",
                        RANK_BADGE[row.rank] ?? "bg-gray-100 text-gray-500"
                      )}>
                        {row.rank}
                      </span>
                    </td>

                    {/* Participant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 w-9 h-9",
                          `bg-gradient-to-br ${avatarGradient(row.userId)}`
                        )}>
                          {initials(row.displayName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 leading-tight">
                              {row.displayName}
                            </p>
                            {row.isMe && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700">
                                <span className="material-icons text-[10px]">person</span>
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {row.rank === 1 ? "Gold — All-Time Champion"  :
                             row.rank === 2 ? "Silver — Runner-up"        :
                             row.rank === 3 ? "Bronze — Third Place"      :
                             `Ranked #${row.rank}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total earned */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <MCoin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" aria-hidden="true" />
                        <span className="font-bold text-gray-900">{row.totalEarned.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">GTK</span>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "text-sm font-semibold",
                        row.balance > 0 ? "text-primary-600" : "text-gray-300"
                      )}>
                        {row.balance.toLocaleString()} GTK
                      </span>
                    </td>

                    {/* Trophy */}
                    <td className="px-5 py-4 text-right">
                      {trophy(row.rank)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="material-icons text-[14px]">verified</span>
                Only verified eco-actions count toward rankings
              </p>
              <p className="text-xs text-gray-300">Updates in real time</p>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

// Inline icon components used in stat row (avoids unused import warnings)
function MPeople() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
}
