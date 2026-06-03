"use client";

// Matches mockup: dashboard_page_mockup.png → "Analytics Overview" panel
// Green area line chart with date labels, "This Month" filter, token count annotation

import { useState } from "react";
import { cn } from "@/lib/utils";

const PERIOD_DATA = {
  week: [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 78 },
    { label: "Wed", value: 62 },
    { label: "Thu", value: 95 },
    { label: "Fri", value: 88 },
    { label: "Sat", value: 110 },
    { label: "Sun", value: 130 },
  ],
  month: [
    { label: "Jan 1",  value: 20  },
    { label: "Jan 7",  value: 45  },
    { label: "Jan 14", value: 38  },
    { label: "Jan 21", value: 72  },
    { label: "Jan 28", value: 88  },
    { label: "Feb 4",  value: 65  },
    { label: "Feb 11", value: 105 },
    { label: "Feb 18", value: 130 },
    { label: "Feb 25", value: 118 },
    { label: "Mar 3",  value: 145 },
    { label: "Mar 10", value: 165 },
    { label: "Mar 17", value: 190 },
  ],
  all: [
    { label: "Jan",  value: 30  },
    { label: "Feb",  value: 55  },
    { label: "Mar",  value: 48  },
    { label: "Apr",  value: 80  },
    { label: "May",  value: 105 },
    { label: "Jun",  value: 95  },
    { label: "Jul",  value: 130 },
    { label: "Aug",  value: 155 },
    { label: "Sep",  value: 140 },
    { label: "Oct",  value: 175 },
    { label: "Nov",  value: 200 },
    { label: "Dec",  value: 230 },
  ],
};

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  const d = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  return d;
}

function buildArea(points: { x: number; y: number }[], height: number) {
  if (points.length === 0) return "";
  const line = buildPath(points);
  const last  = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

type Period = "week" | "month" | "all";

interface AnalyticsChartProps {
  className?: string;
}

export default function AnalyticsChart({ className }: AnalyticsChartProps) {
  const [period, setPeriod] = useState<Period>("month");
  const data = PERIOD_DATA[period];

  const W = 460;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 24, left: 32 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = 0;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * chartW,
    y: PAD.top + (1 - (d.value - minVal) / (maxVal - minVal)) * chartH,
    ...d,
  }));

  // Peak point for annotation (highest value)
  const peak = points.reduce((a, b) => (a.value > b.value ? a : b));

  const PERIODS = [
    { key: "week",  label: "7 Days"  },
    { key: "month", label: "30 Days" },
    { key: "all",   label: "All Time"},
  ] as const;

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

      {/* SVG Chart — matches mockup green area line chart */}
      <div className="w-full overflow-hidden" role="img" aria-label="Analytics overview line chart">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
          <defs>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.top + t * chartH;
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
          <path d={buildArea(points, PAD.top + chartH)} fill="url(#greenGrad)" />

          {/* Line */}
          <path d={buildPath(points)} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p) => (
            <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#22c55e" stroke="white" strokeWidth="1.5" />
          ))}

          {/* Peak annotation — matches mockup "1,000 GTK" callout */}
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

          {/* X-axis labels */}
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

      {/* Bottom stats row — matches mockup: 320 | 24 | 24.6 GTK | 24.6 kg CO₂ */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-50">
        {[
          { label: "Actions",      value: "320",     color: "text-primary-600" },
          { label: "Trees",        value: "24",       color: "text-emerald-600" },
          { label: "GTK Earned",   value: "24.6",     color: "text-primary-600" },
          { label: "CO₂ Offset",   value: "24.6 kg",  color: "text-blue-600"   },
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
