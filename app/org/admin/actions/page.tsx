"use client";

// Admin-only: full action verification queue
// RBAC: org admin + owner can verify actions; members cannot self-approve (SoD)
// Stellar flow: approve → POST /api/actions/verify → increment_token_balance RPC
//               → after() fires ActionRegistry.verify_action() → GreenToken.mint() on Stellar

import { useState, useEffect, useCallback } from "react";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

type ActionStatus = "pending" | "verified" | "rejected";

type QueueItem = {
  id:             string;
  action_type:    string;
  description:    string;
  evidence_hash:  string | null;
  stellar_tx_hash:string | null;
  tokens_awarded: number;
  submitted_at:   string;
  status:         ActionStatus;
  users: { display_name: string | null; email: string | null } | null;
};

const STATUS_TABS: { key: ActionStatus | "all"; label: string }[] = [
  { key: "pending",  label: "Pending"  },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
  { key: "all",      label: "All"      },
];

export default function AdminActionsPage() {
  const { orgName, isLoading: userLoading } = useUser();

  const [tab,      setTab]      = useState<ActionStatus | "all">("pending");
  const [items,    setItems]    = useState<QueueItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<string | null>(null);
  const [tokenMap, setTokenMap] = useState<Record<string, number>>({});
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 20;

  const loadActions = useCallback(() => {
    if (userLoading) return;
    setLoading(true);
    const statusParam = tab === "all" ? "" : `&status=${tab}`;
    fetch(`/api/actions?limit=${LIMIT}&page=${page}${statusParam}`)
      .then(r => r.json())
      .then(res => {
        setItems(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userLoading, tab, page]);

  useEffect(() => { loadActions(); }, [loadActions]);

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
      // Optimistically update row status
      setItems(prev => prev.map(a =>
        a.id === actionId
          ? { ...a, status: approve ? "verified" : "rejected" }
          : a
      ));
    } finally {
      setActing(null);
    }
  }

  const pendingCount = items.filter(a => a.status === "pending").length;

  return (
    <OrgAdminLayout orgName={orgName ?? "Your Org"} plan="Pro Plan">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            ⚡ Action Verification
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and verify member eco-action submissions. Approved actions mint GTK tokens on Stellar.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-700">
            🔔 {pendingCount} action{pendingCount > 1 ? "s" : ""} awaiting review
          </span>
        )}
      </div>

      {/* ── Stellar blockchain info banner ── */}
      <div className="bg-primary-600 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-white" aria-hidden="true">⛓️</div>
        <div>
          <p className="text-sm font-bold text-white">Powered by Stellar Blockchain</p>
          <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
            When you approve an action, the system calls <code className="bg-white/20 px-1 rounded">ActionRegistry.verify_action()</code> on Stellar,
            which triggers a cross-contract call to <code className="bg-white/20 px-1 rounded">GreenToken.mint()</code>.
            GTK tokens are minted directly to the member&apos;s Stellar wallet. The transaction hash is stored as immutable proof.
          </p>
        </div>
      </div>

      {/* ── Status tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold transition-colors",
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            {label}
            {key === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Queue table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg"/>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{tab === "pending" ? "🎉" : "📋"}</p>
            <p className="text-sm font-semibold text-gray-700">
              {tab === "pending" ? "All caught up! No pending actions." : `No ${tab} actions found.`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tab === "pending" ? "Members&apos; submissions will appear here for review." : ""}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <caption className="sr-only">Action verification queue</caption>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Member","Action Type","Description","Submitted","Tokens","Status",""].map(h=>(
                    <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(a => {
                  const name  = a.users?.display_name ?? a.users?.email?.split("@")[0] ?? "Unknown";
                  const date  = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en",{month:"short",day:"numeric"}) : "—";
                  const busy  = acting === a.id;
                  const isPending = a.status === "pending";

                  return (
                    <tr key={a.id} className={cn("hover:bg-gray-50 transition-colors", isPending && "bg-amber-50/30")}>

                      {/* Member */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{name}</span>
                        </div>
                      </td>

                      {/* Action type */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                          {a.action_type}
                        </span>
                      </td>

                      {/* Description + evidence hash */}
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <p className="text-xs text-gray-700 truncate">{a.description || "—"}</p>
                        {a.evidence_hash && (
                          <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5" title={a.evidence_hash}>
                            SHA-256: {a.evidence_hash.slice(0,10)}…
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{date}</td>

                      {/* Token reward input (only editable when pending) */}
                      <td className="px-4 py-3.5">
                        {isPending ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1} max={1000}
                              value={tokenMap[a.id] ?? a.tokens_awarded}
                              onChange={e => setTokenMap(m => ({ ...m, [a.id]: Number(e.target.value) }))}
                              aria-label={`Token reward for ${a.action_type}`}
                              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                            <span className="text-xs text-gray-400">GTK</span>
                          </div>
                        ) : (
                          <span className={cn("text-xs font-semibold", a.status === "verified" ? "text-primary-600" : "text-gray-400")}>
                            {a.tokens_awarded > 0 ? `${a.tokens_awarded} GTK` : "—"}
                          </span>
                        )}
                      </td>

                      {/* Status + Stellar tx */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <Badge
                            color={a.status === "verified" ? "green" : a.status === "rejected" ? "red" : "amber"}
                            dot>
                            {a.status}
                          </Badge>
                          {a.stellar_tx_hash && (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${a.stellar_tx_hash}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-primary-600 hover:underline font-mono"
                              title="View on Stellar Explorer">
                              ⛓️ {a.stellar_tx_hash.slice(0,8)}…
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        {isPending ? (
                          <div className="flex gap-1.5">
                            <button
                              disabled={busy}
                              onClick={() => handleVerify(a.id, tokenMap[a.id] ?? a.tokens_awarded, true)}
                              aria-label={`Approve ${a.action_type} by ${name}`}
                              className="px-3 py-1.5 text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50 transition-colors">
                              {busy ? "…" : "✓ Approve"}
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => handleVerify(a.id, 0, false)}
                              aria-label={`Reject ${a.action_type} by ${name}`}
                              className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg disabled:opacity-50 transition-colors">
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <p className="text-xs text-gray-500">Showing {Math.min((page-1)*LIMIT+1, total)}–{Math.min(page*LIMIT, total)} of {total}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="xs" disabled={page<=1} onClick={() => setPage(p=>p-1)}>← Prev</Button>
                  <Button variant="outline" size="xs" disabled={page*LIMIT>=total} onClick={() => setPage(p=>p+1)}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Stellar flow explanation ── */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⛓️ How the Stellar Blockchain Verification Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step:"1", icon:"📤", title:"Member Submits",     desc:"Member fills action form, uploads evidence photo. SHA-256 hash is computed and sent to ActionRegistry.submit_action() on Stellar testnet." },
            { step:"2", icon:"🔍", title:"Admin Reviews",      desc:"You see the submission in this queue with the evidence hash and description. You can edit the GTK token reward before approving." },
            { step:"3", icon:"⛓️", title:"Blockchain Proof",  desc:"On approval, ActionRegistry.verify_action() is called. Cross-contract call triggers GreenToken.mint() — tokens minted to member's Stellar wallet." },
            { step:"4", icon:"🪙", title:"Member Receives",    desc:"Member's GTK balance updates in DB (atomic RPC) and on-chain. Stellar tx_hash is stored as immutable proof visible to member." },
          ].map(({step,icon,title,desc}) => (
            <div key={step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0 mt-0.5">{step}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{icon} {title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </OrgAdminLayout>
  );
}
