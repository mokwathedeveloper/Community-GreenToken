"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// CO₂ equivalency thresholds — 1 kg CO₂e ≈ 5 km average car driving
// Sources: EPA vehicle emissions estimates
const KM_PER_KG_CO2 = 5;

function carKm(kg: number): string {
  const km = Math.round(kg * KM_PER_KG_CO2);
  return km.toLocaleString();
}

// 1 tree absorbs ~21.77 kg CO₂ per year → ~0.0417 kg/day
function treeMonths(kg: number): string {
  if (kg <= 0) return "0";
  const months = kg / (21.77 / 12);
  if (months < 1) return `${Math.round(months * 30)} days`;
  return `${months.toFixed(1)} month${months >= 2 ? "s" : ""}`;
}

type ImpactData = {
  co2KgTotal:     number;
  currentStreak:  number;
  longestStreak:  number;
  totalActions:   number;
};

function StreakFlame({ streak }: { streak: number }) {
  if (streak === 0) return null;
  const color = streak >= 30 ? "text-red-500" : streak >= 7 ? "text-orange-500" : "text-amber-400";
  return (
    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${color} flex-shrink-0`} fill="currentColor" aria-hidden="true">
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
    </svg>
  );
}

export default function ImpactSummary() {
  const [data,    setData]    = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/impact/me")
      .then(r => r.json())
      .then((res: { data?: ImpactData }) => {
        if (res.data) setData(res.data);
      })
      .catch(() => { /* non-critical — widget stays hidden on error */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-gray-100 rounded-full" />
          <div className="h-4 bg-gray-100 rounded w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || (data.co2KgTotal === 0 && data.currentStreak === 0 && data.totalActions === 0)) {
    return null;
  }

  const co2 = data.co2KgTotal;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-500" fill="currentColor" aria-hidden="true">
            <path d="M17 12h-5V7h5l-2.5-5-2.5 5H7V7H2l5 5H5l7 7 7-7h-2z"/>
          </svg>
          <h3 className="text-sm font-bold text-gray-900">My Environmental Impact</h3>
        </div>
        <Link
          href="/certificates"
          className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          View Certificates →
        </Link>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">

        {/* CO₂ offset */}
        <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-4 border border-primary-100">
          <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wide mb-1">CO₂ Offset</p>
          <p className="text-2xl font-extrabold text-primary-700 tabular-nums leading-none">
            {co2 >= 1000
              ? `${(co2 / 1000).toFixed(1)}t`
              : `${co2.toFixed(1)}`}
            <span className="text-sm font-semibold ml-1 text-primary-500">
              {co2 >= 1000 ? "CO₂e" : "kg"}
            </span>
          </p>
          <p className="text-[10px] text-primary-500 mt-1">
            {data.totalActions} verified action{data.totalActions !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Streak */}
        <div className={`rounded-xl p-4 border ${
          data.currentStreak >= 7
            ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100"
            : "bg-gradient-to-br from-gray-50 to-gray-50 border-gray-100"
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
            data.currentStreak >= 7 ? "text-orange-600" : "text-gray-500"
          }`}>
            {data.currentStreak > 0 ? "Active Streak" : "Best Streak"}
          </p>
          <div className="flex items-center gap-1.5">
            <StreakFlame streak={data.currentStreak} />
            <p className={`text-2xl font-extrabold tabular-nums leading-none ${
              data.currentStreak >= 7 ? "text-orange-600" : "text-gray-700"
            }`}>
              {data.currentStreak > 0 ? data.currentStreak : data.longestStreak}
            </p>
            <span className={`text-sm font-semibold ${
              data.currentStreak >= 7 ? "text-orange-400" : "text-gray-400"
            }`}>
              day{(data.currentStreak || data.longestStreak) !== 1 ? "s" : ""}
            </span>
          </div>
          <p className={`text-[10px] mt-1 ${
            data.currentStreak >= 7 ? "text-orange-500" : "text-gray-400"
          }`}>
            {data.currentStreak > 0
              ? data.currentStreak === 1
                ? "Keep going tomorrow!"
                : `Best: ${data.longestStreak} days`
              : data.longestStreak > 0 ? "Start a new streak!" : "Log an action today"}
          </p>
        </div>
      </div>

      {/* Equivalency bar — only show if there is real CO₂ to display */}
      {co2 > 0 && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">What your offset equals</p>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="Car">🚗</span>
              <span className="text-xs text-gray-600">
                <span className="font-bold text-gray-800">{carKm(co2)} km</span> of car driving avoided
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base" role="img" aria-label="Tree">🌳</span>
              <span className="text-xs text-gray-600">
                <span className="font-bold text-gray-800">{treeMonths(co2)}</span> of tree absorption
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
