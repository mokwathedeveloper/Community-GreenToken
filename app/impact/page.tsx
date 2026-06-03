"use client";

// Rules: R-FE-01, R-FE-07, R-IMG-02, R-COLOR-02, R-A11Y-01
// Spec: ux_ui/feature_specv2/impact_page_md.md
// Mockup: mockup/impact_page_mockup.png

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";
import ProgressBar from "@/components/ui/ProgressBar";

// Count-up animation — respects prefers-reduced-motion (R-FE-12)
function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target); return;
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

function StatBlock({ value, unit, label, icon, active }:
  { value: number; unit?: string; label: string; icon: string; active: boolean }) {
  const display = useCountUp(value, active);
  return (
    <div className="text-center">
      <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
      <p className="text-3xl font-bold text-gray-900">
        {display.toLocaleString()}{unit && <span className="text-xl text-gray-500 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

const STATS = [
  { value: 2458721,  unit: "",    label: "Community Actions",   icon: "✅" },
  { value: 18734256, unit: "",    label: "Tokens Earned",       icon: "🪙" },
  { value: 162389,   unit: "",    label: "Active Community",    icon: "👥" },
  { value: 7892450,  unit: " kg", label: "CO₂ Offset",         icon: "🌿" },
  { value: 3245769,  unit: "",    label: "Tokens Donated",      icon: "❤️" },
];

const TOP_PROJECTS = [
  { name: "Reforestation Project",  donated: 1450000, goal: 2000000 },
  { name: "Millennium Project",     donated: 1220000, goal: 1500000 },
  { name: "Clean Ocean Access",     donated: 980000,  goal: 1200000 },
  { name: "Solar Micro-Grid",       donated: 840000,  goal: 1000000 },
];

const HOW_ITEMS = [
  { icon: "♻️", title: "Take Sustainable Actions",   desc: "Recycle, plant, carpool — every verified action counts." },
  { icon: "🔍", title: "Get Verified & Earn GTK",     desc: "Your actions are verified on the Stellar blockchain." },
  { icon: "❤️", title: "Donate & Fund Projects",      desc: "Allocate your tokens to real eco-projects with on-chain proof." },
  { icon: "📊", title: "Track Community Progress",    desc: "Live metrics show community-wide impact in real time." },
];

export default function ImpactPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

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

      {/* Hero */}
      <section className="relative min-h-[440px] flex items-center overflow-hidden">
        <Image src="/assets/image/pages/impact/impact_hero.png"
          alt="Global eco impact visualization with green technology and community engagement"
          fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-700/40" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Our Community.<br />
            <span className="text-primary-300">Our Collective Impact.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mb-8 leading-relaxed">
            Every action you take creates a ripple of positive change. Together, we&apos;re building a sustainable future for generations to come.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/org/setup"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none shadow-sm">
              View Projects
            </Link>
            <Link href="/how-it-works"
              className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
              Share Impact
            </Link>
          </div>
        </div>
      </section>

      {/* Live stats with count-up */}
      <section
        ref={statsRef}
        aria-labelledby="stats-heading"
        className="py-14 bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 id="stats-heading" className="sr-only">Community impact statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {STATS.map((s) => (
              <StatBlock key={s.label} {...s} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture diagram — R-IMG-02 */}
      <section aria-labelledby="ecosystem-heading" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 id="ecosystem-heading" className="text-2xl font-bold text-gray-900 mb-8">How the Stellar Ecosystem Works</h2>
          <Image
            src="/assets/image/architecture/blockchain_ecosystem_diagram.png"
            alt="Diagram showing the Stellar blockchain ecosystem: users submit eco-actions, ActionRegistry verifies, GreenToken mints rewards, RewardManager handles redemptions"
            width={1448} height={1086}
            className="w-full rounded-2xl shadow-md"
            loading="lazy"
          />
        </div>
      </section>

      {/* Top funded projects */}
      <section aria-labelledby="projects-heading" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 id="projects-heading" className="text-2xl font-bold text-gray-900 mb-8">Top Eco Projects Funded</h2>
          <div className="space-y-5">
            {TOP_PROJECTS.map((p) => {
              const pct = Math.round((p.donated / p.goal) * 100);
              return (
                <div key={p.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                    <span>{p.name}</span>
                    <span className="text-primary-600">{pct}%</span>
                  </div>
                  <ProgressBar value={p.donated} max={p.goal} size="md" />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{p.donated.toLocaleString()} GTK raised</span>
                    <span>Goal: {p.goal.toLocaleString()} GTK</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How every action creates impact */}
      <section aria-labelledby="action-heading" className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 id="action-heading" className="text-2xl font-bold text-gray-900 text-center mb-12">
            Every Action Creates Impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_ITEMS.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA banner */}
      <section className="bg-primary-900 py-10 text-center">
        <p className="text-white/70 text-sm mb-2">Together we&apos;re proving that small actions build a sustainable world.</p>
        <p className="text-white text-lg font-semibold mb-5">🌿 Join Community GreenToken and start your journey.</p>
        <Link href="/org/setup"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none shadow-sm">
          Get Started Free
        </Link>
      </section>
    </PublicLayout>
  );
}
