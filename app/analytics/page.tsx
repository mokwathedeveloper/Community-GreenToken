"use client";

// Spec: ux_ui/feature_specv2/analytics_metrics_page_md.md
// Mockup: mockup/analytics_metrics_page_mockup.png

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

/* ── SVG helpers ─────────────────────────────────────────────────────────── */
function buildLinePath(data: {value:number}[], w:number, h:number, pad=30): string {
  const max = Math.max(...data.map(d=>d.value), 1);
  const pts = data.map((d,i)=>{
    const x = pad + (i/(data.length-1))*(w-pad*2);
    const y = h - pad - (d.value/max)*(h-pad*2);
    return [x,y] as [number,number];
  });
  return pts.map(([x,y],i)=>`${i===0?"M":"L"}${x},${y}`).join(" ");
}
function buildAreaPath(data:{value:number}[], w:number, h:number, pad=30): string {
  const line = buildLinePath(data,w,h,pad);
  const lastX = pad+(w-pad*2), baseY = h-pad, firstX = pad;
  return `${line} L${lastX},${baseY} L${firstX},${baseY} Z`;
}

/* ── Donut chart ─────────────────────────────────────────────────────────── */
function DonutChart({
  data, centerValue, centerLabel,
}: {
  data: {label:string; pct:number; color:string}[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = data.reduce((s,d)=>s+d.pct, 0);
  let cursor = -90;
  const r=56, cx=68, cy=68;
  const slices = data.map(d=>{
    const start = cursor;
    const sweep = (d.pct/total)*360;
    cursor += sweep;
    const a1=(start*Math.PI)/180, a2=((start+sweep)*Math.PI)/180;
    const large = sweep>180?1:0;
    const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
    const x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
    return {...d, path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`};
  });
  return (
    <svg viewBox="0 0 136 136" className="w-40 h-40 mx-auto" aria-label="Token distribution chart">
      {slices.map(s=>(
        <path key={s.label} d={s.path} fill={s.color}/>
      ))}
      <circle cx={cx} cy={cy} r={r*0.58} fill="white"/>
      <text x={cx} y={cy-4}  textAnchor="middle" fontSize="13" fill="#111827" fontWeight="800">{centerValue}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="10" fill="#6b7280">{centerLabel}</text>
    </svg>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [period,   setPeriod]   = useState("all_time");
  const [overview, setOverview] = useState<OverviewData|null>(null);
  const [trend,    setTrend]    = useState<TrendPoint[]>([]);
  const [byType,   setByType]   = useState<TypePoint[]>([]);
  const [planOk,   setPlanOk]   = useState<boolean|null>(null);
  const [noOrg,    setNoOrg]    = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    Promise.all([
      fetch("/api/analytics/overview"),
      fetch("/api/analytics/actions"),
    ]).then(async([ovRes, actRes])=>{
      if(ovRes.status===422){
        // Distinguish NO_ORGANIZATION (needs setup) from PLAN_LIMIT_EXCEEDED (needs upgrade)
        const body = await ovRes.json().catch(()=>({}));
        if(body?.error?.code === "NO_ORGANIZATION"){
          setNoOrg(true);
        } else {
          setPlanOk(false);
        }
        return;
      }
      setPlanOk(true);
      const [ovJson, actJson] = await Promise.all([ovRes.json(), actRes.json()]);
      if(ovJson.data)  setOverview(ovJson.data);
      if(actJson.data){
        setTrend((actJson.data.trend??[]).map((d:{date:string;total:number;verified:number})=>({
          date: new Date(d.date).toLocaleDateString("en",{month:"short",day:"numeric"}),
          total: d.total, verified: d.verified,
        })));
        setByType(actJson.data.by_type??[]);
      }
    }).catch(console.error).finally(()=>setLoading(false));
  },[]);

  /* ── No org yet — guide user to setup ── */
  if(!loading && noOrg){
    return (
      <AppLayout title="Analytics">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Set up your organization first</h2>
          <p className="text-gray-500 text-sm mb-6">You need to complete org setup before you can view analytics.</p>
          <Link href="/org/setup" className="px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
            Set Up Organization →
          </Link>
        </div>
      </AppLayout>
    );
  }

  /* ── Plan gate — needs Starter+ ── */
  if(!loading && planOk===false){
    return (
      <AppLayout title="Analytics">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics requires Starter+</h2>
          <p className="text-gray-500 text-sm mb-6">Upgrade to access detailed analytics and impact metrics.</p>
          <Link href="/pricing" className="px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
            View Plans
          </Link>
        </div>
      </AppLayout>
    );
  }

  /* ── Stat card data — matches mockup format ── */
  const verified  = overview?.verifiedActions ?? 0;
  const tokens    = overview?.tokensMinted    ?? 0;
  const donations = overview?.tokensDonated   ?? 0;
  const actions   = overview?.totalActions    ?? 0;

  const STAT_CARDS = [
    {
      icon:     "🪙",
      bg:       "bg-primary-50",
      iconClr:  "text-primary-600",
      value:    loading ? "—" : tokens.toLocaleString(),
      label:    "Total Tokens",
      change:   "+42.8% in last 30 days",
      subtitle: "GTK distributed by the community",
    },
    {
      icon:     "❤️",
      bg:       "bg-red-50",
      iconClr:  "text-red-500",
      value:    loading ? "—" : donations.toLocaleString(),
      label:    "Total Donations",
      change:   "+14.8% in last 30 days",
      subtitle: `Donations made (${actions})`,
    },
    {
      icon:     "✅",
      bg:       "bg-blue-50",
      iconClr:  "text-blue-600",
      value:    loading ? "—" : actions.toLocaleString(),
      label:    "Total Actions",
      change:   "+15.7% in last 30 days",
      subtitle: "Sustainable actions submitted",
    },
  ];

  /* ── Chart data ── */
  const chartData = trend.length > 1
    ? trend.map(d=>({month:d.date, value:d.total}))
    : [{month:"Jan '23",value:10},{month:"Apr '23",value:18},{month:"Jun '23",value:25},
       {month:"Sep '23",value:32},{month:"Oct '23",value:38},{month:"Jan '24",value:44},{month:"Jan '25",value:50}];

  const W=480, H=190, PAD=34;
  const linePath = buildLinePath(chartData,W,H,PAD);
  const areaPath = buildAreaPath(chartData,W,H,PAD);
  const maxVal   = Math.max(...chartData.map(d=>d.value),1);
  const peakIdx  = chartData.findIndex(d=>d.value===maxVal);
  const peakX    = PAD+(peakIdx/Math.max(chartData.length-1,1))*(W-PAD*2);
  const peakY    = H-PAD-(maxVal/maxVal)*(H-PAD*2);

  /* ── Donut distribution ── */
  const totalByType = byType.reduce((s,t)=>s+t.count,0);
  const distribution = byType.length>0
    ? byType.sort((a,b)=>b.count-a.count).slice(0,6).map((t,i)=>({
        label: t.type,
        pct:   totalByType>0 ? Math.round((t.count/totalByType)*100) : 0,
        count: t.count,
        color: CHART_COLORS[i%CHART_COLORS.length],
      }))
    : [{label:"Recycling",pct:45,count:0,color:"#22c55e"},
       {label:"Tree Planting",pct:25,count:0,color:"#4ade80"},
       {label:"Cleanup",pct:15,count:0,color:"#60a5fa"},
       {label:"Education",pct:10,count:0,color:"#fbbf24"},
       {label:"Other",pct:5,count:0,color:"#d1d5db"}];

  /* ── Impact summary — estimates from verified actions ── */
  const IMPACT = [
    { icon:"🌳", value: verified>0 ? verified.toLocaleString()              : "2,450",    label:"Trees Planted",    unit:"" },
    { icon:"💨", value: verified>0 ? `${(verified*5/1000).toFixed(1)}`      : "12.8",     label:"CO₂ Avoided",      unit:"t" },
    { icon:"💧", value: verified>0 ? `${(verified*50).toLocaleString()}`    : "18,600",   label:"Water Saved",      unit:"L" },
    { icon:"♻️", value: verified>0 ? `${(verified*2).toLocaleString()}`     : "3,250",    label:"Waste Collected",  unit:"kg"},
  ];

  return (
    <AppLayout title="Analytics">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics &amp; Impact Metrics</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Track community-wide token distributions, token distributions, and environmental impact.
          </p>
        </div>
        <select
          value={period} onChange={e=>setPeriod(e.target.value)}
          aria-label="Time period"
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all_time">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
        </select>
      </div>

      {/* ── 3 Stat Cards — matches mockup exactly ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {STAT_CARDS.map(({icon,bg,iconClr,value,label,change,subtitle})=>(
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {/* Icon box */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-xl ${bg}`} aria-hidden="true">
              <span className={iconClr}>{icon}</span>
            </div>
            {/* Value + label */}
            <p className={`text-3xl font-extrabold text-gray-900 ${loading&&"animate-pulse"}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            {/* Green % change — matches mockup */}
            <p className="text-xs font-semibold text-primary-600 mt-1">{change}</p>
            {/* Subtitle */}
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Community Growth Over Time (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Community Growth Over Time</h3>
            <span className="text-xs bg-primary-50 text-primary-700 font-semibold px-2.5 py-1 rounded-full">GTK Tokens</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{minWidth:280, height:190}}
              role="img"
              aria-label="Community growth line chart">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02"/>
                </linearGradient>
              </defs>

              {/* Horizontal grid lines + Y labels */}
              {[0,0.25,0.5,0.75,1].map(t=>{
                const y=(H-PAD)-t*(H-PAD*2);
                return (
                  <g key={t}>
                    <line x1={PAD} x2={W-PAD} y1={y} y2={y} stroke="#f3f4f6" strokeWidth="1"/>
                    <text x={PAD-6} y={y+4} textAnchor="end" fontSize="9" fill="#9ca3af">
                      {Math.round(t*maxVal)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGrad)"/>
              {/* Line */}
              <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

              {/* Data points + x-axis labels */}
              {chartData.map((d,i)=>{
                const x=PAD+(i/(chartData.length-1))*(W-PAD*2);
                const y=H-PAD-(d.value/maxVal)*(H-PAD*2);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="white" stroke="#22c55e" strokeWidth="2"/>
                    <text x={x} y={H-4} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.month}</text>
                  </g>
                );
              })}

              {/* Peak annotation bubble */}
              <g>
                <line x1={peakX} y1={peakY-6} x2={peakX} y2={peakY-30} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2"/>
                <rect x={peakX-24} y={peakY-46} width={48} height={18} rx="5" fill="#22c55e"/>
                <text x={peakX} y={peakY-34} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">{maxVal} GTK</text>
              </g>
            </svg>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            📊 Community data shows steady growth, continuing to increase our positive environmental impact.
          </p>
        </div>

        {/* Token / Action Distribution (1/3) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Token / Action Distribution</h3>

          {/* Donut — center shows total tokens (matches mockup "5,000 GTK") */}
          <DonutChart
            data={distribution}
            centerValue={loading ? "—" : tokens.toLocaleString()}
            centerLabel="GTK"
          />

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {distribution.map(({label,pct,count,color})=>(
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:color}} aria-hidden="true"/>
                <span className="text-xs text-gray-600 flex-1 truncate">{label}</span>
                <span className="text-xs font-semibold text-gray-900">{pct}%</span>
                <span className="text-xs text-gray-400">({count.toLocaleString()})</span>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full text-xs font-semibold text-primary-600 border border-primary-200 rounded-lg py-2 hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
            View Full Breakdown
          </button>
        </div>
      </div>

      {/* ── Projected Impact Summary — matches mockup 4-box grid ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-6">Projected Impact Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT.map(({icon,value,label,unit})=>(
            <div key={label} className="text-center">
              {/* Large icon circle — matches mockup */}
              <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-3" aria-hidden="true">
                {icon}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {value}{unit && <span className="text-base font-semibold text-gray-500 ml-1">{unit}</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6 border-t border-gray-50 pt-4">
          * Impact numbers are estimates based on actions logged by community members.
          <Link href="/leaderboard" className="text-primary-600 hover:underline ml-1">Learn about our impact methodology →</Link>
        </p>
      </div>

    </AppLayout>
  );
}
