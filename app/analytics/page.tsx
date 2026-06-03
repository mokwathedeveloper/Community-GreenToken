"use client";

// Rules: R-FE-01, R-FE-04 (usePlan for plan gate), R-COMP-01, R-A11Y-07
// Spec: ux_ui/feature_specv2/analytics_metrics_page_md.md
// Mockup: mockup/analytics_metrics_page_mockup.png

import { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";

// Phase 2: replace with usePlan('analytics') hook from hooks/usePlan.ts
const PLAN_CAN_ACCESS = true; // mock — will be real JWT plan check

const STATS = [
  { icon: "🪙", label: "Total Tokens",   value: "5,000",  change: "+42.8% in last 30 days", color: "bg-primary-100 text-primary-600" },
  { icon: "❤️", label: "Total Donations", value: "1,200",  change: "+14.8% in last 30 days", color: "bg-red-100 text-red-500"      },
  { icon: "✅", label: "Total Actions",   value: "850",    change: "+15.7% in last 30 days", color: "bg-blue-100 text-blue-600"    },
];

const DISTRIBUTION = [
  { label: "Recycling",       pct: 45, tokens: 2250, color: "bg-primary-500" },
  { label: "Tree Planting",   pct: 25, tokens: 1250, color: "bg-green-400"   },
  { label: "Cleanup",         pct: 15, tokens: 750,  color: "bg-blue-400"    },
  { label: "Education",       pct: 10, tokens: 500,  color: "bg-amber-400"   },
  { label: "Other",           pct: 5,  tokens: 250,  color: "bg-gray-300"    },
];

const IMPACT_STATS = [
  { icon: "🌳", value: "2,450",   label: "Trees Planted" },
  { icon: "💨", value: "12.8 t",  label: "CO₂ Avoided"  },
  { icon: "💧", value: "18,600 L", label: "Water Saved"  },
  { icon: "♻️", value: "3,250 kg", label: "Waste Collected" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("all_time");

  if (!PLAN_CAN_ACCESS) {
    // R-FE-04: plan gate — redirect to UpgradeModal in production
    return (
      <AppLayout title="Analytics">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics requires Starter+</h2>
          <p className="text-gray-500 text-sm mb-6">Upgrade your plan to access detailed analytics and impact metrics.</p>
          <Link href="/pricing"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
            View Plans
          </Link>
        </div>
      </AppLayout>
    );
  }

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

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {STATS.map(({ icon, label, value, change, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl ${color}`} aria-hidden="true">{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-primary-600 mt-1">{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Community growth chart placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Community Growth Over Time</h3>
            <Badge color="green">GTK Tokens</Badge>
          </div>
          {/* Recharts LineChart — Phase 2 */}
          <div role="img" aria-label="Line chart showing community token growth over time — chart renders in Phase 2"
            className="w-full h-48 bg-gradient-to-br from-primary-50 to-green-50 rounded-xl flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-sm font-medium text-primary-600">Community Growth Chart</p>
            <p className="text-xs text-gray-400 mt-1">Recharts LineChart — Phase 2</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">📊 Community data shows steady growth, continuing to increase our positive environmental impact.</p>
        </div>

        {/* Token / Action Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Token / Action Distribution</h3>
          <div role="img" aria-label="Donut chart showing token distribution by action type"
            className="w-32 h-32 rounded-full bg-gradient-conic from-primary-500 via-green-400 to-blue-400 mx-auto mb-4 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <p className="text-sm font-bold text-gray-900">5,000<br /><span className="text-xs text-gray-400 font-normal">GTK</span></p>
            </div>
          </div>
          <div className="space-y-2">
            {DISTRIBUTION.map(({ label, pct, tokens, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />
                <span className="text-xs text-gray-600 flex-1">{label}</span>
                <span className="text-xs font-medium text-gray-900">{pct}%</span>
                <span className="text-xs text-gray-400">{tokens}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact metrics */}
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
        <p className="text-xs text-gray-400 mt-5">* Impact numbers are estimates based on actions logged by community members across all eco-campaigns.</p>
      </div>
    </AppLayout>
  );
}
