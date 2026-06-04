"use client";

// Rebuilt to match mockup/analytics_metrics_page_mockup.png exactly
// Real SVG line chart + SVG donut chart — no external charting library needed

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Link from "next/link";

type OverviewData = {
  totalActions: number; verifiedActions: number; pendingActions: number;
  tokensMinted: number; activeMembers: number;   tokensDonated: number;
};

type TrendPoint = { date: string; total: number; verified: number };
type TypePoint  = { type: string; count: number };

const CHART_COLORS = ["#22c55e","#4ade80","#60a5fa","#fbbf24","#f87171","#a78bfa","#d1d5db"];

// Build SVG path from data
function buildLinePath(data: { value: number }[], w: number, h: number, pad = 30): string {
  const max = Math.max(...data.map((d) => d.value));
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
}

function buildAreaPath(data: { value: number }[], w: number, h: number, pad = 30): string {
  const line = buildLinePath(data, w, h, pad);
  const max = Math.max(...data.map((d) => d.value));
  const lastX = pad + (w - pad * 2);
  const baseY = h - pad;
  const firstX = pad;
  return `${line} L${lastX},${baseY} L${firstX},${baseY} Z`;
}

// SVG donut chart
function DonutChart({ data, totalCount }: { data: { label: string; pct: number; tokens: string; color: string }[]; totalCount: number }) {
  const total = data.reduce((s, d) => s + d.pct, 0);
  let cursor = -90; // start at top
  const r = 52, cx = 68, cy = 68;
  const circ = 2 * Math.PI * r;

  const slices = data.map((d) => {
    const startAngle = cursor;
    const sweepAngle = (d.pct / total) * 360;
    cursor += sweepAngle;
    const a1 = (startAngle * Math.PI) / 180;
    const a2 = ((startAngle + sweepAngle) * Math.PI) / 180;
    const large = sweepAngle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` };
  });

  return (
    <svg viewBox="0 0 136 136" className="w-36 h-36 mx-auto" aria-label="Token distribution donut chart">
      {slices.map((s) => (
        <path key={s.label} d={s.path} fill={s.color} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#111827" fontWeight="700">{totalCount}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#9ca3af">Actions</text>
    </svg>
  );
}

export default function AnalyticsPage() {
  const [period,    setPeriod]    = useState("all_time");
  const [overview,  setOverview]  = useState<OverviewData | null>(null);
  const [trend,     setTrend]     = useState<TrendPoint[]>([]);
  const [byType,    setByType]    = useState<TypePoint[]>([]);
  const [planOk,    setPlanOk]    = useState<boolean | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/overview"),
      fetch("/api/analytics/actions"),
    ]).then(async ([ovRes, actRes]) => {
      if (ovRes.status === 422) { setPlanOk(false); return; }
      setPlanOk(true);
      const [ovJson, actJson] = await Promise.all([ovRes.json(), actRes.json()]);
      if (ovJson.data)  setOverview(ovJson.data);
      if (actJson.data) {
        setTrend(
          (actJson.data.trend ?? []).map((d: { date: string; total: number; verified: number }) => ({
            date:     new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
            total:    d.total,
            verified: d.verified,
          }))
        );
        setByType(actJson.data.by_type ?? []);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = overview
    ? [
        { icon: "🪙", label: "Total Tokens",    value: overview.tokensMinted.toLocaleString(),  change: `${overview.activeMembers} active members`,  bg: "bg-primary-50", iconColor: "text-primary-600" },
        { icon: "❤️", label: "Tokens Donated",  value: overview.tokensDonated.toLocaleString(), change: "To green projects",                          bg: "bg-red-50",     iconColor: "text-red-500"     },
        { icon: "✅", label: "Total Actions",   value: overview.totalActions.toLocaleString(),  change: `${overview.verifiedActions} verified`,       bg: "bg-blue-50",    iconColor: "text-blue-600"    },
      ]
    : [
        { icon: "🪙", label: "Total Tokens",    value: "—", change: "Loading…", bg: "bg-primary-50", iconColor: "text-primary-600" },
        { icon: "❤️", label: "Tokens Donated",  value: "—", change: "Loading…", bg: "bg-red-50",     iconColor: "text-red-500"     },
        { icon: "✅", label: "Total Actions",   value: "—", change: "Loading…", bg: "bg-blue-50",    iconColor: "text-blue-600"    },
      ];

  if (!loading && planOk === false) {
    return (
      <AppLayout title="Analytics">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics requires Starter+</h2>
          <p className="text-gray-500 text-sm mb-6">Upgrade to access detailed analytics and impact metrics.</p>
          <Link href="/pricing" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">View Plans</Link>
        </div>
      </AppLayout>
    );
  }

  // Use real trend data if available, fall back to a flat placeholder
  const chartData = trend.length > 1
    ? trend.map((d) => ({ month: d.date, value: d.total }))
    : [{ month: "Today", value: 0 }, { month: "Now", value: 0 }];

  // Build real distribution from action types
  const totalByType = byType.reduce((s, t) => s + t.count, 0);
  const distribution = byType.length > 0
    ? byType
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((t, i) => ({
          label:  t.type,
          pct:    totalByType > 0 ? Math.round((t.count / totalByType) * 100) : 0,
          tokens: t.count.toLocaleString(),
          color:  CHART_COLORS[i % CHART_COLORS.length],
        }))
    : [{ label: "No actions yet", pct: 100, tokens: "0", color: "#d1d5db" }];

  const W = 480, H = 180, PAD = 32;
  const linePath = buildLinePath(chartData, W, H, PAD);
  const areaPath = buildAreaPath(chartData, W, H, PAD);
  const maxVal   = Math.max(...chartData.map((d) => d.value), 1);
  const peakIdx  = chartData.findIndex((d) => d.value === maxVal);
  const peakX    = PAD + (peakIdx / Math.max(chartData.length - 1, 1)) * (W - PAD * 2);
  const peakY    = H - PAD - (maxVal / maxVal) * (H - PAD * 2);

  return (
    <AppLayout title="Analytics">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics &amp; Impact Metrics</h2>
          <p className="text-sm text-gray-500 mt-1">Track community-wide token distribution, environmental impact, and action trends.</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Time period"
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all_time">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map(({ icon, label, value, change, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl ${bg}`} aria-hidden="true">
              <span className={iconColor}>{icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-primary-600 mt-1">{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Community Growth Chart — real SVG */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Community Growth Over Time</h3>
            <span className="text-xs bg-primary-50 text-primary-700 font-semibold px-2.5 py-1 rounded-full">GTK Tokens</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ minWidth: 280, height: 180 }}
              role="img"
              aria-label={`Community growth line chart showing token increase from Jan '23 to ${chartData[chartData.length - 1].month}`}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = (H - PAD) - t * (H - PAD * 2);
                return (
                  <g key={t}>
                    <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                    <text x={PAD - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                      {Math.round(t * maxVal)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGrad)" />

              {/* Line */}
              <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data points */}
              {chartData.map((d, i) => {
                const x = PAD + (i / (chartData.length - 1)) * (W - PAD * 2);
                const y = H - PAD - (d.value / maxVal) * (H - PAD * 2);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
                    {/* X-axis label */}
                    <text x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.month}</text>
                  </g>
                );
              })}

              {/* Peak annotation */}
              <g>
                <line x1={peakX} y1={peakY - 6} x2={peakX} y2={peakY - 28} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" />
                <rect x={peakX - 22} y={peakY - 44} width={44} height={18} rx="4" fill="#22c55e" />
                <text x={peakX} y={peakY - 32} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">{maxVal} GTK</text>
              </g>
            </svg>
          </div>

          <p className="text-xs text-gray-400 mt-3">📊 Community data shows steady growth, continuing to increase our positive environmental impact.</p>
        </div>

        {/* Token / Action Distribution — real SVG donut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Token / Action Distribution</h3>
          <DonutChart data={distribution} totalCount={totalByType} />
          <div className="space-y-2 mt-4">
            {distribution.map(({ label, pct, tokens, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
                <span className="text-xs text-gray-600 flex-1">{label}</span>
                <span className="text-xs font-medium text-gray-900">{pct}%</span>
                <span className="text-xs text-gray-400">{tokens}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-xs font-semibold text-primary-600 border border-primary-200 rounded-lg py-2 hover:bg-primary-50 transition-colors">
            View Full Breakdown
          </button>
        </div>
      </div>

      {/* Impact summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Projected Impact Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT_STATS.map(({ icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl mb-2" aria-hidden="true">{icon}</div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-5">* Estimates based on actions logged by community members across all eco-campaigns.</p>
      </div>
    </AppLayout>
  );
}
