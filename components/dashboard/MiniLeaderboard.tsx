"use client";

import Link from "next/link";

// Mockup: left panel of dashboard — top 5 users with tokens and rank badges

interface LeaderEntry {
  rank:    number;
  name:    string;
  handle:  string;
  tokens:  number;
  avatar?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: "bg-yellow-400 text-white",
  2: "bg-gray-300 text-gray-700",
  3: "bg-amber-600 text-white",
};

interface MiniLeaderboardProps {
  entries: LeaderEntry[];
  myRank?: number | null;
}

export default function MiniLeaderboard({ entries, myRank }: MiniLeaderboardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">🏆 Leaderboard</h3>
        {myRank && (
          <span className="text-xs text-gray-400">Your rank: <strong className="text-primary-600">#{myRank}</strong></span>
        )}
      </div>

      <div className="space-y-2.5">
        {entries.map((e) => (
          <div key={e.rank} className="flex items-center gap-3">
            {/* Rank badge */}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${RANK_COLORS[e.rank] ?? "bg-gray-100 text-gray-600"}`}>
              {e.rank}
            </span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
              {e.name.charAt(0)}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{e.name}</p>
              <p className="text-xs text-gray-400 truncate">{e.handle}</p>
            </div>

            {/* Tokens */}
            <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
              {e.tokens.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/leaderboard"
        className="mt-4 flex items-center justify-center text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors py-2 border-t border-gray-100"
      >
        View Full Leaderboard →
      </Link>
    </div>
  );
}
