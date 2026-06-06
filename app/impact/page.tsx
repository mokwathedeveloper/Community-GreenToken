"use client";

// Spec: ux_ui/feature_specv2/impact_page_md.md
// Mockup: mockup/impact_page_mockup.png

import { useEffect, useRef, useState, type ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2, Coins, Users, Leaf, Heart,
  TrendingUp, RefreshCw, ShieldCheck, BarChart3,
} from "lucide-react";
import PublicLayout from "@/components/layouts/PublicLayout";

// ── Count-up (respects prefers-reduced-motion) ────────────────────────────
function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
    }
    let v = 0;
    const step = target / 80;
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [target, active]);
  return count;
}

// ── SVG Line Chart ────────────────────────────────────────────────────────
type ChartRange = "7d" | "30d" | "all";

const CHART_DATA: Record<ChartRange, { label: string; value: number }[]> = {
  "7d": [
    { label: "Mon", value: 320 }, { label: "Tue", value: 480 },
    { label: "Wed", value: 380 }, { label: "Thu", value: 560 },
    { label: "Fri", value: 490 }, { label: "Sat", value: 610 },
    { label: "Sun", value: 720 },
  ],
  "30d": [
    { label: "May 1",  value: 2100 }, { label: "May 8",  value: 3200 },
    { label: "May 15", value: 2800 }, { label: "May 22", value: 4100 },
    { label: "May 29", value: 3600 }, { label: "Jun 5",  value: 5200 },
  ],
  "all": [
    { label: "Jan", value: 8000  }, { label: "Feb", value: 12000 },
    { label: "Mar", value: 18000 }, { label: "Apr", value: 15000 },
    { label: "May", value: 22000 }, { label: "Jun", value: 28000 },
    { label: "Jul", value: 35000 },
  ],
};

function ActionChart({ range }: { range: ChartRange }) {
  const data = CHART_DATA[range];
  const W = 460, H = 200;
  const PAD = { top: 20, right: 16, bottom: 32, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map(d => d.value));
  const xStep = innerW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + innerH - (d.value / max) * innerH,
    v: d.value,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: PAD.top + innerH - f * innerH,
    label: (f * max).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" } as Intl.NumberFormatOptions),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Community actions over time chart">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Gridlines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke={i === 0 ? "#d1d5db" : "#e5e7eb"} strokeWidth="1" strokeDasharray={i === 0 ? "0" : "4 3"} />
          <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fill="#9ca3af" fontSize="10" fontFamily="system-ui">
            {t.label}
          </text>
        </g>
      ))}
      {/* Vertical gridlines */}
      {pts.map((p, i) => (
        <line key={`vg-${i}`} x1={p.x} y1={PAD.top} x2={p.x} y2={PAD.top + innerH}
          stroke="#f3f4f6" strokeWidth="1" />
      ))}
      {/* Area */}
      <path d={areaPath} fill="url(#chartGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#16a34a" strokeWidth="2" />
          <circle cx={p.x} cy={p.y} r="2.5" fill="#16a34a" />
        </g>
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="system-ui">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ── Static data ────────────────────────────────────────────────────────────
const STATS: {
  value: number; unit: string; label: string;
  Icon: ElementType; iconBg: string; iconColor: string;
  trend: string;
}[] = [
  { value: 2458721,  unit: "",    label: "Verified Actions",   Icon: CheckCircle2, iconBg: "bg-green-50",   iconColor: "text-green-600",  trend: "+12.5%" },
  { value: 18734254, unit: "",    label: "GreenTokens Minted", Icon: Coins,        iconBg: "bg-amber-50",  iconColor: "text-amber-600",  trend: "+8.2%"  },
  { value: 142389,   unit: "",    label: "Active Members",     Icon: Users,        iconBg: "bg-blue-50",   iconColor: "text-blue-600",   trend: "+5.7%"  },
  { value: 7892450,  unit: " kg", label: "CO₂ Offset",         Icon: Leaf,         iconBg: "bg-primary-50",iconColor: "text-primary-600",trend: "+18.9%" },
  { value: 3245769,  unit: "",    label: "Tokens Donated",     Icon: Heart,        iconBg: "bg-red-50",    iconColor: "text-red-500",    trend: "+23.1%" },
];

const TOP_PROJECTS = [
  { name: "Reforestation Project", donated: 1450000, goal: 2000000, img: "/assets/image/pages/impact/impact_hero.png" },
  { name: "Millennium Project",    donated: 1220000, goal: 1500000, img: "/assets/image/pages/about-us/about_us_hero.png" },
  { name: "Clean Ocean Access",    donated: 980000,  goal: 1200000, img: "/assets/image/pages/how-it-works/how_it_works_hero.png" },
  { name: "Solar Micro-Grid",      donated: 840000,  goal: 1000000, img: "/assets/image/dashboard/dashboard_cta_banner_nature.png" },
];

const HOW_STEPS: {
  Icon: ElementType; iconBg: string; iconColor: string; title: string; desc: string;
}[] = [
  { Icon: RefreshCw,   iconBg: "bg-green-50",   iconColor: "text-green-600",  title: "Take Sustainable Actions", desc: "Recycle, plant, carpool — every verified action counts toward community goals." },
  { Icon: ShieldCheck, iconBg: "bg-blue-50",    iconColor: "text-blue-600",   title: "Get Verified & Earn GTK",  desc: "Your actions are verified on the Stellar blockchain and rewarded with GreenTokens." },
  { Icon: Heart,       iconBg: "bg-red-50",     iconColor: "text-red-500",    title: "Donate & Fund Projects",   desc: "Allocate your tokens to real eco-projects with full on-chain proof of impact." },
  { Icon: BarChart3,   iconBg: "bg-amber-50",   iconColor: "text-amber-600",  title: "Track Community Progress", desc: "Live metrics show community-wide impact and your personal contribution in real time." },
];

// ── Stat card ──────────────────────────────────────────────────────────────
function StatBlock({ value, unit, label, Icon, iconBg, iconColor, trend, active }: {
  value: number; unit: string; label: string;
  Icon: ElementType; iconBg: string; iconColor: string;
  trend: string; active: boolean;
}) {
  const display = useCountUp(value, active);
  return (
    <div className="flex flex-col items-center text-center px-4 py-6 group">
      <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center mb-3 shadow-sm ring-1 ring-black/5`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-[1.35rem] font-extrabold text-gray-900 leading-none tabular-nums">
        {display.toLocaleString()}
        {unit && <span className="text-sm font-semibold text-gray-400 ml-0.5">{unit}</span>}
      </p>
      <p className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wide leading-tight">{label}</p>
      <div className="flex items-center gap-0.5 mt-1.5 text-[11px] font-semibold text-green-600">
        <TrendingUp className="w-3 h-3" />
        <span>{trend}</span>
        <span className="text-gray-400 font-normal ml-0.5">this month</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ImpactPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>("30d");

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <PublicLayout>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden bg-[#0b2e14]">
        <Image
          src="/assets/image/pages/impact/impact_hero.png"
          alt="Community members planting trees on a hillside"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-5">
              Our Community.<br />
              <span className="text-primary-400">Our Collective Impact.</span>
            </h1>
            <p className="text-base text-white/75 max-w-md mb-8 leading-relaxed">
              Every action you take creates a ripple of positive change. Together,
              we&apos;re building a sustainable future for generations to come.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/org/setup"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
                View Projects
              </Link>
              <button type="button"
                onClick={() => navigator.share?.({ title: "Community GreenToken Impact", url: location.href })}
                className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
                Share Impact
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-y md:divide-y-0 divide-gray-100">
            {STATS.map((s) => (
              <StatBlock key={s.label} {...s} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CHART + PROJECTS ──────────────────────────────────────────────── */}
      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

            {/* Left: chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <h2 className="text-sm font-bold text-gray-900">Community Actions Over Time</h2>
                <div className="flex gap-1 bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                  {(["7d", "30d", "all"] as ChartRange[]).map((r) => (
                    <button key={r} type="button"
                      onClick={() => setChartRange(r)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        chartRange === r
                          ? "bg-white text-primary-700 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}>
                      {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "All Time"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mb-3">
                Verified actions recorded on the Stellar blockchain.
              </p>
              <ActionChart range={chartRange} />
            </div>

            {/* Right: Top projects */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Top Eco Projects Funded</h2>
                <Link href="/org/setup" className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {TOP_PROJECTS.map((p) => {
                  const pct = Math.round((p.donated / p.goal) * 100);
                  return (
                    <div key={p.name} className="flex items-start gap-3">
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        <Image src={p.img} alt={p.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-gray-800 truncate pr-2">{p.name}</p>
                          <span className="text-xs font-extrabold text-primary-600 flex-shrink-0">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full shadow-sm"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-500 font-medium">
                            {(p.donated / 1000).toFixed(0)}K GTK raised
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Goal: {(p.goal / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVERY ACTION CREATES IMPACT ───────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Every Action Creates Impact</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Action submission is tracked monthly to reflect your community&apos;s cumulative environmental footprint.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map(({ Icon, iconBg, iconColor, title, desc }, idx) => (
              <div key={title}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 text-center">
                <span className="absolute top-3 right-4 text-xs font-bold text-gray-200 select-none tabular-nums">
                  0{idx + 1}
                </span>
                <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-black/5`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BE PART OF THE CHANGE ─────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden text-center">
        <Image
          src="/assets/image/banner.png"
          alt="Lush green forest with sprouting plant and GreenToken coin"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/52" aria-hidden="true" />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Image
              src="/branding/community-greentoken-logo.png"
              alt="Community GreenToken"
              fill
              className="object-contain drop-shadow-md"
              sizes="64px"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-primary-900 mb-3">
            Be Part of the Change
          </h2>
          <p className="text-primary-800/80 text-sm mb-8 leading-relaxed max-w-md mx-auto">
            Join thousands proving that small actions build a sustainable world. Every token earned is a vote for a greener future.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              Get Started Free
            </Link>
            <button type="button"
              onClick={() => navigator.share?.({ title: "Community GreenToken — Be Part of the Change", url: location.href })}
              className="px-8 py-3 bg-white/80 hover:bg-white text-primary-800 font-semibold rounded-xl border border-primary-300 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              Share on Twitter
            </button>
          </div>
        </div>
      </section>


    </PublicLayout>
  );
}
