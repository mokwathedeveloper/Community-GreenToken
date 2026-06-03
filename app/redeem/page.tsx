"use client";

// Rules: R-FE-01, R-FE-02, R-COMP-01 (Button, Badge, Modal), R-A11Y-01, R-A11Y-06 (modal focus)
// Spec: ux_ui/feature_specv2/token_redemption_page_md.md
// Mockup: mockup/token_redemption_page_mockup.png

import { useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface Reward {
  id:          number;
  title:       string;
  description: string;
  tokenCost:   number;
  available:   boolean;
  image:       string;
}

const REWARDS: Reward[] = [
  { id: 1, title: "Tree Planting",    description: "Plant a tree to contribute to the eco-system.",    tokenCost: 50,  available: true,  image: "🌳" },
  { id: 2, title: "Recycling Kit",    description: "Get a recycling starter kit to get your community going.", tokenCost: 100, available: true,  image: "♻️" },
  { id: 3, title: "Workshop Entry",   description: "Access to a sustainability workshop.",              tokenCost: 75,  available: false, image: "🏫" },
];

const RECENT = [
  { title: "Tree Planting",  date: "Apr 12, 2024", tokens: 50,  status: "Completed" },
  { title: "Workshop Entry", date: "Mar 21, 2024", tokens: 75,  status: "Completed" },
];

const MY_BALANCE = 1250;

export default function RedeemPage() {
  const [selected, setSelected]   = useState<number | null>(null);
  const [success,  setSuccess]    = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [balance,  setBalance]    = useState(MY_BALANCE);

  const selectedReward = REWARDS.find((r) => r.id === selected);
  const canRedeem = selectedReward
    ? selectedReward.available && balance >= selectedReward.tokenCost
    : false;

  async function handleRedeem() {
    if (!selectedReward || !canRedeem) return;
    setLoading(true);
    try {
      // Phase 2: POST /api/rewards/redeem — user signs with Freighter wallet
      await new Promise((r) => setTimeout(r, 1000));
      setBalance((b) => b - selectedReward.tokenCost);
      setSuccess(true);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Redeem Tokens" tokenBalance={BigInt(balance * 10_000_000)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Redeem Tokens</h2>
        <p className="text-sm text-gray-500 mt-1">Use your GreenTokens to redeem friendly rewards and support community impact.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Your Total",     value: `${balance.toLocaleString()} GTK`, icon: "🪙" },
          { label: "Total Redeemed", value: "3 Rewards",                        icon: "🎁" },
          { label: "Impact Note",    value: "Every redemption makes an impact", icon: "🌿" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reward cards */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Available Rewards</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {REWARDS.map((r) => {
          const isSelected   = selected === r.id;
          const affordable   = balance >= r.tokenCost;

          return (
            <div key={r.id}
              onClick={() => r.available && affordable && setSelected(isSelected ? null : r.id)}
              className={cn(
                "relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200",
                isSelected          ? "border-primary-500 shadow-md"   :
                !r.available        ? "border-gray-100 opacity-60 cursor-not-allowed" :
                !affordable         ? "border-gray-100 opacity-60 cursor-not-allowed" :
                                      "border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer",
                "focus-within:ring-2 focus-within:ring-primary-500"
              )}
              role="radio"
              aria-checked={isSelected}
              tabIndex={r.available && affordable ? 0 : -1}
              onKeyDown={(e) => e.key === "Enter" && r.available && affordable && setSelected(isSelected ? null : r.id)}
            >
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                <Badge color={r.available ? "green" : "gray"}>{r.available ? "Available" : "Unavailable"}</Badge>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center" aria-hidden="true">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}

              {/* Image */}
              <div className="h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-6xl" aria-hidden="true">
                {r.image}
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{r.title}</h4>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{r.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <span aria-hidden="true">🪙</span> {r.tokenCost} Tokens
                  </span>
                  <button
                    type="button"
                    disabled={!r.available || !affordable}
                    onClick={(e) => { e.stopPropagation(); r.available && affordable && setSelected(isSelected ? null : r.id); }}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      isSelected
                        ? "bg-primary-500 text-white"
                        : r.available && affordable
                          ? "border border-primary-200 text-primary-600 hover:bg-primary-50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}>
                    {isSelected ? "Selected ✓" : "Select Reward"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redeem CTA */}
      {selected && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-primary-700 font-medium">
            🌿 Select and click &ldquo;Redeem Selected&rdquo; to redeem your reward.
          </p>
          <Button variant="primary" size="md" loading={loading} onClick={handleRedeem} icon={<span>🎁</span>}>
            Redeem Selected
          </Button>
        </div>
      )}

      {/* Recent redemptions table — R-A11Y-08 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Recent Redemptions</h3>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">Your recent token redemptions</caption>
          <thead className="bg-gray-50">
            <tr>
              {["Reward", "Date", "Tokens", "Status"].map((h) => (
                <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {RECENT.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{r.title}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{r.date}</td>
                <td className="px-5 py-3.5 text-primary-600 font-semibold">-{r.tokens} GTK</td>
                <td className="px-5 py-3.5"><Badge color="green">{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Success modal — R-A11Y-06 */}
      <Modal
        open={success}
        onClose={() => setSuccess(false)}
        title="Redemption Successful!"
        icon={<span className="text-3xl">🎉</span>}
        description={`You have successfully redeemed your tokens. Your reward will be processed shortly.`}
      >
        <Button variant="primary" size="md" fullWidth onClick={() => setSuccess(false)}>Close</Button>
      </Modal>
    </AppLayout>
  );
}
