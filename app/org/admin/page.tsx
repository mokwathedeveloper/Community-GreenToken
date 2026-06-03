"use client";

// Rebuilt to exactly match mockup/org_admin_dashboard_mockup.png

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

const STATS = [
  { label: "Members",   value: "242",    sub: "of 500 used",          color: "text-primary-600" },
  { label: "Total GTK", value: "12,580", sub: "Total Tokens",         color: "text-amber-500"   },
  { label: "Actions",   value: "186",    sub: "This month",           color: "text-blue-600"    },
  { label: "Rate",      value: "96.5%",  sub: "Approval Rate",        color: "text-primary-600" },
];

const PENDING = [
  { id: "1", user: "Alice M.",  type: "Recycling",      date: "Jun 3, 2025",  tokens: 10 },
  { id: "2", user: "Bob K.",    type: "Tree Planting",  date: "Jun 3, 2025",  tokens: 20 },
  { id: "3", user: "Carol N.",  type: "Recycling Campaign", date: "May 24",   tokens: 15 },
];

const ACTIVITY = [
  { icon: "🌱", text: "Alice M. submitted Recycling action",     time: "2 min ago"  },
  { icon: "🌳", text: "Bob K. earned 20 GTK for Tree Planting",  time: "15 min ago" },
  { icon: "👥", text: "New member invited: Carol Nkosi",         time: "1 hr ago"   },
  { icon: "🎁", text: "Recycling Kit redeemed by David S.",      time: "2 hr ago"   },
];

const MEMBERS = [
  { name: "Alice Johnson",  email: "alice@example.com",  role: "Admin",  last: "10 min ago", joined: "Mar 05, 2025" },
  { name: "Rahul Sharma",   email: "rahul@example.com",  role: "Member", last: "2 hr ago",   joined: "Apr 12, 2025" },
  { name: "Emily Chen",     email: "emily@example.com",  role: "Member", last: "5 hr ago",   joined: "Feb 28, 2025" },
  { name: "Mike Brown",     email: "mike@example.com",   role: "Member", last: "1 day ago",  joined: "May 01, 2025" },
  { name: "Emma Wilson",    email: "emma@example.com",   role: "Member", last: "3 days ago", joined: "Jan 15, 2025" },
];

export default function OrgAdminPage() {
  const [queue, setQueue] = useState(PENDING);
  function approve(id: string) { setQueue((q) => q.filter((a) => a.id !== id)); }
  function reject(id: string)  { setQueue((q) => q.filter((a) => a.id !== id)); }

  return (
    <OrgAdminLayout orgName="GreenFuture Org" plan="Pro Plan">
      {/* Hero image */}
      <div className="relative h-36 rounded-2xl overflow-hidden mb-5">
        <Image src="/assets/image/pages/org-admin/org_admin_hero.png"
          alt="GreenFuture Org hero" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center px-6 justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Welcome back, GreenFuture Org 🌿</h1>
            <p className="text-white/80 text-sm mt-1">Manage your community, verify actions, and grow your impact.</p>
          </div>
          <Link href="/org/admin/billing"><Button variant="primary" size="sm">Upgrade to Pro</Button></Link>
        </div>
      </div>

      {/* Trial banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-800">Your Pro trial ends in <strong>16 days</strong> on May 15, 2025</p>
          <p className="text-xs text-amber-600 mt-0.5">Upgrade now to keep all Pro features after trial ends</p>
        </div>
        <Link href="/org/admin/billing"><Button variant="primary" size="xs">Upgrade Now</Button></Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {STATS.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Plan usage */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-gray-700"><span className="font-bold">242</span> of 500 members used</p>
          <Link href="/org/admin/billing"><Button variant="outline" size="xs">Upgrade Plan</Button></Link>
        </div>
        <ProgressBar value={242} max={500} size="md" />
      </div>

      {/* Verification queue + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between px-5 py-3.5 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Action Verification Queue ({queue.length} Pending)</h3>
            <Link href="#" className="text-xs text-primary-600 font-medium">View All →</Link>
          </div>
          {queue.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">All caught up! 🎉</p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Action verification queue</caption>
              <thead className="bg-gray-50">
                <tr>
                  {["Action","By","Date","Tokens",""].map((h)=>(
                    <th key={h} scope="col" className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queue.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.type}</td>
                    <td className="px-4 py-3 text-gray-600">{a.user}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{a.date}</td>
                    <td className="px-4 py-3 text-primary-600 font-semibold">{a.tokens} GTK</td>
                    <td className="px-4 py-3 flex gap-1.5">
                      <button onClick={() => approve(a.id)} aria-label={`Approve ${a.type}`}
                        className="px-2.5 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">✓</button>
                      <button onClick={() => reject(a.id)} aria-label={`Reject ${a.type}`}
                        className="px-2.5 py-1 text-xs bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">✗</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <a href="#" className="text-xs text-primary-600">View All</a>
            </div>
            <div className="space-y-3">
              {ACTIVITY.map(({ icon, text, time }, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-sm flex-shrink-0" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
                    <p className="text-xs text-gray-400">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🌿", label: "Record Actions",  href: "/feature"           },
                { icon: "📤", label: "Export Reports",  href: "#"                  },
                { icon: "👥", label: "Member Invite",   href: "/org/admin/members" },
              ].map(({ icon, label, href }) => (
                <Link key={label} href={href}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-50 hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-colors text-center focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between px-5 py-3.5 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Members</h3>
          <Link href="/org/admin/members"><Button variant="primary" size="xs" icon={<span>+</span>}>Invite Members</Button></Link>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">Organization members</caption>
          <thead className="bg-gray-50">
            <tr>
              {["Name","Role","Last Online","Joined","Actions"].map((h)=>(
                <th key={h} scope="col" className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MEMBERS.map((m) => (
              <tr key={m.email} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </td>
                <td className="px-5 py-3"><Badge color={m.role === "Admin" ? "blue" : "gray"}>{m.role}</Badge></td>
                <td className="px-5 py-3 text-xs text-gray-400">{m.last}</td>
                <td className="px-5 py-3 text-xs text-gray-400">{m.joined}</td>
                <td className="px-5 py-3"><Link href="/org/admin/members" className="text-xs text-primary-600 hover:underline">Manage</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-50">
          <Link href="/org/admin/members" className="text-xs text-primary-600 font-medium">View All Members →</Link>
        </div>
      </div>
    </OrgAdminLayout>
  );
}
