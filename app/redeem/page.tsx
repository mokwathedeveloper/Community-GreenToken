"use client";

// Rules: R-FE-01, R-FE-02, R-COMP-01 (Button, Badge, Modal), R-A11Y-01, R-A11Y-06 (modal focus)
// Spec: ux_ui/feature_specv2/token_redemption_page_md.md

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { MCoin, MGift, MLeaf } from "@/components/icons";

type Reward = {
  id:          string;
  title:       string;
  description: string;
  token_cost:  number;
  stock:       number | null;
  is_active:   boolean;
};

type HistoryRow = {
  id:        string;
  event:     string;
  amount:    number;
  timestamp: string;
};

export default function RedeemPage() {
  const [rewards,   setRewards]   = useState<Reward[]>([]);
  const [history,   setHistory]   = useState<HistoryRow[]>([]);
  const [balance,   setBalance]   = useState(0);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [dataLoad,  setDataLoad]  = useState(true);
  const [redeemed,  setRedeemed]  = useState<{ reward: string; tokens: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/rewards").then((r) => r.json()),
      fetch("/api/tokens/balance").then((r) => r.json()),
      fetch("/api/tokens/history?type=spend&limit=5").then((r) => r.json()),
    ]).then(([rewardsRes, balRes, histRes]) => {
      setRewards(rewardsRes.data ?? []);
      setBalance(balRes.data?.balance ?? 0);
      setHistory(histRes.data ?? []);
    }).catch(console.error).finally(() => setDataLoad(false));
  }, []);

  const selectedReward = rewards.find((r) => r.id === selected);
  const canRedeem      = selectedReward ? selectedReward.is_active && balance >= selectedReward.token_cost : false;

  async function handleRedeem() {
    if (!selectedReward || !canRedeem) return;
    setLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rewardId: selectedReward.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error?.message ?? "Redemption failed. Please try again.");
        return;
      }
      setBalance(json.data.newBalance ?? balance - selectedReward.token_cost);
      setRedeemed({ reward: selectedReward.title, tokens: selectedReward.token_cost });
      setSelected(null);
      setSuccess(true);
      // Add to local history
      setHistory((h) => [{
        id:        json.data.redemptionId ?? Date.now().toString(),
        event:     `Redeemed: ${selectedReward.title}`,
        amount:    -selectedReward.token_cost,
        timestamp: new Date().toISOString(),
      }, ...h.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Redeem Tokens" tokenBalance={BigInt(balance * 10_000_000)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Redeem Tokens</h2>
        <p className="text-sm text-gray-500 mt-1">Use your GreenTokens to redeem rewards and support community impact.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {([
          { label: "Your Balance",     value: dataLoad ? "…" : `${balance.toLocaleString()} GTK`, Icon: MCoin, color: "text-amber-500"   },
          { label: "Rewards Redeemed", value: dataLoad ? "…" : String(history.length),            Icon: MGift, color: "text-primary-600" },
          { label: "Impact",           value: "Every redemption matters",                          Icon: MLeaf, color: "text-green-600"   },
        ] as const).map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reward cards */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Available Rewards</h3>

      {dataLoad ? (
        <p className="text-center text-sm text-gray-400 py-10">Loading rewards…</p>
      ) : rewards.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-2"><MGift className="w-8 h-8 text-gray-400" /></div>
          <p className="text-sm font-medium text-gray-700">No rewards yet</p>
          <p className="text-xs text-gray-400 mt-1">Ask your org admin to add rewards in the dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {rewards.map((r) => {
            const isSelected = selected === r.id;
            const affordable = balance >= r.token_cost;
            const available  = r.is_active && (r.stock === null || r.stock > 0);

            return (
              <div key={r.id}
                onClick={() => available && affordable && setSelected(isSelected ? null : r.id)}
                className={cn(
                  "relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200",
                  isSelected   ? "border-primary-500 shadow-md" :
                  !available   ? "border-gray-100 opacity-60 cursor-not-allowed" :
                  !affordable  ? "border-gray-100 opacity-60 cursor-not-allowed" :
                                 "border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer",
                  "focus-within:ring-2 focus-within:ring-primary-500"
                )}
                role="radio" aria-checked={isSelected}
                tabIndex={available && affordable ? 0 : -1}
                onKeyDown={(e) => e.key === "Enter" && available && affordable && setSelected(isSelected ? null : r.id)}>

                <div className="absolute top-3 right-3">
                  <Badge color={available ? "green" : "gray"}>{available ? "Available" : "Unavailable"}</Badge>
                </div>
                {isSelected && (
                  <div className="absolute top-3 left-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center" aria-hidden="true">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}

                <div className="h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center" aria-hidden="true">
                  <MGift className="w-16 h-16 text-primary-300" />
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{r.title}</h4>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{r.description}</p>
                  {!affordable && (
                    <p className="text-xs text-amber-600 mb-2">Need {(r.token_cost - balance).toLocaleString()} more GTK</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                      <MCoin className="w-4 h-4 text-amber-500" aria-hidden="true" /> {r.token_cost.toLocaleString()} GTK
                    </span>
                    <button type="button"
                      disabled={!available || !affordable}
                      onClick={(e) => { e.stopPropagation(); available && affordable && setSelected(isSelected ? null : r.id); }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                        isSelected              ? "bg-primary-500 text-white" :
                        available && affordable ? "border border-primary-200 text-primary-600 hover:bg-primary-50" :
                                                  "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}>
                      {isSelected ? "Selected ✓" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Redeem CTA */}
      {selected && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-primary-700 font-medium flex items-center gap-1">
            <MLeaf className="w-4 h-4" /> Ready to redeem <strong>{selectedReward?.title}</strong> for <strong>{selectedReward?.token_cost} GTK</strong>
          </p>
          <Button variant="primary" size="md" loading={loading} onClick={handleRedeem} icon={<MGift className="w-4 h-4" />}>
            Redeem Now
          </Button>
        </div>
      )}

      {/* Recent redemptions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Recent Redemptions</h3>
        </div>
        {history.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No redemptions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Your recent token redemptions</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Reward", "Date", "Tokens"].map((h) => (
                  <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{r.event}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(r.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-red-500 font-semibold">{r.amount.toLocaleString()} GTK</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={success}
        onClose={() => { setSuccess(false); setRedeemed(null); }}
        title="Redemption Successful!"
        icon={<MGift className="w-8 h-8 text-primary-600 mx-auto mb-2" />}
        description={redeemed
          ? `You redeemed "${redeemed.reward}" for ${redeemed.tokens} GTK. Your reward will be processed shortly.`
          : "Your reward will be processed shortly."}>
        <Button variant="primary" size="md" fullWidth onClick={() => { setSuccess(false); setRedeemed(null); }}>
          Close
        </Button>
      </Modal>
    </AppLayout>
  );
}
