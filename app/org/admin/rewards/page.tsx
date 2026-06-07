"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useUser } from "@/hooks/useUser";
import {
  MGift, MCoin, MDelete, MVisibility, MCheckCircle,
  MWarning, MPeople, MAccessTime,
} from "@/components/icons";
import { cn } from "@/lib/utils";

// ── Reward catalog — predefined titles admins can create ──────────────────────

const REWARD_CATALOG = [
  { title: "Eco Water Bottle",          description: "A reusable stainless steel water bottle to reduce plastic waste.",           tokenCost: 100 },
  { title: "Reusable Shopping Bag",     description: "Durable reusable bag to replace single-use plastic bags.",                   tokenCost: 50  },
  { title: "Tree Planting Certificate", description: "We plant a tree in your name through a local reforestation project.",        tokenCost: 150 },
  { title: "Compost Bin Starter Kit",   description: "Home composting bin and guide to turn food waste into organic fertilizer.",  tokenCost: 200 },
  { title: "Solar Phone Charger",       description: "Portable solar-powered charger to keep devices running without the grid.",   tokenCost: 300 },
  { title: "Organic Seeds Kit",         description: "Assorted organic vegetable and herb seeds to grow your own food at home.",   tokenCost: 80  },
  { title: "Community Garden Plot",     description: "One-month access to a shared community garden bed.",                         tokenCost: 250 },
  { title: "Public Transport Pass",     description: "Weekly public transport pass to reduce your carbon footprint.",              tokenCost: 180 },
  { title: "Bamboo Utensil Set",        description: "Reusable bamboo cutlery set to replace single-use plastic utensils.",        tokenCost: 75  },
  { title: "Eco-Cleaning Kit",          description: "Non-toxic, biodegradable household cleaning products bundle.",               tokenCost: 120 },
  { title: "Recycled Notebook",         description: "Notebook made from 100% recycled and sustainably sourced paper.",           tokenCost: 40  },
  { title: "Local Produce Voucher",     description: "Voucher redeemable at the local farmers market for fresh seasonal produce.", tokenCost: 200 },
  { title: "Zero-Waste Starter Pack",   description: "Beeswax wraps, bamboo toothbrush, reusable straws and produce bags.",       tokenCost: 160 },
  { title: "Green Energy Voucher",      description: "Bill credit towards renewable electricity for your household.",              tokenCost: 400 },
  { title: "Bicycle Repair Voucher",    description: "Free bike service and tune-up at a local partner repair workshop.",         tokenCost: 220 },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type Reward = {
  id:          string;
  title:       string;
  description: string | null;
  token_cost:  number;
  stock:       number | null;
  is_active:   boolean;
  created_at:  string;
};

type Redemption = {
  id:           string;
  user_id:      string;
  tokens_spent: number;
  status:       "pending" | "confirmed" | "failed";
  created_at:   string;
  rewards:      { title: string | null; token_cost: number | null } | null;
  users:        { display_name: string | null; email: string | null } | null;
};

type FormState = { title: string; description: string; tokenCost: string; totalSupply: string };
const EMPTY_FORM: FormState = { title: "", description: "", tokenCost: "", totalSupply: "" };

function catalogItem(title: string) {
  return REWARD_CATALOG.find(r => r.title === title) ?? null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminRewardsPage() {
  const router = useRouter();
  const { orgName, isOrgAdmin, isLoading: userLoading } = useUser();

  const [tab,        setTab]        = useState<"catalog" | "queue">("catalog");
  const [rewards,    setRewards]    = useState<Reward[]>([]);
  const [redemptions,setRedemptions]= useState<Redemption[]>([]);
  const [rdTotal,    setRdTotal]    = useState(0);
  const [rdPending,  setRdPending]  = useState(0);
  const [loadCat,    setLoadCat]    = useState(true);
  const [loadQueue,  setLoadQueue]  = useState(true);
  const [acting,     setActing]     = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Reward | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [errMsg,     setErrMsg]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"" | "pending" | "confirmed">("");

  useEffect(() => {
    if (!userLoading && !isOrgAdmin) router.replace("/dashboard");
  }, [userLoading, isOrgAdmin, router]);

  // ── Load catalog ────────────────────────────────────────────────────────────
  const loadRewards = useCallback(async () => {
    if (!isOrgAdmin) return;
    setLoadCat(true);
    try {
      const res  = await fetch("/api/rewards?all=true");
      const json = await res.json();
      setRewards(json.data ?? []);
    } catch { setErrMsg("Failed to load rewards."); }
    finally  { setLoadCat(false); }
  }, [isOrgAdmin]);

  // ── Load fulfillment queue ───────────────────────────────────────────────────
  const loadRedemptions = useCallback(async () => {
    if (!isOrgAdmin) return;
    setLoadQueue(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : "";
      const res  = await fetch(`/api/admin/redemptions?limit=50${statusParam}`);
      const json = await res.json();
      const rows: Redemption[] = json.data ?? [];
      setRedemptions(rows);
      setRdTotal(json.pagination?.total ?? rows.length);
      // Count pending from full list (fetch without filter for badge)
      if (!filterStatus) setRdPending(rows.filter(r => r.status === "pending").length);
    } catch { setErrMsg("Failed to load fulfillment queue."); }
    finally  { setLoadQueue(false); }
  }, [isOrgAdmin, filterStatus]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!userLoading && isOrgAdmin) { loadRewards(); loadRedemptions(); } },
    [userLoading, isOrgAdmin, loadRewards, loadRedemptions]);

  // ── Catalog actions ─────────────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY_FORM); setEditTarget(null); setErrMsg(null); setShowCreate(true);
  }
  function openEdit(r: Reward) {
    setForm({ title: r.title, description: r.description ?? "", tokenCost: String(r.token_cost), totalSupply: r.stock != null ? String(r.stock) : "" });
    setEditTarget(r); setErrMsg(null); setShowCreate(true);
  }

  async function handleSave() {
    setErrMsg(null);
    const cost = parseInt(form.tokenCost, 10);
    if (!form.title) { setErrMsg("Please select a reward type from the dropdown."); return; }
    if (!Number.isInteger(cost) || cost < 1)          { setErrMsg("Token cost must be a positive whole number."); return; }
    const supply = form.totalSupply ? parseInt(form.totalSupply, 10) : null;
    if (form.totalSupply && (!Number.isInteger(supply) || (supply ?? 0) < 1)) {
      setErrMsg("Stock must be a positive whole number, or leave blank for unlimited."); return;
    }
    setSaving(true);
    try {
      let res: Response;
      if (editTarget) {
        res = await fetch(`/api/rewards/${editTarget.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() || undefined, token_cost: cost }),
        });
      } else {
        res = await fetch("/api/rewards", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() || undefined, tokenCost: cost, totalSupply: supply ?? undefined }),
        });
      }
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error?.message ?? "Failed to save."); return; }
      setSuccessMsg(editTarget ? "Reward updated." : "Reward created — members can now redeem it.");
      setShowCreate(false);
      await loadRewards();
    } finally { setSaving(false); }
  }

  async function handleToggle(r: Reward) {
    setActing(r.id);
    try {
      const res = await fetch(`/api/rewards/${r.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !r.is_active }),
      });
      if (!res.ok) { setErrMsg("Failed to update status."); return; }
      setRewards(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !r.is_active } : x));
      setSuccessMsg(r.is_active ? "Reward hidden from members." : "Reward is now visible to members.");
    } finally { setActing(null); }
  }

  async function handleDelete(r: Reward) {
    if (!confirm(`Deactivate "${r.title}"? Members won't see it (history preserved).`)) return;
    setActing(r.id);
    try {
      await fetch(`/api/rewards/${r.id}`, { method: "DELETE" });
      setRewards(prev => prev.map(x => x.id === r.id ? { ...x, is_active: false } : x));
      setSuccessMsg("Reward deactivated.");
    } finally { setActing(null); }
  }

  // ── Fulfillment action ───────────────────────────────────────────────────────
  async function handleFulfill(rd: Redemption) {
    setActing(rd.id);
    setErrMsg(null);
    try {
      const res  = await fetch(`/api/admin/redemptions/${rd.id}`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error?.message ?? "Failed to mark as fulfilled."); return; }
      setRedemptions(prev => prev.map(x => x.id === rd.id ? { ...x, status: "confirmed" } : x));
      setRdPending(p => Math.max(0, p - 1));
      const member = rd.users?.display_name ?? rd.users?.email?.split("@")[0] ?? "Member";
      setSuccessMsg(`Marked "${rd.rewards?.title ?? "reward"}" for ${member} as fulfilled.`);
    } finally { setActing(null); }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const activeCount = rewards.filter(r => r.is_active).length;

  const memberName = (rd: Redemption) =>
    rd.users?.display_name ?? rd.users?.email?.split("@")[0] ?? "Unknown member";

  const memberEmail = (rd: Redemption) => rd.users?.email ?? null;

  if (userLoading) return null;

  return (
    <OrgAdminLayout orgName={orgName ?? undefined} plan="Pro Plan">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create rewards and fulfil member redemption requests.</p>
        </div>
        {tab === "catalog" && (
          <Button variant="primary" size="md" icon={<MGift className="w-4 h-4" />} onClick={openCreate}>
            Add Reward
          </Button>
        )}
      </div>

      {/* Feedback banners */}
      {errMsg && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{errMsg}</span>
          <button onClick={() => setErrMsg(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          <MCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Rewards",    value: loadCat   ? "…" : String(rewards.length),  color: "text-gray-700"   },
          { label: "Active",           value: loadCat   ? "…" : String(activeCount),      color: "text-green-600"  },
          { label: "Pending Delivery", value: loadQueue ? "…" : String(rdPending),        color: "text-amber-600"  },
          { label: "Total Redeemed",   value: loadQueue ? "…" : String(rdTotal),          color: "text-primary-600"},
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: "catalog", label: "Reward Catalog",    Icon: MGift,    badge: undefined },
          { key: "queue",   label: "Fulfillment Queue", Icon: MPeople,  badge: rdPending > 0 ? String(rdPending) : undefined },
        ] as const).map(({ key, label, Icon, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge && (
              <span className="bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Reward Catalog ─────────────────────────────────────────────── */}
      {tab === "catalog" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">All Rewards</h2>
            <span className="text-xs text-gray-400">{rewards.length} reward{rewards.length !== 1 ? "s" : ""}</span>
          </div>

          {loadCat ? (
            <div className="px-5 py-4 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-5 bg-gray-100 rounded-full w-14" />
                </div>
              ))}
            </div>
          ) : rewards.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <MGift className="w-7 h-7 text-primary-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No rewards yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Create rewards for members to redeem with GTK.</p>
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
                    {["Reward", "GTK Cost", "Stock", "Status", "Created", "Actions"].map(h => (
                      <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rewards.map(r => (
                    <tr key={r.id} className={cn("hover:bg-gray-50 transition-colors", !r.is_active && "opacity-60")}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MGift className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{r.title}</p>
                            {r.description && <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{r.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 font-bold text-gray-900">
                          <MCoin className="w-3.5 h-3.5 text-amber-500" />
                          {r.token_cost.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
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
                          <button onClick={() => openEdit(r)} title="Edit" className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleToggle(r)} disabled={acting === r.id} title={r.is_active ? "Hide" : "Show"} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40">
                            <MVisibility className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r)} disabled={acting === r.id || !r.is_active} title="Deactivate" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
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
      )}

      {/* ── Tab: Fulfillment Queue ───────────────────────────────────────────── */}
      {tab === "queue" && (
        <>
          {/* How it works callout */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-5 flex gap-3">
            <MGift className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">How to fulfil a reward</p>
              <p className="text-xs mt-0.5 text-blue-600 leading-relaxed">
                When a member redeems a reward, their GTK is deducted automatically and a request appears here.
                Contact the member (via email or in person) to deliver their reward, then click
                <strong> &ldquo;Mark as Delivered&rdquo;</strong> to confirm fulfilment.
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 font-medium">Filter:</span>
            {(["", "pending", "confirmed"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                  filterStatus === s
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                )}
              >
                {s === "" ? "All" : s === "pending" ? "Pending delivery" : "Fulfilled"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Redemption Requests</h2>
              <span className="text-xs text-gray-400">{rdTotal} total</span>
            </div>

            {loadQueue ? (
              <div className="px-5 py-4 space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-50 rounded w-1/3" />
                    </div>
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                    <div className="h-7 bg-gray-100 rounded-lg w-28" />
                  </div>
                ))}
              </div>
            ) : redemptions.length === 0 ? (
              <div className="py-16 text-center">
                <MAccessTime className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">
                  {filterStatus === "pending" ? "No pending deliveries" : "No redemptions yet"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {filterStatus === "pending"
                    ? "All redemptions are fulfilled."
                    : "Member redemptions will appear here once they start redeeming rewards."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Member redemption requests</caption>
                  <thead className="bg-gray-50">
                    <tr>
                      {["Member", "Reward", "GTK Spent", "Redeemed On", "Status", "Action"].map(h => (
                        <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {redemptions.map(rd => (
                      <tr key={rd.id} className="hover:bg-gray-50 transition-colors">
                        {/* Member */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary-600">
                                {memberName(rd).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">{memberName(rd)}</p>
                              {memberEmail(rd) && (
                                <a href={`mailto:${memberEmail(rd)}`} className="text-xs text-primary-500 hover:underline">
                                  {memberEmail(rd)}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Reward */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MGift className="w-4 h-4 text-primary-400" />
                            </div>
                            <span className="font-medium text-gray-800">{rd.rewards?.title ?? "—"}</span>
                          </div>
                        </td>

                        {/* Tokens */}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 font-bold text-gray-900">
                            <MCoin className="w-3.5 h-3.5 text-amber-500" />
                            {rd.tokens_spent.toLocaleString()} GTK
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-xs text-gray-400">
                          {new Date(rd.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <Badge
                            color={rd.status === "confirmed" ? "green" : rd.status === "failed" ? "red" : "amber"}
                            dot
                          >
                            {rd.status === "confirmed" ? "Fulfilled" : rd.status === "failed" ? "Failed" : "Pending delivery"}
                          </Badge>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          {rd.status === "pending" ? (
                            <Button
                              variant="primary"
                              size="xs"
                              loading={acting === rd.id}
                              onClick={() => handleFulfill(rd)}
                              icon={<MCheckCircle className="w-3.5 h-3.5" />}
                            >
                              Mark as Delivered
                            </Button>
                          ) : rd.status === "confirmed" ? (
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              <MCheckCircle className="w-3.5 h-3.5" /> Delivered
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

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
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{errMsg}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-title">
              Reward Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MGift className="absolute left-3 top-2.5 w-4 h-4 text-primary-400 pointer-events-none" />
              <select
                id="rw-title"
                value={form.title}
                disabled={!!editTarget}
                onChange={e => {
                  const item = catalogItem(e.target.value);
                  setForm(f => ({
                    ...f,
                    title:       e.target.value,
                    description: item ? item.description : f.description,
                    tokenCost:   item ? String(item.tokenCost) : f.tokenCost,
                  }));
                }}
                className={cn(
                  "w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm appearance-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary-400",
                  "disabled:bg-gray-50 disabled:text-gray-500",
                  !form.title ? "text-gray-400" : "text-gray-900"
                )}
              >
                <option value="" disabled>Select a reward type…</option>
                {REWARD_CATALOG.map(r => (
                  <option key={r.title} value={r.title}>{r.title}</option>
                ))}
              </select>
              {/* Custom chevron */}
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {!!editTarget && (
              <p className="text-xs text-gray-400 mt-1">Reward type cannot be changed after creation.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-desc">Description</label>
            <textarea id="rw-desc" rows={3} maxLength={500} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what the member receives…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-cost">
                GTK Cost <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MCoin className="absolute left-3 top-2.5 w-4 h-4 text-amber-500 pointer-events-none" />
                <input id="rw-cost" type="number" min={1} value={form.tokenCost}
                  onChange={e => setForm(f => ({ ...f, tokenCost: e.target.value }))}
                  placeholder="100"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="rw-stock">
                Stock <span className="text-gray-400 font-normal">(blank = unlimited)</span>
              </label>
              <input id="rw-stock" type="number" min={1} value={form.totalSupply}
                disabled={!!editTarget}
                onChange={e => setForm(f => ({ ...f, totalSupply: e.target.value }))}
                placeholder="Unlimited"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="md" fullWidth onClick={() => { setShowCreate(false); setErrMsg(null); }}>Cancel</Button>
            <Button variant="primary" size="md" fullWidth loading={saving} onClick={handleSave}>
              {editTarget ? "Save Changes" : "Create Reward"}
            </Button>
          </div>
        </div>
      </Modal>
    </OrgAdminLayout>
  );
}
