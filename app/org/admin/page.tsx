"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

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
  const { orgName, orgId, isLoading: userLoading } = useUser();

  const [queue,   setQueue]   = useState<PendingAction[]>([]);
  const [stats,   setStats]   = useState<OrgStats | null>(null);
  const [usage,   setUsage]   = useState<{ used: number; limit: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!orgId) return;
    Promise.all([
      fetch("/api/actions/pending?limit=10").then((r) => r.json()),
      fetch("/api/analytics/overview").then((r) => r.json()),
      fetch(`/api/orgs/${orgId}/usage`).then((r) => r.json()),
    ]).then(([pendingRes, statsRes, usageRes]) => {
      setQueue(pendingRes.data ?? []);
      if (statsRes.data) setStats(statsRes.data);
      if (usageRes?.data) setUsage({ used: usageRes.data.members_used ?? 0, limit: usageRes.data.member_limit ?? null });
    }).catch(console.error).finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => { if (!userLoading) loadData(); }, [userLoading, loadData]);

  async function handleVerify(actionId: string, tokensToMint: number, approve: boolean) {
    setActing(actionId);
    try {
      if (approve) {
        const res = await fetch("/api/actions/verify", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ actionId, tokensToMint }),
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error?.message ?? "Verification failed");
          return;
        }
      }
      setQueue((q) => q.filter((a) => a.id !== actionId));
    } finally {
      setActing(null);
    }
  }

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
            <h1 className="text-xl font-bold text-white">Welcome back, {orgName ?? "Your Org"} 🌿</h1>
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between px-5 py-3.5 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Action Verification Queue ({loading ? "…" : `${queue.length} Pending`})
            </h3>
          </div>
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-6">Loading…</p>
          ) : queue.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">All caught up! 🎉</p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Action verification queue</caption>
              <thead className="bg-gray-50">
                <tr>
                  {["Action", "By", "Date", "Tokens", ""].map((h) => (
                    <th key={h} scope="col" className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queue.map((a) => {
                  const name = a.users?.display_name ?? a.users?.email ?? "Unknown";
                  const date = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "—";
                  const busy = acting === a.id;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.action_type}</td>
                      <td className="px-4 py-3 text-gray-600">{name}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{date}</td>
                      <td className="px-4 py-3 text-primary-600 font-semibold">{a.tokens_awarded} GTK</td>
                      <td className="px-4 py-3 flex gap-1.5">
                        <button disabled={busy} onClick={() => handleVerify(a.id, a.tokens_awarded, true)}
                          aria-label={`Approve ${a.action_type}`}
                          className="px-2.5 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
                          {busy ? "…" : "✓"}
                        </button>
                        <button disabled={busy} onClick={() => handleVerify(a.id, a.tokens_awarded, false)}
                          aria-label={`Reject ${a.action_type}`}
                          className="px-2.5 py-1 text-xs bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                          ✗
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🌿", label: "Submit Action",  href: "/submit-action"    },
              { icon: "📊", label: "Analytics",      href: "/analytics"         },
              { icon: "👥", label: "Invite Members", href: "/org/admin/members" },
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
    </OrgAdminLayout>
  );
}
