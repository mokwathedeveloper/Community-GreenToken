"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { MLeaf, MBarChart, MPeople, MBolt } from "@/components/icons";

type PendingAction = {
  id:             string;
  action_type:    string;
  tokens_awarded: number;
  submitted_at:   string;
  users: { display_name: string | null; email: string | null } | null;
};

type OrgStats = {
  totalActions:    number;
  verifiedActions: number;
  pendingActions:  number;
  tokensMinted:    number;
  activeMembers:   number;
};

export default function OrgAdminPage() {
  const router = useRouter();
  const { orgName, orgId, isLoading: userLoading, isOrgAdmin } = useUser();

  useEffect(() => {
    if (!userLoading && !isOrgAdmin) router.replace("/dashboard");
  }, [userLoading, isOrgAdmin, router]);

  const [queue,   setQueue]   = useState<PendingAction[]>([]);
  const [stats,   setStats]   = useState<OrgStats | null>(null);
  const [usage,   setUsage]   = useState<{ used: number; limit: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    if (!orgId || !isOrgAdmin) return;
    Promise.all([
      fetch("/api/actions/pending?limit=5").then((r) => r.json()),
      fetch("/api/analytics/overview").then((r) => r.json()),
      fetch(`/api/orgs/${orgId}/usage`).then((r) => r.json()),
    ]).then(([pendingRes, statsRes, usageRes]) => {
      setQueue(pendingRes.data ?? []);
      if (statsRes.data) setStats(statsRes.data);
      if (usageRes?.data) setUsage({ used: usageRes.data.members_used ?? 0, limit: usageRes.data.member_limit ?? null });
    }).catch(console.error).finally(() => setLoading(false));
  }, [orgId, isOrgAdmin]);

  useEffect(() => { if (!userLoading && isOrgAdmin) loadData(); }, [userLoading, isOrgAdmin, loadData]);

  const displayStats = [
    { label: "Total Actions",  value: loading ? "—" : String(stats?.totalActions ?? 0),    sub: "Submitted",     color: "text-blue-600"    },
    { label: "Verified",       value: loading ? "—" : String(stats?.verifiedActions ?? 0), sub: "Actions",       color: "text-primary-600" },
    { label: "Tokens Minted",  value: loading ? "—" : (stats?.tokensMinted ?? 0).toLocaleString(), sub: "GTK total", color: "text-amber-500" },
    { label: "Active Members", value: loading ? "—" : String(stats?.activeMembers ?? 0),   sub: "With balance",  color: "text-primary-600" },
  ];

  return (
    <OrgAdminLayout orgName={orgName ?? "Your Org"} plan="Pro Plan">
      {/* Hero */}
      <div className="relative h-36 rounded-2xl overflow-hidden mb-5">
        <Image src="/assets/image/pages/org-admin/org_admin_hero.png"
          alt="Org admin hero" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center px-6 justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Welcome back, {orgName ?? "Your Org"}</h1>
            <p className="text-white/80 text-sm mt-1">Manage your community, verify actions, and grow your impact.</p>
          </div>
          <Link href="/org/admin/billing"><Button variant="primary" size="sm">Upgrade Plan</Button></Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {displayStats.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Plan usage */}
      {usage && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              <span className="font-bold">{usage.used}</span> of {usage.limit ?? "∞"} members used
            </p>
            <Link href="/org/admin/billing"><Button variant="outline" size="xs">Upgrade Plan</Button></Link>
          </div>
          {usage.limit && <ProgressBar value={usage.used} max={usage.limit} size="md" />}
        </div>
      )}

      {/* Verification queue + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Pending actions preview — review happens on /org/admin/actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Pending Review</h3>
              {!loading && queue.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {queue.length}
                </span>
              )}
            </div>
            <Link
              href="/org/admin/actions"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:underline"
            >
              Review All →
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-4 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-2">
                <MBolt className="w-5 h-5 text-primary-400" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-700">All caught up!</p>
              <p className="text-xs text-gray-400 mt-0.5">No actions awaiting review.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <caption className="sr-only">Pending action submissions — click Review to approve or reject</caption>
                <thead className="bg-gray-50">
                  <tr>
                    {["Action type", "Submitted by", "Date", ""].map((h) => (
                      <th key={h} scope="col" className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {queue.map((a) => {
                    const name = a.users?.display_name ?? a.users?.email?.split("@")[0] ?? "Unknown";
                    const date = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—";
                    return (
                      <tr key={a.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                            {a.action_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-[10px] font-bold flex-shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-700 truncate max-w-[100px]">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{date}</td>
                        <td className="px-4 py-3">
                          <Link
                            href="/org/admin/actions"
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold",
                              "bg-primary-500 hover:bg-primary-600 text-white transition-colors",
                              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                            )}
                          >
                            Review →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 bg-amber-50/30">
                <Link
                  href="/org/admin/actions"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold text-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:underline"
                >
                  <MBolt className="w-3.5 h-3.5" aria-hidden="true" />
                  Open full verification queue — approve &amp; set token rewards
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <MBolt   className="w-5 h-5 text-amber-500"    />, label: "Verify Actions", href: "/org/admin/actions"  },
              { icon: <MPeople className="w-5 h-5 text-indigo-600"   />, label: "Invite Members", href: "/org/admin/members"  },
              { icon: <MBarChart className="w-5 h-5 text-blue-600"   />, label: "Analytics",      href: "/analytics"          },
              { icon: <MLeaf   className="w-5 h-5 text-primary-600"  />, label: "Submit Action",  href: "/submit-action"      },
            ].map(({ icon, label, href }) => (
              <Link key={label} href={href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-colors text-center focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                <span aria-hidden="true">{icon}</span>
                <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </OrgAdminLayout>
  );
}
