"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Coins, TreePine, Recycle } from "lucide-react";

// Mockup: 128,547 Actions | 2,543,889 Tokens | 45,672 Trees | 312,840 kg Waste
// Count-up animation on viewport entry

const STATS = [
  { value: 128547,  suffix: "",    label: "Actions Verified", Icon: CheckCircle2, iconBg: "bg-emerald-500/20", iconColor: "text-emerald-300" },
  { value: 2543889, suffix: "",    label: "Tokens Earned",    Icon: Coins,        iconBg: "bg-yellow-500/20",  iconColor: "text-yellow-300"  },
  { value: 45672,   suffix: "",    label: "Trees Planted",    Icon: TreePine,     iconBg: "bg-green-500/20",   iconColor: "text-green-300"   },
  { value: 312840,  suffix: " kg", label: "Waste Collected",  Icon: Recycle,      iconBg: "bg-teal-500/20",    iconColor: "text-teal-300"    },
];

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
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

function StatCard({ value, suffix, label, Icon, iconBg, iconColor }: typeof STATS[0]) {
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
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-3xl md:text-4xl font-extrabold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-primary-200 font-medium">{label}</p>
    </div>
  );
}

export default function StatsRow() {
  return (
    <section
      aria-label="Platform statistics"
      className="bg-primary-800 py-14"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}
