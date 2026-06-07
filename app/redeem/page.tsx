"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { MCoin, MGift, MLeaf, MCheckCircle, MWarning, MAccessTime } from "@/components/icons";

type Reward = {
  id:          string;
  title:       string;
  description: string | null;
  token_cost:  number;
  stock:       number | null;
  is_active:   boolean;
};

type RedemptionLog = {
  id:           string;
  tokens_spent: number;
  status:       string;
  created_at:   string;
  rewards:      { title: string | null; image_url: string | null } | null;
};

export default function RedeemPage() {
  const [rewards,   setRewards]   = useState<Reward[]>([]);
  const [history,   setHistory]   = useState<RedemptionLog[]>([]);
  const [balance,   setBalance]   = useState(0);
  const [totalRed,  setTotalRed]  = useState(0);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [dataLoad,  setDataLoad]  = useState(true);
  const [errMsg,    setErrMsg]    = useState<string | null>(null);
  const [redeemed,  setRedeemed]  = useState<{ title: string; tokens: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/rewards").then(r => r.json()),
      fetch("/api/tokens/balance").then(r => r.json()),
      fetch("/api/redeem/history?limit=10").then(r => r.json()),
    ]).then(([rewardsRes, balRes, histRes]) => {
      setRewards(rewardsRes.data ?? []);
      setBalance(balRes.data?.balance ?? 0);
      const logs: RedemptionLog[] = histRes.data ?? [];
      setHistory(logs);
      setTotalRed(histRes.pagination?.total ?? logs.length);
    }).catch(console.error).finally(() => setDataLoad(false));
  }, []);

  const selectedReward = rewards.find(r => r.id === selected);
  const canRedeem      = selectedReward
    ? selectedReward.is_active &&
      balance >= selectedReward.token_cost &&
      (selectedReward.stock === null || selectedReward.stock > 0)
    : false;

  async function handleRedeem() {
    if (!selectedReward || !canRedeem) return;
    setErrMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rewardId: selectedReward.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json.error?.message ?? "Redemption failed. Please try again.");
        return;
      }
      const newBalance = json.data?.newBalance ?? balance - selectedReward.token_cost;
      setBalance(newBalance);
      setRedeemed({ title: selectedReward.title, tokens: selectedReward.token_cost });
      setSelected(null);
      setSuccess(true);
      setTotalRed(t => t + 1);
      const newLog: RedemptionLog = {
        id:           json.data?.redemptionId ?? String(Date.now()),
        tokens_spent: selectedReward.token_cost,
        status:       "confirmed",
        created_at:   new Date().toISOString(),
        rewards:      { title: selectedReward.title, image_url: null },
      };
      setHistory(h => [newLog, ...h.slice(0, 9)]);
      // Remove from available if stock is limited
      if (selectedReward.stock !== null) {
        setRewards(prev => prev.map(r =>
          r.id === selectedReward.id ? { ...r, stock: Math.max(0, (r.stock ?? 1) - 1) } : r
        ));
      }
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (s: string) =>
    s === "confirmed" ? "green" : s === "pending" ? "amber" : "red";

  return (
    <AppLayout title="Redeem Tokens" tokenBalance={BigInt(balance * 10_000_000)}>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Redeem Rewards</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use your GreenTokens to claim rewards. Every redemption supports community impact.
        </p>
      </div>

      {/* Error banner */}
      {errMsg && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errMsg}</span>
          <button onClick={() => setErrMsg(null)} className="ml-auto text-red-400 hover:text-red-600 leading-none">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {([
          {
            label: "Your Balance",
            value: dataLoad ? "…" : `${balance.toLocaleString()} GTK`,
            sub:   "Available to spend",
            Icon:  MCoin,
            color: "text-amber-500",
            bg:    "bg-amber-50",
          },
          {
            label: "Rewards Redeemed",
            value: dataLoad ? "…" : String(totalRed),
            sub:   "All time",
            Icon:  MGift,
            color: "text-primary-600",
            bg:    "bg-primary-50",
          },
          {
            label: "Impact",
            value: "Every GTK counts",
            sub:   "Towards sustainability",
            Icon:  MLeaf,
            color: "text-green-600",
            bg:    "bg-green-50",
          },
        ] as const).map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
              <Icon className={cn("w-5 h-5", color)} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xs text-gray-300 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Available Rewards */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Available Rewards</h3>

      {dataLoad ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
              <div className="h-36 bg-gray-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
              <MGift className="w-7 h-7 text-primary-300" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">No rewards yet</p>
          <p className="text-xs text-gray-400 mt-1">Ask your org admin to add rewards in the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {rewards.map((r) => {
            const isSelected = selected === r.id;
            const affordable = balance >= r.token_cost;
            const inStock    = r.stock === null || r.stock > 0;
            const available  = r.is_active && inStock;
            const clickable  = available && affordable;

            return (
              <div
                key={r.id}
                onClick={() => clickable && setSelected(isSelected ? null : r.id)}
                className={cn(
                  "relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200 flex flex-col",
                  isSelected  ? "border-primary-500 shadow-lg ring-2 ring-primary-200"
                  : !clickable ? "border-gray-100 opacity-60 cursor-not-allowed"
                               : "border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer",
                )}
                role="radio"
                aria-checked={isSelected}
                tabIndex={clickable ? 0 : -1}
                onKeyDown={e => e.key === "Enter" && clickable && setSelected(isSelected ? null : r.id)}
              >
                {/* Selection check */}
                {isSelected && (
                  <div className="absolute top-3 left-3 z-10 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow">
                    <span className="text-white text-xs leading-none">✓</span>
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge color={!inStock ? "red" : available ? "green" : "gray"}>
                    {!inStock ? "Out of stock" : available ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                {/* Visual */}
                <div className={cn(
                  "h-36 flex flex-col items-center justify-center gap-2",
                  isSelected ? "bg-primary-100" : "bg-gradient-to-br from-primary-50 to-primary-100"
                )}>
                  <MGift className={cn("w-14 h-14", isSelected ? "text-primary-500" : "text-primary-300")} aria-hidden />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-900 mb-1 leading-tight">{r.title}</h4>
                  {r.description && (
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed flex-1">{r.description}</p>
                  )}

                  {/* Stock indicator */}
                  {r.stock !== null && (
                    <p className="text-xs text-gray-400 mb-2">
                      {r.stock > 0 ? `${r.stock.toLocaleString()} remaining` : "Out of stock"}
                    </p>
                  )}

                  {/* Need more GTK */}
                  {available && !affordable && (
                    <p className="text-xs text-amber-600 font-medium mb-2">
                      Need {(r.token_cost - balance).toLocaleString()} more GTK
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                      <MCoin className="w-4 h-4 text-amber-500" />
                      {r.token_cost.toLocaleString()} GTK
                    </span>
                    <span className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                      isSelected              ? "bg-primary-500 text-white"
                      : clickable             ? "border border-primary-200 text-primary-600 bg-primary-50"
                                              : "bg-gray-100 text-gray-400"
                    )}>
                      {isSelected ? "Selected ✓" : clickable ? "Select" : !inStock ? "Sold out" : "Can't afford"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Redeem CTA — sticky when a reward is selected */}
      {selected && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-primary-800">
            <MLeaf className="w-4 h-4 flex-shrink-0 text-primary-600" />
            <span>
              Redeem <strong className="font-bold">{selectedReward?.title}</strong> for{" "}
              <strong className="font-bold">{selectedReward?.token_cost.toLocaleString()} GTK</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-primary-500 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleRedeem}
              icon={<MGift className="w-4 h-4" />}
            >
              Redeem Now
            </Button>
          </div>
        </div>
      )}

      {/* Redemption History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Redemption History</h3>
          {totalRed > 0 && (
            <span className="text-xs text-gray-400">{totalRed} total</span>
          )}
        </div>

        {dataLoad ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading history…</div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center">
            <MAccessTime className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No redemptions yet</p>
            <p className="text-xs text-gray-400 mt-1">Your redeemed rewards will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Your redemption history</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Reward", "Date", "Tokens Spent", "Status"].map(h => (
                  <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MGift className="w-4 h-4 text-primary-400" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {row.rewards?.title ?? "Reward"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(row.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 font-semibold text-red-500">
                      <MCoin className="w-3.5 h-3.5 text-amber-400" />
                      −{row.tokens_spent.toLocaleString()} GTK
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={statusColor(row.status)} dot>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Success Modal */}
      <Modal
        open={success}
        onClose={() => { setSuccess(false); setRedeemed(null); }}
        title="Redemption Successful!"
        icon={<MCheckCircle className="w-8 h-8 text-green-600" />}
        description={
          redeemed
            ? `You redeemed "${redeemed.title}" for ${redeemed.tokens.toLocaleString()} GTK. Your reward will be processed shortly by your org admin.`
            : "Your reward will be processed shortly."
        }
        size="sm"
      >
        <div className="space-y-2 mt-1">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center text-xs text-green-700">
            <MLeaf className="w-4 h-4 mx-auto mb-1 text-green-500" />
            Thank you for supporting community sustainability!
          </div>
          <Button variant="primary" size="md" fullWidth onClick={() => { setSuccess(false); setRedeemed(null); }}>
            Done
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
