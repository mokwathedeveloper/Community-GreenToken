// Impact Page — Community GreenToken
// Route: /impact  (publicly accessible, no auth required)
import { useEffect, useState } from 'react';

const MOCK_STATS = [
  { label: 'Verified Actions',    value: 12_450,   unit: '',   icon: '✅' },
  { label: 'GreenTokens Minted',  value: 248_900,  unit: 'GTK', icon: '🪙' },
  { label: 'Active Members',      value: 3_200,    unit: '',   icon: '👥' },
  { label: 'CO₂ Offset',          value: 18_730,   unit: 'kg', icon: '🌿' },
  { label: 'Tokens Donated',      value: 42_100,   unit: 'GTK', icon: '❤️' },
];

const PROJECTS = [
  { name: 'Cape Flats Tree Planting',   donated: 14_200, goal: 20_000 },
  { name: 'Ocean Plastic Clean-Up',     donated:  9_800, goal: 15_000 },
  { name: 'Solar School Initiative',    donated: 18_100, goal: 25_000 },
];

function CountUp({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

export default function ImpactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-400 py-20 px-6 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Our Community Impact</h1>
        <p className="text-lg opacity-90 max-w-xl mx-auto">
          Real actions. Real tokens. Real environmental change — all verifiable on-chain.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="py-14 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {MOCK_STATS.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-primary">
                <CountUp target={s.value} />
                {s.unit && <span className="text-sm ml-1 font-normal text-text-secondary">{s.unit}</span>}
              </div>
              <p className="text-xs text-text-secondary mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Project Progress */}
      <section className="bg-green-50 py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-text-dark text-center mb-8">Top Funded Projects</h2>
          <div className="space-y-6">
            {PROJECTS.map(p => {
              const pct = Math.min(100, Math.round((p.donated / p.goal) * 100));
              return (
                <div key={p.name} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between text-sm font-medium text-text-dark mb-2">
                    <span>{p.name}</span>
                    <span className="text-primary">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-2">
                    <span>{p.donated.toLocaleString()} GTK donated</span>
                    <span>Goal: {p.goal.toLocaleString()} GTK</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-xl font-bold text-text-dark mb-6">How Tokens Become Impact</h2>
        <img
          src="/assets/image/architecture/blockchain_ecosystem_diagram.png"
          alt="Blockchain ecosystem diagram showing token flow"
          className="mx-auto max-w-3xl w-full rounded-xl shadow"
        />
      </section>
    </main>
  );
}
