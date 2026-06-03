"use client";

// Rules: R-FE-01, R-A11Y-01, R-A11Y-08, R-COMP-01
// Spec: ux_ui/feature_specv2/org_admin_dashboard_md.md
// Mockup: assets/image/saas/org_admin_dashboard.png

import { useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layouts/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

const MOCK_STATS = [
  { icon: "👥", label: "Members",        value: "242",    note: "/ 500 limit" },
  { icon: "🪙", label: "Total Tokens",   value: "12,580", note: "" },
  { icon: "✅", label: "Actions",        value: "186",    note: "this month"  },
  { icon: "📊", label: "Verify Rate",    value: "96.5%",  note: "" },
];

const PENDING_ACTIONS = [
  { id: "1", user: "Alice M.",    type: "Recycling",     date: "Jun 3", tokens: 10 },
  { id: "2", user: "Bob K.",      type: "Tree Planting", date: "Jun 3", tokens: 20 },
  { id: "3", user: "Carol N.",    type: "Carpooling",    date: "Jun 2", tokens: 15 },
];

const RECENT_ACTIVITY = [
  { icon: "✅", text: "Alice M. submitted Recycling action",     time: "2 min ago" },
  { icon: "🪙", text: "Bob K. earned 20 GTK for Tree Planting", time: "15 min ago"},
  { icon: "👥", text: "New member joined: Carol N.",             time: "1 hr ago"  },
  { icon: "🎁", text: "Recycling Kit redeemed by David S.",      time: "2 hr ago"  },
];

const MEMBERS = [
  { name: "Alice Mokoena",  email: "alice@example.com",  role: "admin"  as const, joined: "Jan 15" },
  { name: "Bob Khumalo",    email: "bob@example.com",    role: "member" as const, joined: "Feb 3"  },
  { name: "Carol Nkosi",    email: "carol@example.com",  role: "member" as const, joined: "Mar 12" },
  { name: "David Sithole",  email: "david@example.com",  role: "member" as const, joined: "Apr 20" },
];

const TABS = ["overview", "members", "actions", "rewards", "analytics", "billing", "settings"] as const;
type Tab = typeof TABS[number];

export default function OrgAdminPage() {
  const [tab,    setTab]    = useState<Tab>("overview");
  const [queue,  setQueue]  = useState(PENDING_ACTIONS);

  function approve(id: string) { setQueue((q) => q.filter((a) => a.id !== id)); }
  function reject(id: string)  { setQueue((q) => q.filter((a) => a.id !== id)); }

  return (
    <AppLayout title="Org Admin">
      {/* Trial banner placeholder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
        <p className="text-sm text-amber-700 font-medium">
          🎁 Your Pro trial ends in <strong>8 days</strong>
        </p>
        <Link href="/org/admin/billing">
          <Button variant="primary" size="xs">Upgrade Now</Button>
        </Link>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, GreenFuture Org 🌿</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your community, verify actions, and grow your impact.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {MOCK_STATS.map(({ icon, label, value, note }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xl mb-1" aria-hidden="true">{icon}</div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label} <span className="text-gray-400">{note}</span></p>
          </div>
        ))}
      </div>

      {/* Plan usage bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <ProgressBar value={242} max={500} size="md" showLabel label="Member Capacity" />
        <p className="text-xs text-amber-500 mt-2">⚠ Approaching plan limit — <Link href="/org/admin/billing" className="underline font-medium">upgrade to Pro</Link></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap",
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Action verification queue */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Action Verification Queue ({queue.length})</h3>
              <Link href="#" className="text-xs text-primary-600 hover:underline">View All Pending</Link>
            </div>
            {queue.length === 0
              ? <p className="text-center text-gray-400 py-8 text-sm">No pending actions 🎉</p>
              : queue.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.type} — {a.user}</p>
                    <p className="text-xs text-gray-400">{a.date} · {a.tokens} tokens if approved</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="xs" variant="primary" onClick={() => approve(a.id)} aria-label={`Approve ${a.type} by ${a.user}`}>✅ Approve</Button>
                    <Button size="xs" variant="danger"  onClick={() => reject(a.id)}  aria-label={`Reject ${a.type} by ${a.user}`}>✗ Reject</Button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map(({ icon, text, time }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-sm flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members tab */}
      {tab === "members" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Members ({MEMBERS.length})</h3>
            <Link href="/org/admin/members">
              <Button size="sm" variant="primary" icon={<span>+</span>}>Invite Members</Button>
            </Link>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Organization member list</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MEMBERS.map((m) => (
                <tr key={m.email} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={m.role === "admin" ? "blue" : "gray"}>{m.role}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{m.joined}</td>
                  <td className="px-5 py-3.5">
                    <Link href="/org/admin/members" className="text-xs text-primary-600 hover:underline">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Other tabs — link to dedicated pages */}
      {tab !== "overview" && tab !== "members" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Manage {tab} in the dedicated section.</p>
          <Link href={`/org/admin/${tab}`}>
            <Button variant="primary" size="md">Open {tab.charAt(0).toUpperCase() + tab.slice(1)} →</Button>
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
