"use client";

import { useEffect, useRef, useState } from "react";

// Mockup: 128,547 Actions | 2,543,889 Tokens | 45,672 Trees | 312,840 kg Waste
// Count-up animation on viewport entry (Rule R-COMP-06: motion-reduce respected)

const STATS = [
  { value: 128547,  suffix: "",   label: "Actions Verified",  icon: "✅" },
  { value: 2543889, suffix: "",   label: "Tokens Earned",     icon: "🪙" },
  { value: 45672,   suffix: "",   label: "Trees Planted",     icon: "🌳" },
  { value: 312840,  suffix: " kg", label: "Waste Collected",  icon: "♻️" },
];

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
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

function StatCard({ value, suffix, label, icon }: typeof STATS[0]) {
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
    <div ref={ref} className="text-center">
      <div className="text-3xl mb-1" aria-hidden="true">{icon}</div>
      <p className="text-3xl md:text-4xl font-bold text-gray-900">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function StatsRow() {
  return (
    <section
      aria-label="Platform statistics"
      className="bg-primary-50 border-y border-primary-100 py-12"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}
