"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useUser } from "@/hooks/useUser";
import { MGift, MCoin, MDelete, MVisibility, MCheckCircle, MWarning } from "@/components/icons";
import { cn } from "@/lib/utils";

type Reward = {
  id:          string;
  title:       string;
  description: string | null;
  token_cost:  number;
  stock:       number | null;
  is_active:   boolean;
  created_at:  string;
};

type FormState = {
  title:       string;
  description: string;
  tokenCost:   string;
  totalSupply: string;
};

const EMPTY_FORM: FormState = { title: "", description: "", tokenCost: "", totalSupply: "" };

export default function AdminRewardsPage() {
  const router = useRouter();
  const { orgName, isOrgAdmin, isLoading: userLoading } = useUser();

  const [rewards,    setRewards]    = useState<Reward[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [acting,     setActing]     = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Reward | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [errMsg,     setErrMsg]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !isOrgAdmin) router.replace("/dashboard");
  }, [userLoading, isOrgAdmin, router]);

  const loadRewards = useCallback(async () => {
    if (!isOrgAdmin) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rewards?all=true");
      const json = await res.json();
      setRewards(json.data ?? []);
    } catch {
      setErrMsg("Failed to load rewards.");
    } finally {
      setLoading(false);
    }
  }, [isOrgAdmin]);

  useEffect(() => { if (!userLoading && isOrgAdmin) loadRewards(); }, [userLoading, isOrgAdmin, loadRewards]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setErrMsg(null);
    setShowCreate(true);
  }

  function openEdit(r: Reward) {
    setForm({
      title:       r.title,
      description: r.description ?? "",
      tokenCost:   String(r.token_cost),
      totalSupply: r.stock != null ? String(r.stock) : "",
    });
    setEditTarget(r);
    setErrMsg(null);
    setShowCreate(true);
  }

  async function handleSave() {
    setErrMsg(null);
    const cost = parseInt(form.tokenCost, 10);
    if (!form.title.trim() || form.title.length < 2) { setErrMsg("Title must be at least 2 characters."); return; }
    if (!Number.isInteger(cost) || cost < 1) { setErrMsg("Token cost must be a positive whole number."); return; }
    const supply = form.totalSupply ? parseInt(form.totalSupply, 10) : null;
    if (form.totalSupply && (!Number.isInteger(supply) || (supply ?? 0) < 1)) {
      setErrMsg("Stock must be a positive whole number (or leave blank for unlimited).");
      return;
    }

    setSaving(true);
    try {
      let res: Response;
      if (editTarget) {
        res = await fetch(`/api/rewards/${editTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:       form.title.trim(),
            description: form.description.trim() || undefined,
            token_cost:  cost,
          }),
        });
      } else {
        res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:       form.title.trim(),
            description: form.description.trim() || undefined,
            tokenCost:   cost,
            totalSupply: supply ?? undefined,
          }),
        });
      }
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error?.message ?? "Failed to save reward."); return; }
      setSuccessMsg(editTarget ? "Reward updated." : "Reward created and is now live for members.");
      setShowCreate(false);
      await loadRewards();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(r: Reward) {
    setActing(r.id);
    try {
      const res = await fetch(`/api/rewards/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !r.is_active }),
      });
      if (!res.ok) { setErrMsg("Failed to update reward status."); return; }
      setRewards(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !r.is_active } : x));
      setSuccessMsg(r.is_active ? "Reward hidden from members." : "Reward is now visible to members.");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(r: Reward) {
    if (!confirm(`Deactivate "${r.title}"? Members won't see it anymore (history is preserved).`)) return;
    setActing(r.id);
    try {
      await fetch(`/api/rewards/${r.id}`, { method: "DELETE" });
      setRewards(prev => prev.map(x => x.id === r.id ? { ...x, is_active: false } : x));
      setSuccessMsg("Reward deactivated.");
    } finally {
      setActing(null);
    }
  }

  const activeCount   = rewards.filter(r => r.is_active).length;
  const inactiveCount = rewards.length - activeCount;

  if (userLoading) return null;

  return (
    <OrgAdminLayout orgName={orgName ?? undefined} plan="Pro Plan">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reward Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create rewards members can redeem with their GreenTokens.</p>
        </div>
        <Button variant="primary" size="md" icon={<MGift className="w-4 h-4" />} onClick={openCreate}>
          Add Reward
        </Button>
      </div>

      {/* Feedback banners */}
      {errMsg && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errMsg}</span>
          <button onClick={() => setErrMsg(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          <MCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Rewards",    value: loading ? "…" : String(rewards.length),   color: "text-gray-700"    },
          { label: "Active (visible)", value: loading ? "…" : String(activeCount),       color: "text-green-600"   },
          { label: "Hidden",           value: loading ? "…" : String(inactiveCount),     color: "text-amber-600"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Rewards table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">All Rewards</h2>
          {rewards.length > 0 && (
            <span className="text-xs text-gray-400">{rewards.length} reward{rewards.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading rewards…</div>
        ) : rewards.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
                <MGift className="w-7 h-7 text-primary-400" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700">No rewards yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Create your first reward for members to redeem with GTK.</p>
            <Button variant="outline" size="sm" onClick={openCreate} icon={<MGift className="w-3.5 h-3.5" />}>
              Add First Reward
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Reward catalog</caption>
              <thead className="bg-gray-50">
                <tr>
                  {["Reward", "Cost", "Stock", "Status", "Created", "Actions"].map(h => (
                    <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rewards.map((r) => (
                  <tr key={r.id} className={cn("hover:bg-gray-50 transition-colors", !r.is_active && "opacity-60")}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MGift className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{r.title}</p>
                          {r.description && (
                            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{r.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 font-bold text-gray-900">
                        <MCoin className="w-3.5 h-3.5 text-amber-500" />
                        {r.token_cost.toLocaleString()} GTK
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {r.stock != null ? `${r.stock.toLocaleString()} left` : <span className="text-gray-400 italic">Unlimited</span>}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={r.is_active ? "green" : "gray"} dot>
                        {r.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          title="Edit reward"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggle(r)}
                          disabled={acting === r.id}
                          title={r.is_active ? "Hide from members" : "Show to members"}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <MVisibility className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          disabled={acting === r.id || !r.is_active}
                          title="Deactivate reward"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        >
                          <MDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setErrMsg(null); }}
        title={editTarget ? "Edit Reward" : "Create New Reward"}
        icon={<MGift className="w-6 h-6 text-primary-600" />}
        size="md"
      >
        <div className="space-y-4 mt-2">
          {errMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              {errMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-title">
              Reward Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rw-title"
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Eco Water Bottle"
              maxLength={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-desc">
              Description
            </label>
            <textarea
              id="rw-desc"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what the member receives…"
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-cost">
                GTK Cost <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MCoin className="absolute left-3 top-2.5 w-4 h-4 text-amber-500 pointer-events-none" />
                <input
                  id="rw-cost"
                  type="number"
                  min={1}
                  value={form.tokenCost}
                  onChange={e => setForm(f => ({ ...f, tokenCost: e.target.value }))}
                  placeholder="100"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-stock">
                Stock <span className="text-gray-400 font-normal">(blank = unlimited)</span>
              </label>
              <input
                id="rw-stock"
                type="number"
                min={1}
                value={form.totalSupply}
                onChange={e => setForm(f => ({ ...f, totalSupply: e.target.value }))}
                placeholder="Unlimited"
                disabled={!!editTarget}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="md" fullWidth onClick={() => { setShowCreate(false); setErrMsg(null); }}>
              Cancel
            </Button>
            <Button variant="primary" size="md" fullWidth loading={saving} onClick={handleSave}>
              {editTarget ? "Save Changes" : "Create Reward"}
            </Button>
          </div>
        </div>
      </Modal>
    </OrgAdminLayout>
  );
}
