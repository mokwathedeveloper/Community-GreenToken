"use client";

// Rebuilt to match mockup/super_admin_dashboard_mockup.png
// Super Admin: platform-wide overview with revenue chart, plan distribution, top orgs, billing events

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type OrgStatus = "active" | "past_due" | "trialing" | "canceled";
interface Org { id: string; name: string; plan: string; members: number; mrr: number; status: OrgStatus; }

const MOCK_ORGS: Org[] = [
  { id: "1", name: "Cape Town Council", plan: "Professional", members: 4823, mrr: 199, status: "active"   },
  { id: "2", name: "Wits University",   plan: "Professional", members: 812,  mrr: 199, status: "active"   },
  { id: "3", name: "Pick n Pay",        plan: "Standard",     members: 234,  mrr: 49,  status: "past_due" },
  { id: "4", name: "Demo School",       plan: "Free",         members: 47,   mrr: 0,   status: "trialing" },
  { id: "5", name: "EcoStart ZA",       plan: "Standard",     members: 178,  mrr: 49,  status: "active"   },
];

const PLATFORM_STATS = [
  { label: "Monthly Recurring Revenue", value: "$48,650", sub: "+16.7% vs. last month", icon: "💰", color: "text-primary-400" },
  { label: "Total Organizations",       value: "128",     sub: "+12 this month",         icon: "🏢", color: "text-primary-400" },
  { label: "Total Members",             value: "2,845",   sub: "+8.7% vs. last month",   icon: "👥", color: "text-blue-400"    },
  { label: "Platform Uptime",           value: "99.98%",  sub: "+0.3% vs. last month",   icon: "🟢", color: "text-green-400"  },
];

const REVENUE_DATA = [12, 18, 22, 19, 28, 35, 31, 42, 38, 46, 44, 48];
const MONTHS = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];

const PLAN_DIST = [
  { label: "Professional", count: 52, color: "#22c55e"  },
  { label: "Standard",     count: 42, color: "#60a5fa"  },
  { label: "Basic",        count: 19, color: "#fbbf24"  },
  { label: "Free",         count: 15, color: "#d1d5db"  },
];

const BILLING_EVENTS = [
  { org: "Cape Town Council",  event: "Pro Plan — Monthly",        date: "Jul 1, 2025",  amount: "$199.00", status: "paid"   },
  { org: "Wits University",    event: "Ascended to Enterprise",    date: "Jun 28, 2025", amount: "$599.00", status: "paid"   },
  { org: "Pick n Pay",         event: "Standard Plan — Monthly",   date: "Jun 25, 2025", amount: "$49.00",  status: "failed" },
  { org: "EcoStart ZA",        event: "Standard Plan — Monthly",   date: "Jun 20, 2025", amount: "$49.00",  status: "paid"   },
];

const STATUS_COLORS: Record<OrgStatus, string> = {
  active:   "green",
  trialing: "amber",
  past_due: "red",
  canceled: "gray",
} as const;

// Build SVG line chart
function RevenueChart() {
  const W = 400, H = 120, PAD = 20;
  const max = Math.max(...REVENUE_DATA);
  const pts = REVENUE_DATA.map((v, i) => {
    const x = PAD + (i / (REVENUE_DATA.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return [x, y] as [number, number];
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${H - PAD} L${PAD},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }} role="img" aria-label="Revenue trend chart">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = (H - PAD) - t * (H - PAD * 2);
        return <line key={t} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#374151" strokeWidth="0.5" />;
      })}
      <path d={areaPath} fill="url(#revGrad)" />
      <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill="#22c55e" />
          {i % 3 === 0 && (
            <text x={x} y={H - 4} textAnchor="middle" fontSize="8" fill="#6b7280">{MONTHS[i]}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// SVG donut chart
function PlanDonut() {
  const total = PLAN_DIST.reduce((s, d) => s + d.count, 0);
  let cursor = -90;
  const r = 44, cx = 56, cy = 56;
  const slices = PLAN_DIST.map((d) => {
    const sweepAngle = (d.count / total) * 360;
    const a1 = (cursor * Math.PI) / 180;
    const a2 = ((cursor + sweepAngle) * Math.PI) / 180;
    const large = sweepAngle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    cursor += sweepAngle;
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 112 112" className="w-28 h-28 flex-shrink-0" role="img" aria-label="Plan distribution donut chart">
        {slices.map((s) => <path key={s.label} d={s.path} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#1f2937" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fill="white" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">Total Orgs</text>
      </svg>
      <div className="space-y-1.5">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-300">{s.label}</span>
            <span className="text-xs font-medium text-white ml-auto">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NAV_ITEMS = ["Overview", "Organizations", "Billing", "Contracts", "Users", "Audit Logs", "Reports", "Settings"];

export default function SuperAdminPage() {
  const [orgs, setOrgs] = useState(MOCK_ORGS);
  const [sortBy, setSortBy] = useState<"mrr" | "members">("mrr");
  const [activeNav, setActiveNav] = useState("Overview");

  const sorted = [...orgs].sort((a, b) => b[sortBy] - a[sortBy]);

  function suspend(id: string) {
    if (!confirm("Suspend this organization?")) return;
    setOrgs((o) => o.map((org) => org.id === id ? { ...org, status: "canceled" as OrgStatus } : org));
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Dark sidebar */}
      <aside className="w-52 bg-gray-950 flex flex-col py-5 px-3 flex-shrink-0 overflow-y-auto" aria-label="Super Admin Navigation">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-sm">🌿</div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Community</p>
            <p className="text-xs font-bold text-primary-400 leading-tight">GreenToken</p>
          </div>
        </div>

        <nav className="space-y-0.5 flex-1">
          {NAV_ITEMS.map((t) => (
            <button key={t} onClick={() => setActiveNav(t)}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                activeNav === t ? "bg-primary-600/20 text-primary-400 font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}>
              {t}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto px-2 pt-4 border-t border-gray-800">
          <div className="bg-primary-600/10 rounded-xl p-3">
            <p className="text-xs font-bold text-primary-400">Building a Greener Digital Future</p>
            <p className="text-xs text-gray-500 mt-1">Super Admin controls platform-wide settings and billing.</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-12 px-6 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <input placeholder="Search organizations, users, contracts..." aria-label="Search"
              className="text-xs bg-gray-800 text-gray-300 placeholder-gray-500 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary-400 font-semibold">Super Admin</span>
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">SA</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" id="main-content">
          <h1 className="text-xl font-bold text-white mb-1">Platform Overview</h1>
          <p className="text-xs text-gray-400 mb-6">Monitor platform-wide revenue, organization activity, and billing.</p>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {PLATFORM_STATS.map(({ label, value, sub, icon, color }) => (
              <div key={label} className="bg-gray-800 rounded-xl p-4">
                <div className="text-xl mb-2" aria-hidden="true">{icon}</div>
                <div className={cn("text-2xl font-bold", color)}>{value}</div>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
                <p className="text-xs text-gray-600 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            {/* Revenue chart */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white">Revenue (MRR)</h3>
                <span className="text-xs text-gray-400">Last 30 days ▾</span>
              </div>
              <RevenueChart />
            </div>

            {/* Plan distribution */}
            <div className="bg-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white">Plan Distribution</h3>
                <a href="#" className="text-xs text-primary-400">View details →</a>
              </div>
              <PlanDonut />
            </div>
          </div>

          {/* Top organizations + Recent billing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-white">Top Organizations</h2>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "mrr" | "members")}
                  aria-label="Sort by"
                  className="bg-gray-700 text-white text-xs rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="mrr">Sort by MRR</option>
                  <option value="members">Sort by Members</option>
                </select>
              </div>
              <table className="w-full text-xs">
                <caption className="sr-only">Top organizations by {sortBy}</caption>
                <thead className="text-gray-400 bg-gray-750">
                  <tr>
                    {["Name", "Plan", "Members", "MRR", "Status", ""].map((h) => (
                      <th key={h} scope="col" className="text-left px-4 py-2.5 uppercase text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((org) => (
                    <tr key={org.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{org.name}</td>
                      <td className="px-4 py-3 text-gray-400">{org.plan}</td>
                      <td className="px-4 py-3 text-gray-400">{org.members.toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">${org.mrr}</td>
                      <td className="px-4 py-3">
                        <Badge color={(STATUS_COLORS[org.status] ?? "gray") as any}>{org.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => suspend(org.id)}
                          className="text-red-400 text-xs hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                          aria-label={`Suspend ${org.name}`}>Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-center text-gray-500 py-2 border-t border-gray-700">
                Showing {sorted.length} of 128 total organizations
              </p>
            </div>

            {/* Recent billing events */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-white">Recent Billing Events</h2>
                <a href="#" className="text-xs text-primary-400">View All →</a>
              </div>
              <table className="w-full text-xs">
                <caption className="sr-only">Recent billing events</caption>
                <thead className="text-gray-400">
                  <tr>
                    {["Organization", "Event", "Date", "Amount", "Status"].map((h) => (
                      <th key={h} scope="col" className="text-left px-4 py-2.5 uppercase text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BILLING_EVENTS.map((ev, i) => (
                    <tr key={i} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3 text-white font-medium truncate max-w-[100px]">{ev.org}</td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[120px]">{ev.event}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{ev.date}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">{ev.amount}</td>
                      <td className="px-4 py-3">
                        <Badge color={ev.status === "paid" ? "green" : "red"}>{ev.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
