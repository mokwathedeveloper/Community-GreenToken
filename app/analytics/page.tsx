"use client";

import { useState, useEffect, type ReactNode } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { MCoin, MHeart, MCheckCircle, MTree, MAir, MWaterDrop, MRecycle, MBusiness, MLock, MBarChart, MLeaf, MWarning } from "@/components/icons";

type OverviewData = {
  totalActions: number; verifiedActions: number; pendingActions: number;
  tokensMinted: number; activeMembers: number;   tokensDonated: number;
};
type TrendPoint = { date: string; total: number; verified: number };
type TypePoint  = { type: string; count: number };

const CHART_COLORS = ["#22c55e","#4ade80","#60a5fa","#fbbf24","#f87171","#a78bfa","#d1d5db"];

/* ── SVG helpers ─────────────────────────────────────────────────────────── */
function buildLinePath(data: { value: number }[], w: number, h: number, pad = 30): string {
  if (data.length < 2) return "";
  const max = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return [x, y] as [number, number];
  });
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
}
function buildAreaPath(data: { value: number }[], w: number, h: number, pad = 30): string {
  if (data.length < 2) return "";
  const line = buildLinePath(data, w, h, pad);
  const lastX = pad + (w - pad * 2), baseY = h - pad, firstX = pad;
  return `${line} L${lastX},${baseY} L${firstX},${baseY} Z`;
}

/* ── Period → date range ──────────────────────────────────────────────────── */
function periodToRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to  = now.toISOString().split("T")[0];
  if (period === "weekly") {
    const from = new Date(now.getTime() - 7 * 86_400_000).toISOString().split("T")[0];
    return { from, to };
  }
  if (period === "monthly") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    return { from, to };
  }
  // all_time: last 365 days
  const from = new Date(now.getTime() - 365 * 86_400_000).toISOString().split("T")[0];
  return { from, to };
}

/* ── Donut chart ─────────────────────────────────────────────────────────── */
function DonutChart({ data, centerValue, centerLabel }: {
  data:         { label: string; pct: number; color: string }[];
  centerValue:  string;
  centerLabel:  string;
}) {
  const total = data.reduce((s, d) => s + d.pct, 0) || 1;
  const r = 56, cx = 68, cy = 68;
  const slices = data.reduce<{ label: string; pct: number; color: string; path: string }[]>(
    (acc, d) => {
      const start = acc.reduce((s, sl) => s + (sl.pct / total) * 360, -90);
      const sweep = (d.pct / total) * 360;
      const a1 = (start * Math.PI) / 180, a2 = ((start + sweep) * Math.PI) / 180;
      const large = sweep > 180 ? 1 : 0;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      return [...acc, { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` }];
    },
    []
  );
  return (
    <svg viewBox="0 0 136 136" className="w-40 h-40 mx-auto" aria-label="Token distribution chart">
      {slices.map(s => <path key={s.label} d={s.path} fill={s.color} />)}
      <circle cx={cx} cy={cy} r={r * 0.58} fill="white" />
      <text x={cx} y={cy - 4}  textAnchor="middle" fontSize="13" fill="#111827" fontWeight="800">{centerValue}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#6b7280">{centerLabel}</text>
    </svg>
  );
}

/* ── Role-aware layout shell ─────────────────────────────────────────────── */
function AnalyticsLayout({ children, isOrgAdmin, orgName }: {
  children:   ReactNode;
  isOrgAdmin: boolean;
  orgName:    string | null;
}) {
  if (isOrgAdmin) {
    return <OrgAdminLayout orgName={orgName ?? "Your Org"} plan="Pro Plan">{children}</OrgAdminLayout>;
  }
  return <AppLayout title="Analytics">{children}</AppLayout>;
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const { isOrgAdmin, orgName, isLoading: userLoading } = useUser();

  const [period,   setPeriod]   = useState("all_time");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trend,    setTrend]    = useState<TrendPoint[]>([]);
  const [byType,   setByType]   = useState<TypePoint[]>([]);
  const [planOk,   setPlanOk]   = useState<boolean | null>(null);
  const [noOrg,    setNoOrg]    = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [loadErr,  setLoadErr]  = useState<string | null>(null);

  // Re-fetch whenever period or user role changes
  useEffect(() => {
    if (userLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const { from, to } = periodToRange(period);

    Promise.all([
      fetch("/api/analytics/overview"),
      fetch(`/api/analytics/actions?from=${from}&to=${to}`),
    ]).then(async ([ovRes, actRes]) => {
      if (ovRes.status === 422) {
        const body = await ovRes.json().catch(() => ({}));
        if (body?.error?.code === "NO_ORGANIZATION") {
          setNoOrg(true);
        } else {
          setPlanOk(false);
        }
        return;
      }
      if (ovRes.status === 403) {
        setPlanOk(false);
        return;
      }
      setPlanOk(true);
      const [ovJson, actJson] = await Promise.all([ovRes.json(), actRes.json()]);
      if (ovJson.data)   setOverview(ovJson.data);
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
    }).catch((err: unknown) => setLoadErr(err instanceof Error ? err.message : "Failed to load analytics.")).finally(() => setLoading(false));
  }, [userLoading, period]);          // ← period is now a real dependency

  if (userLoading) return null;

  /* ── No org ── */
  if (!loading && noOrg) {
    return (
      <AnalyticsLayout isOrgAdmin={isOrgAdmin} orgName={orgName}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MBusiness className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set up your organization first</h2>
          <p className="text-gray-500 text-sm mb-6">You need to complete org setup before you can view analytics.</p>
          <Link href="/org/setup" className="px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
            Set Up Organization →
          </Link>
        </div>
      </AnalyticsLayout>
    );
  }

  /* ── Plan gate ── */
  if (!loading && planOk === false) {
    return (
      <AnalyticsLayout isOrgAdmin={isOrgAdmin} orgName={orgName}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MLock className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics requires Starter+</h2>
          <p className="text-gray-500 text-sm mb-6">Upgrade to access detailed analytics and impact metrics.</p>
          <Link href="/pricing" className="px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
            View Plans
          </Link>
        </div>
      </AnalyticsLayout>
    );
  }

  /* ── Real data ── */
  const verified  = overview?.verifiedActions ?? 0;
  const tokens    = overview?.tokensMinted    ?? 0;
  const donations = overview?.tokensDonated   ?? 0;
  const actions   = overview?.totalActions    ?? 0;

  const STAT_CARDS: { icon: ReactNode; bg: string; value: string; label: string; subtitle: string }[] = [
    {
      icon:     <MCoin className="w-6 h-6 text-primary-600" />,
      bg:       "bg-primary-50",
      value:    loading ? "—" : tokens.toLocaleString(),
      label:    "Total GTK Minted",
      subtitle: "Tokens distributed by the community",
    },
    {
      icon:     <MHeart className="w-6 h-6 text-red-500" />,
      bg:       "bg-red-50",
      value:    loading ? "—" : donations.toLocaleString(),
      label:    "GTK Donated",
      subtitle: "Tokens allocated to green projects",
    },
    {
      icon:     <MCheckCircle className="w-6 h-6 text-blue-600" />,
      bg:       "bg-blue-50",
      value:    loading ? "—" : actions.toLocaleString(),
      label:    "Total Actions",
      subtitle: `${verified.toLocaleString()} verified`,
    },
  ];

  /* ── Chart ── */
  const chartData = trend.length >= 2
    ? trend.map(d => ({ month: d.date, value: d.total }))
    : [];

  const W = 480, H = 190, PAD = 34;
  const linePath = buildLinePath(chartData, W, H, PAD);
  const areaPath = buildAreaPath(chartData, W, H, PAD);
  const maxVal   = Math.max(...chartData.map(d => d.value), 1);
  const peakIdx  = chartData.reduce((bi, d, i) => d.value > chartData[bi].value ? i : bi, 0);
  const peakX    = chartData.length > 1
    ? PAD + (peakIdx / (chartData.length - 1)) * (W - PAD * 2)
    : W / 2;
  const peakY    = H - PAD - ((chartData[peakIdx]?.value ?? 0) / maxVal) * (H - PAD * 2);

  /* ── Donut ── */
  const totalByType = byType.reduce((s, t) => s + t.count, 0);
  const distribution = byType.length > 0
    ? byType.sort((a, b) => b.count - a.count).slice(0, 6).map((t, i) => ({
        label: t.type,
        pct:   totalByType > 0 ? Math.round((t.count / totalByType) * 100) : 0,
        count: t.count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [];

  /* ── Impact — only real numbers, no fake fallbacks ── */
  const CO2_KG: Record<string, number> = {
    Recycling: 0.5, TreePlanting: 20, Carpooling: 2.5, EnergySaving: 1.5,
    WaterSaving: 0.8, CommunityCleanup: 1.0, CompostingOrganics: 0.7,
    PublicTransport: 2.0, SolarEnergyUse: 3.0, BeachCleanup: 1.2,
  };
  const treeCount  = byType.find(t => t.type === "TreePlanting")?.count ?? 0;
  const co2Tonnes  = byType.reduce((s, t) => s + (CO2_KG[t.type] ?? 0.5) * t.count, 0) / 1000;
  const waterLitres = verified * 50;

  const IMPACT: { icon: ReactNode; value: string; label: string; unit: string }[] = [
    { icon: <MTree      className="w-8 h-8 text-primary-600" />, value: treeCount.toLocaleString(),              label: "Trees Planted",  unit: ""   },
    { icon: <MAir       className="w-8 h-8 text-blue-500" />,    value: co2Tonnes.toFixed(co2Tonnes < 1 ? 2 : 1), label: "CO₂ Avoided",    unit: "t"  },
    { icon: <MWaterDrop className="w-8 h-8 text-cyan-500" />,    value: waterLitres.toLocaleString(),             label: "Water Saved",    unit: "L"  },
    { icon: <MRecycle   className="w-8 h-8 text-primary-500" />, value: (verified * 2).toLocaleString(),          label: "Waste Collected", unit: "kg" },
  ];

  return (
    <AnalyticsLayout isOrgAdmin={isOrgAdmin} orgName={orgName}>

      {loadErr && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{loadErr}</span>
          <button onClick={() => setLoadErr(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics &amp; Impact Metrics</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Track community-wide token distributions and environmental impact.
          </p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          aria-label="Time period"
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all_time">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
        </select>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {STAT_CARDS.map(({ icon, bg, value, label, subtitle }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${bg}`} aria-hidden="true">
              {icon}
            </div>
            <p className={`text-3xl font-extrabold text-gray-900 ${loading && "animate-pulse"}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Community Growth (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Community Growth Over Time</h3>
            <span className="text-xs bg-primary-50 text-primary-700 font-semibold px-2.5 py-1 rounded-full">Actions</span>
          </div>

          {chartData.length >= 2 ? (
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280, height: 190 }}
                role="img" aria-label="Community growth line chart">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map(t => {
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
                <path d={areaPath} fill="url(#areaGrad)" />
                <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {chartData.map((d, i) => {
                  const x = PAD + (i / (chartData.length - 1)) * (W - PAD * 2);
                  const y = H - PAD - (d.value / maxVal) * (H - PAD * 2);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
                      <text x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.month}</text>
                    </g>
                  );
                })}
                {(chartData[peakIdx]?.value ?? 0) > 0 && (
                  <g>
                    <line x1={peakX} y1={peakY - 6} x2={peakX} y2={peakY - 30}
                      stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2" />
                    <rect x={peakX - 24} y={peakY - 46} width={48} height={18} rx="5" fill="#22c55e" />
                    <text x={peakX} y={peakY - 34} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
                      {maxVal} actions
                    </text>
                  </g>
                )}
              </svg>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MLeaf className="w-8 h-8 text-gray-200 mb-2" aria-hidden />
              <p className="text-xs font-medium text-gray-400">No action data for this period</p>
              <p className="text-xs text-gray-300 mt-0.5">Submit eco-actions to see your growth trend here</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <MBarChart className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Showing actions submitted within the selected period.
          </p>
        </div>

        {/* Distribution donut (1/3) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Action Type Distribution</h3>

          {distribution.length > 0 ? (
            <>
              <DonutChart
                data={distribution}
                centerValue={loading ? "—" : actions.toLocaleString()}
                centerLabel="actions"
              />
              <div className="space-y-2 mt-4">
                {distribution.map(({ label, pct, count, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
                    <span className="text-xs text-gray-600 flex-1 truncate">{label}</span>
                    <span className="text-xs font-semibold text-gray-900">{pct}%</span>
                    <span className="text-xs text-gray-400">({count.toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MLeaf className="w-8 h-8 text-gray-200 mb-2" aria-hidden />
              <p className="text-xs text-gray-400">No actions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Projected Impact Summary ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Environmental Impact Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT.map(({ icon, value, label, unit }) => (
            <div key={label} className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                {icon}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {loading ? "—" : value}
                {unit && <span className="text-base font-semibold text-gray-500 ml-1">{unit}</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6 border-t border-gray-50 pt-4">
          * Impact numbers are estimates based on verified actions logged by community members.{" "}
          <Link href="/leaderboard" className="text-primary-600 hover:underline">Learn about our impact methodology →</Link>
        </p>
      </div>

    </AnalyticsLayout>
  );
}
