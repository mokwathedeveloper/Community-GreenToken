"use client";

// Spec: ux_ui/feature_specv2/impact_page_md.md
// Mockup: mockup/impact_page_mockup.png

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const W = 460, H = 190;
  const PAD = { top: 16, right: 12, bottom: 28, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...data.map(d => d.value));
  const xStep = innerW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + innerH - (d.value / max) * innerH,
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
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
            {t.label}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#16a34a" stroke="white" strokeWidth="1.5" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fill="#9ca3af" fontSize="10">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ── Static data ────────────────────────────────────────────────────────────
const STATS = [
  { value: 2458721,  unit: "",    label: "Verified Actions",   icon: "✅" },
  { value: 18734254, unit: "",    label: "GreenTokens Minted", icon: "🪙" },
  { value: 142389,   unit: "",    label: "Active Members",     icon: "👥" },
  { value: 7892450,  unit: " kg", label: "CO₂ Offset",         icon: "🌿" },
  { value: 3245769,  unit: "",    label: "Tokens Donated",     icon: "❤️" },
];

const TOP_PROJECTS = [
  { name: "Reforestation Project", donated: 1450000, goal: 2000000, img: "/assets/image/pages/impact/impact_hero.png" },
  { name: "Millennium Project",    donated: 1220000, goal: 1500000, img: "/assets/image/pages/about-us/about_us_hero.png" },
  { name: "Clean Ocean Access",    donated: 980000,  goal: 1200000, img: "/assets/image/pages/how-it-works/how_it_works_hero.png" },
  { name: "Solar Micro-Grid",      donated: 840000,  goal: 1000000, img: "/assets/image/dashboard/dashboard_cta_banner_nature.png" },
];

const HOW_STEPS = [
  { icon: "♻️", title: "Take Sustainable Actions", desc: "Recycle, plant, carpool — every verified action counts toward community goals." },
  { icon: "🔍", title: "Get Verified & Earn GTK",  desc: "Your actions are verified on the Stellar blockchain and rewarded with GreenTokens." },
  { icon: "❤️", title: "Donate & Fund Projects",   desc: "Allocate your tokens to real eco-projects with full on-chain proof of impact." },
  { icon: "📊", title: "Track Community Progress", desc: "Live metrics show community-wide impact and your personal contribution in real time." },
];

function StatBlock({ value, unit, label, icon, active }: {
  value: number; unit: string; label: string; icon: string; active: boolean;
}) {
  const display = useCountUp(value, active);
  return (
    <div className="flex flex-col items-center text-center px-4 py-5">
      <p className="text-2xl font-extrabold text-gray-900 leading-none tabular-nums">
        {display.toLocaleString()}
        {unit && <span className="text-sm font-semibold text-gray-500 ml-0.5">{unit}</span>}
      </p>
      <p className="text-[11px] text-gray-400 mt-1.5 font-medium uppercase tracking-wide">{label}</p>
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2e14] via-[#0b2e14]/90 to-[#1a4a24]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full flex items-center justify-between gap-10">
          {/* Text */}
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

          {/* Globe illustration */}
          <div className="hidden lg:block relative w-72 h-72 flex-shrink-0">
            <Image
              src="/assets/image/donationsidebar/green_earth_and_sprout.png"
              alt="Green Earth illustration"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="288px"
            />
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
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

            {/* Left: chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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
              <ActionChart range={chartRange} />
              <p className="text-[11px] text-gray-400 mt-2">
                Verified actions recorded on the Stellar blockchain during this period.
              </p>
            </div>

            {/* Right: Top projects */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Top Eco Projects Funded</h2>
              <div className="space-y-4">
                {TOP_PROJECTS.map((p) => {
                  const pct = Math.round((p.donated / p.goal) * 100);
                  return (
                    <div key={p.name} className="flex items-start gap-3">
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <Image src={p.img} alt={p.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold text-gray-800 truncate pr-2">{p.name}</p>
                          <span className="text-xs font-bold text-primary-600 flex-shrink-0">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {p.donated.toLocaleString()} GTK &nbsp;·&nbsp; Goal: {p.goal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/org/setup"
                className="mt-5 block text-center text-xs font-semibold text-primary-600 hover:text-primary-700 py-2 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
                View All Projects →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVERY ACTION CREATES IMPACT ───────────────────────────────────── */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Every Action Creates Impact</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Action submission is tracked monthly to reflect your community&apos;s cumulative environmental footprint.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map(({ icon, title, desc }, idx) => (
              <div key={title}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <span className="absolute top-3 right-4 text-xs font-bold text-gray-200 select-none">
                  0{idx + 1}
                </span>
                <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto mb-3 text-xl">
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BE PART OF THE CHANGE ─────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden text-center">
        {/* banner.png as full background */}
        <Image
          src="/assets/image/banner.png"
          alt="Lush green forest with sprouting plant and GreenToken coin"
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* light white overlay so text is readable over bright bg */}
        <div className="absolute inset-0 bg-white/50" aria-hidden="true" />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div className="w-14 h-14 rounded-full bg-primary-600/90 flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">
            🌿
          </div>
          <h2 className="text-3xl font-extrabold text-primary-900 mb-3 drop-shadow-sm">
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
