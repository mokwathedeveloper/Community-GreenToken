"use client";

import { useState, useEffect } from "react";
import { MTrophy } from "@/components/icons";

interface Badge {
  key:    string;
  label:  string;
  icon:   string;
  desc:   string;
  earned: boolean;
}

interface AchievementsData {
  badges:       Badge[];
  earnedCount:  number;
  totalCount:   number;
}

export default function AchievementBadges() {
  const [data,    setData]    = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements/me")
      .then(r => r.json())
      .then(json => { if (json.data) setData(json.data); })
      .catch(() => {/* non-critical widget */})
      .finally(() => setLoading(false));
  }, []);

  const earned = data?.badges.filter(b => b.earned) ?? [];
  const locked = data?.badges.filter(b => !b.earned) ?? [];

  return (
    <section
      aria-label="Achievement badges"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <MTrophy className="w-4 h-4 text-amber-500" aria-hidden="true" />
          Achievements
        </h3>
        {data && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            {data.earnedCount} / {data.totalCount}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Earned badges */}
          {earned.map(b => (
            <div
              key={b.key}
              title={b.desc}
              className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5"
            >
              <span className="text-base leading-none" aria-hidden="true">{b.icon}</span>
              <span className="text-xs font-semibold text-amber-800 flex-1">{b.label}</span>
              <span className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">Earned</span>
            </div>
          ))}

          {/* Locked badges — show up to 3 as motivation */}
          {locked.slice(0, Math.max(0, 4 - earned.length)).map(b => (
            <div
              key={b.key}
              title={b.desc}
              className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 opacity-60"
            >
              <span className="text-base leading-none grayscale" aria-hidden="true">{b.icon}</span>
              <span className="text-xs font-medium text-gray-500 flex-1">{b.label}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Locked</span>
            </div>
          ))}

          {earned.length === 0 && locked.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              Submit your first eco-action to start earning badges.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
