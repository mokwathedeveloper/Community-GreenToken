"use client";

// Rules: R-FE-01, R-SAAS-04 (superadmin server-side check), R-A11Y-08
// Spec: ux_ui/feature_specv2/super_admin_dashboard_md.md
// Mockup: assets/image/saas/super_admin_dashboard.png
// Note: This page is additionally protected by proxy.ts (role === 'superadmin' check)

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type OrgStatus = "active" | "past_due" | "trialing" | "canceled";
interface Org { id: string; name: string; plan: string; members: number; mrr: number; status: OrgStatus; }
const MOCK_ORGS: Org[] = [
  { id: "1", name: "Cape Town Council", plan: "pro",     members: 4823, mrr: 199, status: "active"   as const },
  { id: "2", name: "Wits University",   plan: "pro",     members: 812,  mrr: 199, status: "active"   as const },
  { id: "3", name: "Pick n Pay",        plan: "starter", members: 234,  mrr: 49,  status: "past_due" as const },
  { id: "4", name: "Demo School",       plan: "free",    members: 47,   mrr: 0,   status: "trialing" as const },
];

const PLATFORM_STATS = [
  { label: "Active Orgs",     value: "47",     icon: "🏢" },
  { label: "MRR",             value: "$8,750",  icon: "💰" },
  { label: "Total Members",   value: "23,400",  icon: "👥" },
  { label: "Platform Uptime", value: "99.8%",   icon: "🟢" },
];

const STATUS_COLORS = {
  active:    "green",
  trialing:  "amber",
  past_due:  "red",
  canceled:  "gray",
} as const;

export default function SuperAdminPage() {
  const [orgs, setOrgs] = useState(MOCK_ORGS);
  const [sortBy, setSortBy] = useState<"mrr" | "members">("mrr");
  const sorted = [...orgs].sort((a, b) => b[sortBy] - a[sortBy]);

  function suspend(id: string) {
    if (!confirm("Suspend this organization?")) return;
    setOrgs((o: Org[]) => o.map((org) => org.id === id ? { ...org, status: "canceled" as OrgStatus } : org));
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Dark sidebar */}
      <aside className="w-56 bg-gray-950 flex flex-col py-6 px-4 space-y-1.5 flex-shrink-0" aria-label="Super Admin Navigation">
        <div className="text-primary-400 font-bold text-lg mb-6 px-2">🌿 GT Admin</div>
        {["Overview", "Organizations", "Billing", "Contracts", "Settings"].map((t) => (
          <a key={t} href="#"
            className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
            {t}
          </a>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto" id="main-content">
        <h1 className="text-2xl font-bold mb-8">Platform Overview</h1>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PLATFORM_STATS.map(({ label, value, icon }) => (
            <div key={label} className="bg-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Organizations table — R-A11Y-08 */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="font-semibold">All Organizations</h2>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "mrr" | "members")}
              aria-label="Sort by"
              className="bg-gray-700 text-white text-xs rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="mrr">Sort by MRR</option>
              <option value="members">Sort by Members</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">All platform organizations sorted by {sortBy}</caption>
            <thead className="text-gray-400 text-xs uppercase">
              <tr>
                {["Organization", "Plan", "Members", "MRR", "Status", "Actions"].map((h) => (
                  <th key={h} scope="col" className="text-left px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((org) => (
                <tr key={org.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 font-medium">{org.name}</td>
                  <td className="px-6 py-4 capitalize text-gray-300">{org.plan}</td>
                  <td className="px-6 py-4 text-gray-300">{org.members.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">${org.mrr}</td>
                  <td className="px-6 py-4">
                    <Badge color={STATUS_COLORS[org.status] ?? "gray"}>
                      {org.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <a href="#" className="text-blue-400 text-xs hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">View</a>
                    <button onClick={() => suspend(org.id)}
                      className="text-red-400 text-xs hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                      aria-label={`Suspend ${org.name}`}>Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
