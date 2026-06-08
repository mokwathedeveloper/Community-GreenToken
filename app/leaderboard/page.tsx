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
  const [period,     setPeriod]     = useState<Period>("all_time");
  const [sortBy,     setSortBy]     = useState<SortKey>("totalEarned");
  const [rows,       setRows]       = useState<LeaderRow[]>([]);
  const [meta,       setMeta]       = useState<{ my_rank: number | null; total_participants: number }>({
    my_rank: null, total_participants: 0,
  });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null);
    fetch(`/api/leaderboard?period=${period}&limit=50`)
      .then(r => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then(res => {
        setRows(res.data ?? []);
        setMeta({
          my_rank:            res.meta?.my_rank            ?? null,
          total_participants: res.meta?.total_participants ?? 0,
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, [period, retryCount]);

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
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="flex justify-center text-primary-400 mb-2">{icon}</div>
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
        <div role="status" aria-label="Loading leaderboard…" aria-busy="true" className="space-y-3 animate-pulse">
          <div aria-hidden="true" className="h-72 bg-gray-100 rounded-2xl" />
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-14 bg-white rounded-xl border border-gray-100" />
          ))}
        </div>

      ) : error ? (
        <div role="alert" className="bg-white rounded-2xl border border-red-100 shadow-sm py-16 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">Failed to load leaderboard</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="mt-4 px-4 py-2 text-xs font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            Try Again
          </button>
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
            <div className="relative rounded-3xl overflow-hidden mb-6 shadow-2xl">

              {/* ── Layer 1: Brand deep-green base ── */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(145deg, #052e16 0%, #14532d 40%, #166534 70%, #052e16 100%)" }} />

              {/* ── Layer 2: Radial spotlight from top-centre ── */}
              <div className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(34,197,94,0.18) 0%, transparent 70%)" }} />

              {/* ── Layer 3: Bottom vignette so podium blocks merge cleanly ── */}
              <div className="absolute bottom-0 left-0 right-0 h-24"
                style={{ background: "linear-gradient(to top, rgba(5,46,22,0.7), transparent)" }} />

              {/* ── Layer 4: Decorative SVG sparkles ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                {/* Scattered dots / stars */}
                {[
                  [10,12],[90,8],[20,55],[80,48],[5,75],[95,70],[50,5],[30,85],[70,80],[15,35],[85,30],
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={`${cx}%`} cy={`${cy}%`}
                    r={i % 3 === 0 ? "1.5" : "1"} fill="rgba(255,255,255,0.15)" />
                ))}
                {/* Leaf accent — top-left */}
                <path d="M30 20 Q18 35 28 50 Q20 35 36 28 Z" fill="rgba(34,197,94,0.12)" />
                {/* Leaf accent — top-right (mirrored, fixed coords) */}
                <path d="M570 20 Q582 35 572 50 Q580 35 564 28 Z" fill="rgba(34,197,94,0.10)" />
              </svg>

              {/* ── Content ── */}
              <div className="relative px-6 pt-8 pb-0">

                {/* Title row */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
                  <div className="flex items-center gap-2">
                    <MCrown className="w-5 h-5 text-amber-400" aria-hidden="true" />
                    <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.25em]">
                      {periodLabel}
                    </span>
                    <MCrown className="w-5 h-5 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
                </div>

                {/* Champion slots */}
                <div className="flex items-end justify-center gap-2 sm:gap-5">
                  {podiumSlots.map((row, pi) => {
                    if (!row) return <div key={pi} className="w-28 sm:w-36" />;
                    const m       = MEDAL[podiumMedalIdx[pi]];
                    const isFirst = podiumMedalIdx[pi] === 0;
                    const tokens  = (sortBy === "balance" ? row.balance : row.totalEarned).toLocaleString();

                    return (
                      <div key={row.userId} className="flex flex-col items-center" style={{ width: isFirst ? 148 : 120 }}>

                        {/* Floating crown above #1 */}
                        {isFirst ? (
                          <div className="mb-2 animate-bounce">
                            <MCrown
                              className="w-8 h-8 text-amber-400"
                              style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,0.9))" }}
                              aria-hidden="true"
                            />
                          </div>
                        ) : (
                          <div className="mb-2 w-8 h-8 flex items-center justify-center">
                            {podiumMedalIdx[pi] === 1
                              ? <MStar   className="w-5 h-5 text-gray-300/80" aria-hidden="true" />
                              : <MTrophy className="w-5 h-5 text-amber-600/80" aria-hidden="true" />}
                          </div>
                        )}

                        {/* Avatar */}
                        <div
                          className={cn(
                            "rounded-full flex items-center justify-center font-black text-white flex-shrink-0",
                            `bg-gradient-to-br ${avatarGradient(row.userId)}`,
                            m.avatarSize,
                          )}
                          style={{
                            boxShadow: isFirst
                              ? "0 0 0 4px #fbbf24, 0 0 28px rgba(251,191,36,0.55), 0 8px 24px rgba(0,0,0,0.4)"
                              : podiumMedalIdx[pi] === 1
                              ? "0 0 0 4px #d1d5db, 0 8px 20px rgba(0,0,0,0.35)"
                              : "0 0 0 4px #d97706, 0 8px 20px rgba(0,0,0,0.35)",
                          }}>
                          {initials(row.displayName)}
                        </div>

                        {/* "You" badge */}
                        {row.isMe && (
                          <div className="mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md"
                            style={{ background: "rgba(22,163,74,0.25)", borderColor: "rgba(34,197,94,0.4)", color: "#86efac" }}>
                            <span className="material-icons" style={{ fontSize: 10 }}>person</span>
                            You
                          </div>
                        )}

                        {/* Display name */}
                        <p className={cn(
                          "mt-2 font-bold text-center leading-snug w-full truncate px-2",
                          isFirst ? "text-sm text-white" : "text-xs text-white/80"
                        )} title={row.displayName}>
                          {row.displayName}
                        </p>

                        {/* GTK token pill */}
                        <div className="mt-1.5 mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm"
                          style={{
                            background: isFirst ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.08)",
                            border:     isFirst ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.15)",
                          }}>
                          <MCoin
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: isFirst ? "#fbbf24" : "#86efac" }}
                            aria-hidden="true"
                          />
                          <span className={cn("text-xs font-extrabold", isFirst ? "text-amber-300" : "text-white/75")}>
                            {tokens}
                          </span>
                          <span className="text-[10px] font-medium opacity-60 text-white">GTK</span>
                        </div>

                        {/* Podium step */}
                        <div className={cn("w-full rounded-t-2xl flex flex-col items-center justify-center gap-0.5 pt-3", m.height)}
                          style={{
                            background: isFirst
                              ? "linear-gradient(180deg,#fde68a 0%,#f59e0b 50%,#d97706 100%)"
                              : podiumMedalIdx[pi] === 1
                              ? "linear-gradient(180deg,#e5e7eb 0%,#9ca3af 50%,#6b7280 100%)"
                              : "linear-gradient(180deg,#fcd34d 0%,#b45309 60%,#92400e 100%)",
                            boxShadow: isFirst
                              ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 -4px 16px rgba(245,158,11,0.3)"
                              : "inset 0 1px 0 rgba(255,255,255,0.2)",
                          }}>
                          <span className={cn("text-2xl font-black leading-none", m.podiumText)}>
                            #{row.rank}
                          </span>
                          <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-75", m.podiumText)}>
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
