"use client";

import { useEffect, useRef, useState } from "react";

// Google Material Icons — filled SVG paths

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}
function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  );
}
function IconTree() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M17 12h-5V7h5l-2.5-5-2.5 5H7V7H2l5 5H5l7 7 7-7h-2z"/>
    </svg>
  );
}
function IconRecycle() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
      <path d="M12 4l-1.41 1.41L12.17 7H6.83l1.41-1.41L6.83 4 3.41 7.41 6.83 10.83l1.41-1.41L6.83 8h5.34l-1.41 1.41 1.41 1.42 3.42-3.42L12 4zm-7.24 9.08L2 17.24l3.42 3.42 1.41-1.41-2.09-2.09h4.26v3l3.41-3.41L9 14.34v3H4.75l2.09-2.09-1.08-1.08-.41-.41-.59.67zm14.48 0l-.59-.67-.41.41-1.08 1.08 2.09 2.09H15v-3l-3.41 3.41L15 19.57v-3h4.25l-2.09 2.09 1.41 1.41L22 16.76l-2.76-3.68z"/>
    </svg>
  );
}

const STATS = [
  { value: 128547,  suffix: "",    label: "Actions Verified", IconComp: IconCheck  },
  { value: 2543889, suffix: "",    label: "Tokens Earned",    IconComp: IconCoin   },
  { value: 45672,   suffix: "",    label: "Trees Planted",    IconComp: IconTree   },
  { value: 312840,  suffix: " kg", label: "Waste Collected",  IconComp: IconRecycle},
];

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Defer to next animation frame — avoids synchronous setState inside effect body
      const raf = requestAnimationFrame(() => setCount(target));
      return () => cancelAnimationFrame(raf);
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function StatCard({ value, suffix, label, IconComp }: typeof STATS[0]) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, 1400, active);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shadow-inner text-white">
        <IconComp />
      </div>
      <p className="text-2xl md:text-4xl font-extrabold text-white tabular-nums leading-none">
        {count.toLocaleString()}
        {suffix && <span className="text-base md:text-xl font-semibold ml-0.5">{suffix.trim()}</span>}
      </p>
      <p className="text-xs md:text-sm text-primary-200 font-medium">{label}</p>
    </div>
  );
}

export default function StatsRow() {
  return (
    <section aria-label="Platform statistics" className="bg-primary-800 py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}
