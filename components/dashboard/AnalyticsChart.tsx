"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MLeaf } from "@/components/icons";

export type ChartAction = {
  submitted_at:   string;
  tokens_awarded: number;
  action_type:    string;
  status:         string;
};

// Rough kg CO₂ offset per verified action, by type
const CO2_KG: Record<string, number> = {
  Recycling:          0.5,
  TreePlanting:       20,
  Carpooling:         2.5,
  EnergySaving:       1.5,
  WaterSaving:        0.8,
  CommunityCleanup:   1.0,
  CompostingOrganics: 0.7,
  PublicTransport:    2.0,
  SolarEnergyUse:     3.0,
  BeachCleanup:       1.2,
};

type Period = "week" | "month" | "all";

function buildPeriodData(
  actions: ChartAction[],
  period: Period
): { label: string; value: number }[] {
  const verified = actions.filter((a) => a.status === "verified");
  const now      = new Date();

  if (period === "week") {
    // Last 7 days, one slot per day (oldest → newest left → right)
    const slots: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      slots.push({
        label: d.toLocaleDateString("en", { weekday: "short" }),
        value: 0,
      });
    }
    verified.forEach((a) => {
      const d       = new Date(a.submitted_at);
      const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
      const idx     = 6 - daysAgo;
      if (idx >= 0 && idx < 7) slots[idx].value += a.tokens_awarded;
    });
    return slots;
  }

  if (period === "month") {
    // 6 × 5-day buckets covering the last 30 days
    const slots: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 5);
      slots.push({
        label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        value: 0,
      });
    }
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    verified
      .filter((a) => new Date(a.submitted_at) >= cutoff)
      .forEach((a) => {
        const daysAgo   = Math.ceil((now.getTime() - new Date(a.submitted_at).getTime()) / 86_400_000);
        const bucketIdx = Math.min(5, Math.floor(daysAgo / 5));
        const idx       = 5 - bucketIdx;
        if (idx >= 0 && idx < 6) slots[idx].value += a.tokens_awarded;
      });
    return slots;
  }

  // All time: one slot per month, last 12 months
  const slots: { label: string; value: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({ label: d.toLocaleDateString("en", { month: "short" }), value: 0 });
  }
  verified.forEach((a) => {
    const d         = new Date(a.submitted_at);
    const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    const idx       = 11 - monthDiff;
    if (idx >= 0 && idx < 12) slots[idx].value += a.tokens_awarded;
  });
  return slots;
}

function buildPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function buildArea(pts: { x: number; y: number }[], bottom: number) {
  if (!pts.length) return "";
  const line  = buildPath(pts);
  const last  = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

interface AnalyticsChartProps {
  actions?:   ChartAction[];
  className?: string;
}

const PERIODS = [
  { key: "week",  label: "7 Days"   },
  { key: "month", label: "30 Days"  },
  { key: "all",   label: "All Time" },
] as const;

export default function AnalyticsChart({ actions = [], className }: AnalyticsChartProps) {
  const [period, setPeriod] = useState<Period>("month");

  const data = useMemo(() => buildPeriodData(actions, period), [actions, period]);

  const W   = 460;
  const H   = 160;
  const PAD = { top: 16, right: 16, bottom: 24, left: 36 };
  const cW  = W - PAD.left - PAD.right;
  const cH  = H - PAD.top  - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1); // at least 1 to avoid /0

  const points = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
    y: PAD.top + (1 - d.value / maxVal) * cH,
    ...d,
  }));

  const peak = points.reduce((a, b) => (a.value > b.value ? a : b));

  // Bottom stats — computed from real actions
  const verified    = actions.filter((a) => a.status === "verified");
  const treeCount   = verified.filter((a) => a.action_type === "TreePlanting").length;
  const gtkEarned   = verified.reduce((s, a) => s + (a.tokens_awarded ?? 0), 0);
  const co2Offset   = verified.reduce((s, a) => s + (CO2_KG[a.action_type] ?? 0.5), 0);
  const hasData     = data.some((d) => d.value > 0);

  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Analytics Overview</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                period === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="w-full overflow-hidden" role="img" aria-label="GTK tokens earned over time">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD.top + t * cH;
              return (
                <g key={t}>
                  <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                    stroke="#f0f0f0" strokeWidth="1" />
                  <text x={PAD.left - 4} y={y + 4}
                    textAnchor="end" fontSize="9" fill="#9ca3af">
                    {Math.round(maxVal * (1 - t))}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={buildArea(points, PAD.top + cH)} fill="url(#greenGrad)" />

            {/* Line */}
            <path d={buildPath(points)} fill="none"
              stroke="#22c55e" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {points.map((p) => (
              <circle key={p.label} cx={p.x} cy={p.y} r="3"
                fill="#22c55e" stroke="white" strokeWidth="1.5" />
            ))}

            {/* Peak annotation */}
            {peak.value > 0 && (
              <g>
                <rect x={peak.x - 28} y={peak.y - 28} width={56} height={18}
                  rx="4" fill="#22c55e" />
                <text x={peak.x} y={peak.y - 15}
                  textAnchor="middle" fontSize="9" fontWeight="600" fill="white">
                  {peak.value} GTK
                </text>
                <line x1={peak.x} y1={peak.y - 10} x2={peak.x} y2={peak.y - 1}
                  stroke="#22c55e" strokeWidth="1.5" strokeDasharray="2,2" />
              </g>
            )}

            {/* X-axis labels — skip crowded labels */}
            {points
              .filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)
              .map((p) => (
                <text key={p.label} x={p.x} y={H - 4}
                  textAnchor="middle" fontSize="9" fill="#9ca3af">
                  {p.label}
                </text>
              ))}
          </svg>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MLeaf className="w-8 h-8 text-gray-200 mb-2" aria-hidden />
          <p className="text-xs font-medium text-gray-400">No verified actions yet</p>
          <p className="text-xs text-gray-300 mt-0.5">Submit eco-actions to see your impact here</p>
        </div>
      )}

      {/* Bottom stats — real data */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-50">
        {[
          { label: "Actions",     value: String(actions.length),                       color: "text-primary-600" },
          { label: "Trees",       value: String(treeCount),                             color: "text-emerald-600" },
          { label: "GTK Earned",  value: gtkEarned % 1 === 0
              ? String(gtkEarned)
              : gtkEarned.toFixed(1),                                                   color: "text-primary-600" },
          { label: "CO₂ Est.", value: `${co2Offset < 1 ? co2Offset.toFixed(1) : Math.round(co2Offset)} kg`, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className={cn("text-sm font-bold", color)}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
