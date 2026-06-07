"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import {
  MCoin, MGift, MLeaf, MCheckCircle, MWarning, MAccessTime,
  MWaterDrop, MWbSunny, MRecycle, MTree,
} from "@/components/icons";

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

// ── Reward card theme — derived from title keywords ──────────────────────────
type CardTheme = {
  bg:   string;
  icon: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

function getCardTheme(title: string, index: number): CardTheme {
  const t = title.toLowerCase();
  if (t.includes("tree") || t.includes("plant") || t.includes("garden") || t.includes("seed"))
    return { bg: "from-emerald-50 to-teal-100",   icon: "text-emerald-500",  Icon: MTree      };
  if (t.includes("water") || t.includes("bottle") || t.includes("ocean") || t.includes("sea"))
    return { bg: "from-sky-50 to-blue-100",        icon: "text-sky-500",      Icon: MWaterDrop };
  if (t.includes("solar") || t.includes("energy") || t.includes("sun") || t.includes("light"))
    return { bg: "from-amber-50 to-yellow-100",    icon: "text-amber-500",    Icon: MWbSunny   };
  if (t.includes("recycle") || t.includes("compost") || t.includes("waste") || t.includes("eco"))
    return { bg: "from-lime-50 to-green-100",      icon: "text-lime-600",     Icon: MRecycle   };
  if (t.includes("leaf") || t.includes("nature") || t.includes("bio") || t.includes("organic"))
    return { bg: "from-green-50 to-emerald-100",   icon: "text-green-500",    Icon: MLeaf      };
  // fallback — rotate through color palette by card index
  const FALLBACKS: CardTheme[] = [
    { bg: "from-primary-50 to-primary-100",   icon: "text-primary-500",   Icon: MGift    },
    { bg: "from-violet-50 to-purple-100",     icon: "text-violet-500",    Icon: MGift    },
    { bg: "from-rose-50 to-pink-100",         icon: "text-rose-500",      Icon: MGift    },
    { bg: "from-cyan-50 to-sky-100",          icon: "text-cyan-500",      Icon: MGift    },
  ];
  return FALLBACKS[index % FALLBACKS.length];
}

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
        status:       "pending",
        created_at:   new Date().toISOString(),
        rewards:      { title: selectedReward.title, image_url: null },
      };
      setHistory(h => [newLog, ...h.slice(0, 9)]);
      // Decrement stock client-side only for limited-stock rewards
      if (selectedReward.stock !== null) {
        setRewards(prev => prev.map(r =>
          r.id === selectedReward.id
            ? { ...r, stock: Math.max(0, (r.stock ?? 0) - 1) }
            : r
        ));
      }
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (s: string) =>
    s === "confirmed" ? "green" : s === "pending" ? "amber" : "red";

  const statusLabel = (s: string) =>
    s === "confirmed" ? "Fulfilled" : s === "pending" ? "Pending" : "Failed";

  // GTK value in KES (same rate as withdrawal)
  const GTK_RATE_KES = 0.50;
  const balanceKes   = (balance * GTK_RATE_KES).toFixed(2);

  return (
    <AppLayout title="Redeem Tokens" tokenBalance={BigInt(balance * 10_000_000)}>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MGift className="w-6 h-6 text-primary-500" aria-hidden />
            Redeem Rewards
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Convert your GreenTokens into real-world eco rewards.
          </p>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {errMsg && (
        <div role="alert" className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{errMsg}</span>
          <button onClick={() => setErrMsg(null)} aria-label="Dismiss" className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {([
          {
            label: "Token Balance",
            value: dataLoad ? "…" : `${balance.toLocaleString()} GTK`,
            sub:   dataLoad ? "" : `≈ KES ${Number(balanceKes).toLocaleString("en-KE")} available`,
            Icon:  MCoin,
            color: "text-amber-500",
            bg:    "bg-amber-50",
          },
          {
            label: "Rewards Claimed",
            value: dataLoad ? "…" : totalRed.toLocaleString(),
            sub:   totalRed === 1 ? "reward redeemed" : "rewards redeemed",
            Icon:  MGift,
            color: "text-primary-600",
            bg:    "bg-primary-50",
          },
          {
            label: "Eco Impact",
            value: dataLoad ? "…" : rewards.filter(r => r.is_active).length.toString(),
            sub:   "rewards available to claim",
            Icon:  MLeaf,
            color: "text-green-600",
            bg:    "bg-green-50",
          },
        ] as const).map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
              <Icon className={cn("w-5 h-5", color)} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 leading-tight truncate">{value}</p>
              <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Available Rewards ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Available Rewards</h3>
        {!dataLoad && rewards.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
            {rewards.filter(r => r.is_active && (r.stock === null || r.stock > 0)).length} in stock
          </span>
        )}
      </div>

      {dataLoad ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
              <div className="h-36 bg-gray-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-8 bg-gray-100 rounded w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
              <MGift className="w-8 h-8 text-primary-300" aria-hidden />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-700">No rewards yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Your org admin hasn't added any rewards. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {rewards.map((r, idx) => {
            const isSelected = selected === r.id;
            const affordable = balance >= r.token_cost;
            const inStock    = r.stock === null || r.stock > 0;
            const available  = r.is_active && inStock;
            const clickable  = available && affordable;
            const theme      = getCardTheme(r.title, idx);
            const ThemeIcon  = theme.Icon;
            const shortage   = r.token_cost - balance;

            return (
              <div
                key={r.id}
                onClick={() => clickable && setSelected(isSelected ? null : r.id)}
                onKeyDown={e => e.key === "Enter" && clickable && setSelected(isSelected ? null : r.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={clickable ? 0 : -1}
                className={cn(
                  "relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200 flex flex-col group",
                  isSelected  ? "border-primary-500 shadow-lg ring-2 ring-primary-200"
                  : !clickable ? "border-gray-100 opacity-60 cursor-not-allowed"
                               : "border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer",
                )}
              >
                {/* Selection check */}
                {isSelected && (
                  <div className="absolute top-3 left-3 z-10 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                    <MCheckCircle className="w-4 h-4 text-white" aria-hidden />
                  </div>
                )}

                {/* Availability badge */}
                <div className="absolute top-3 right-3 z-10">
                  {!inStock ? (
                    <Badge color="red">Out of stock</Badge>
                  ) : !available ? (
                    <Badge color="gray">Unavailable</Badge>
                  ) : affordable ? (
                    <Badge color="green">Available</Badge>
                  ) : (
                    <Badge color="amber">Need more GTK</Badge>
                  )}
                </div>

                {/* Visual banner — themed per reward */}
                <div className={cn(
                  "h-36 flex flex-col items-center justify-center gap-2 transition-all",
                  `bg-gradient-to-br ${theme.bg}`,
                  clickable && !isSelected && "group-hover:scale-[1.02]"
                )}>
                  <ThemeIcon className={cn("w-14 h-14 transition-transform", theme.icon, isSelected && "scale-110")} aria-hidden />
                  {r.stock !== null && r.stock <= 5 && r.stock > 0 && (
                    <span className="text-[10px] font-bold bg-white/80 text-amber-700 rounded-full px-2 py-0.5 shadow-sm">
                      Only {r.stock} left!
                    </span>
                  )}
                </div>

                {/* Card content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-900 leading-tight mb-1">{r.title}</h4>
                  {r.description && (
                    <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-2">{r.description}</p>
                  )}

                  {/* Stock meter for limited items */}
                  {r.stock !== null && r.stock > 0 && (
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                      {r.stock.toLocaleString()} remaining
                    </p>
                  )}

                  {/* Shortfall indicator */}
                  {available && !affordable && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mb-2">
                      <MCoin className="w-3 h-3 text-amber-500 flex-shrink-0" aria-hidden />
                      <p className="text-xs text-amber-700 font-medium">
                        Earn {shortage.toLocaleString()} more GTK to unlock
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                      <MCoin className="w-4 h-4 text-amber-500" aria-hidden />
                      {r.token_cost.toLocaleString()} GTK
                    </span>
                    <span className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                      isSelected  ? "bg-primary-500 text-white shadow-sm"
                      : clickable ? "border border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100"
                                  : "bg-gray-100 text-gray-400",
                    )}>
                      {isSelected ? "Selected ✓" : clickable ? "Redeem" : !inStock ? "Sold out" : "Can't afford"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sticky redeem CTA ─────────────────────────────────────────────── */}
      {selected && selectedReward && (
        <div className="bg-primary-600 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between shadow-lg shadow-primary-900/20">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <MGift className="w-5 h-5 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{selectedReward.title}</p>
              <p className="text-xs text-white/70">{selectedReward.token_cost.toLocaleString()} GTK → KES {(selectedReward.token_cost * 0.50).toFixed(2)} value</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="secondary"
              size="md"
              loading={loading}
              onClick={handleRedeem}
              icon={<MCheckCircle className="w-4 h-4" />}
            >
              Confirm Redemption
            </Button>
          </div>
        </div>
      )}

      {/* ── Redemption history ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MAccessTime className="w-4 h-4 text-gray-400" aria-hidden />
            <h3 className="text-sm font-bold text-gray-900">Redemption History</h3>
          </div>
          {totalRed > 0 && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
              {totalRed} total
            </span>
          )}
        </div>

        {dataLoad ? (
          <div className="py-8 text-center text-sm text-gray-400 animate-pulse">Loading history…</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MAccessTime className="w-6 h-6 text-gray-300" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-gray-600">No redemptions yet</p>
            <p className="text-xs text-gray-400 mt-1">Select a reward above to make your first redemption.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Your reward redemption history</caption>
            <thead className="bg-gray-50/80">
              <tr>
                {["Reward", "Date", "Cost", "Status"].map(h => (
                  <th key={h} scope="col"
                    className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MGift className="w-4 h-4 text-primary-400" aria-hidden />
                      </div>
                      <span className="font-semibold text-gray-900">
                        {row.rewards?.title ?? "Reward"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 font-bold text-gray-700">
                      <MCoin className="w-3.5 h-3.5 text-amber-400" aria-hidden />
                      {row.tokens_spent.toLocaleString()} GTK
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={statusColor(row.status)} dot>
                      {statusLabel(row.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Success modal ──────────────────────────────────────────────────── */}
      <Modal
        open={success}
        onClose={() => { setSuccess(false); setRedeemed(null); }}
        title="Redemption Successful! 🎉"
        icon={<MCheckCircle className="w-8 h-8 text-green-500" />}
        description={
          redeemed
            ? `You redeemed "${redeemed.title}" for ${redeemed.tokens.toLocaleString()} GTK. Your org admin will fulfil the reward shortly.`
            : "Your reward has been requested."
        }
        size="sm"
      >
        <div className="space-y-3 mt-2">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <MLeaf className="w-5 h-5 mx-auto mb-1.5 text-green-500" aria-hidden />
            <p className="text-xs text-green-700 font-medium">
              Thank you for supporting community sustainability!
            </p>
          </div>
          <Button variant="primary" size="md" fullWidth onClick={() => { setSuccess(false); setRedeemed(null); }}>
            Done
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
