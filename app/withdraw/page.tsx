"use client";

// RBAC: member-only page — earn GTK tokens → convert to KSH or USD → withdraw to M-Pesa or bank
// Spec: separation of concerns — billing is owner-only; token cash-out is member financial feature

import { useState, useEffect, type FormEvent } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { MCoin, MAccountBalance, MPayments, MCreditCard, MPhoneAndroid, MAttachMoney, MWarning } from "@/components/icons";

type Currency  = "KES" | "USD";
type Method    = "mpesa" | "bank_transfer";
type WithdrawalRecord = {
  id:             string;
  tokens_amount:  number;
  cash_amount:    number;
  currency:       string;
  method:         string;
  account_name:   string;
  status:         "pending" | "processing" | "completed" | "failed" | "canceled";
  failure_reason: string | null;
  processed_at:   string | null;
  created_at:     string;
};

const RATES: Record<Currency, number> = { KES: 0.50, USD: 0.004 };
const MIN_GTK = 500;

export default function WithdrawPage() {
  const [balance,    setBalance]    = useState<number | null>(null);
  const [history,    setHistory]    = useState<WithdrawalRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [loadErr,    setLoadErr]    = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Form state
  const [amount,     setAmount]     = useState<number>(500);
  const [currency,   setCurrency]   = useState<Currency>("KES");
  const [method,     setMethod]     = useState<Method>("mpesa");
  const [accName,    setAccName]    = useState("");
  const [accNumber,  setAccNumber]  = useState("");
  const [bankName,   setBankName]   = useState("");

  const rate      = RATES[currency];
  const cashOut   = parseFloat((amount * rate).toFixed(2));
  const canSubmit = amount >= MIN_GTK && (balance ?? 0) >= amount && accName.trim() && accNumber.trim() && (method === "mpesa" || bankName.trim());

  useEffect(() => {
    Promise.all([
      fetch("/api/tokens/balance").then(r => r.json()),
      fetch("/api/withdraw").then(r => r.json()),
    ]).then(([balRes, histRes]) => {
      setBalance(balRes.data?.balance ?? 0);
      setHistory(histRes.data ?? []);
    }).catch((err: unknown) => setLoadErr(err instanceof Error ? err.message : "Failed to load your balance. Please refresh.")).finally(() => setLoading(false));
  }, [success]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true); setError(null);
    try {
      const res  = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokensAmount:  amount,
          currency,
          method,
          accountName:   accName.trim(),
          accountNumber: accNumber.trim(),
          bankName:      method === "bank_transfer" ? bankName.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Withdrawal failed. Please try again.");
        return;
      }
      setSuccess(true);
      setAmount(500); setAccName(""); setAccNumber(""); setBankName("");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout title="Withdraw">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MAttachMoney className="w-6 h-6 text-primary-500" aria-hidden="true" /> Withdraw Tokens
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Convert your GreenTokens to cash and send to M-Pesa or your bank account.
        </p>
      </div>

      {loadErr && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{loadErr}</span>
          <button onClick={() => setLoadErr(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Balance card ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0"><MCoin className="w-6 h-6 text-primary-600" /></div>
          <div>
            <p className={cn("text-2xl font-extrabold text-gray-900", loading && "animate-pulse")}>
              {loading ? "…" : (balance ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">GTK Available</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"><MAccountBalance className="w-6 h-6 text-green-600" aria-hidden="true" /></div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {loading ? "…" : `KES ${((balance ?? 0) * RATES.KES).toFixed(2)}`}
            </p>
            <p className="text-xs text-gray-500">Equivalent (KES)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><MPayments className="w-6 h-6 text-blue-600" aria-hidden="true" /></div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {loading ? "…" : `$${((balance ?? 0) * RATES.USD).toFixed(2)}`}
            </p>
            <p className="text-xs text-gray-500">Equivalent (USD)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Withdrawal form (3/5) ── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <MCreditCard className="w-4 h-4 text-primary-500" aria-hidden="true" /> Request Withdrawal
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Minimum {MIN_GTK.toLocaleString()} GTK · Rate: 1 GTK = {RATES.KES} KES / ${RATES.USD} USD
          </p>

          {error && (
            <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              <MWarning className="w-4 h-4 flex-shrink-0" aria-hidden="true" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Amount */}
            <div>
              <label htmlFor="gtx-amount" className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount (GTK)
              </label>
              <input
                id="gtx-amount"
                type="number"
                min={MIN_GTK}
                max={balance ?? 0}
                value={amount}
                onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {amount > 0 && (
                <p className="text-xs text-primary-600 mt-1">
                  ≈ {currency === "KES" ? `KES ${cashOut.toLocaleString("en-KE",{minimumFractionDigits:2})}` : `$${cashOut} USD`}
                </p>
              )}
              {amount < MIN_GTK && amount > 0 && (
                <p className="text-xs text-red-500 mt-1">Minimum withdrawal is {MIN_GTK.toLocaleString()} GTK</p>
              )}
              {(balance ?? 0) > 0 && amount > (balance ?? 0) && (
                <p className="text-xs text-red-500 mt-1">Exceeds your balance of {(balance ?? 0).toLocaleString()} GTK</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <div className="grid grid-cols-2 gap-3">
                {(["KES","USD"] as Currency[]).map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "border-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      currency === c ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}>
                    {c === "KES" ? "🇰🇪 KSH" : "🇺🇸 USD"}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payout Method</label>
              <div className="grid grid-cols-2 gap-3">
                {(["mpesa", "bank_transfer"] as Method[]).map(m => (
                  <button
                    key={m} type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      "border-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      method === m ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}>
                    <span className="flex items-center justify-center gap-1.5">
                      {m === "mpesa"
                        ? <MPhoneAndroid className="w-4 h-4" aria-hidden="true" />
                        : <MAccountBalance className="w-4 h-4" aria-hidden="true" />}
                      {m === "mpesa" ? "M-Pesa" : "Bank Transfer"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account details */}
            <div>
              <label htmlFor="acc-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Holder Name
              </label>
              <input
                id="acc-name"
                type="text"
                placeholder="Full name as on the account"
                value={accName}
                onChange={e => setAccName(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="acc-number" className="block text-sm font-medium text-gray-700 mb-1.5">
                {method === "mpesa" ? "M-Pesa Phone Number" : "Bank Account Number"}
              </label>
              <input
                id="acc-number"
                type="text"
                placeholder={method === "mpesa" ? "e.g. +254712345678" : "e.g. 1234567890"}
                value={accNumber}
                onChange={e => setAccNumber(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>

            {method === "bank_transfer" && (
              <div>
                <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bank Name
                </label>
                <input
                  id="bank-name"
                  type="text"
                  placeholder="e.g. KCB, Equity, ABSA, Standard Bank"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                Withdrawals are processed within <strong>1–3 business days</strong>.
                Your tokens are deducted immediately when you submit.
                Contact support if a payment is delayed.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={!canSubmit}
            >
              Withdraw {amount >= MIN_GTK ? `${amount.toLocaleString()} GTK` : ""}
              {amount >= MIN_GTK && ` → ${currency === "KES" ? `KES ${cashOut.toLocaleString("en-KE",{minimumFractionDigits:2})}` : `$${cashOut} USD`}`}
            </Button>
          </form>
        </div>

        {/* ── Right panel — Info + History (2/5) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* How it works */}
          <div className="bg-primary-600 rounded-xl p-6 text-white">
            <h3 className="text-sm font-bold text-white mb-1">How Withdrawal Works</h3>
            <p className="text-xs text-white/70 mb-5">Your tokens become real money in 3 simple steps.</p>
            <div className="space-y-4">
              {[
                { title: "Convert Tokens",   desc: "Choose GTK amount and your preferred currency (KES or USD)." },
                { title: "Choose Method",    desc: "Send to M-Pesa instantly or bank transfer in 1–3 days."     },
                { title: "Receive Payment",  desc: "Money arrives in your account. Tokens are deducted upfront." },
              ].map(({ title, desc }, i) => (
                <div key={title} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-white/70 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current rates */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Rates</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">1 GTK</span>
                <span className="text-sm font-bold text-gray-900">= KES {RATES.KES}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">1 GTK</span>
                <span className="text-sm font-bold text-gray-900">= ${RATES.USD} USD</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400">Min withdrawal</span>
                <span className="text-xs font-semibold text-gray-600">{MIN_GTK.toLocaleString()} GTK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Withdrawal history ── */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Withdrawal History</h3>
        </div>
        {loading ? (
          <div className="px-6 py-6 space-y-3 animate-pulse">{[1,2].map(i=><div key={i} className="h-4 bg-gray-100 rounded w-full"/>)}</div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No withdrawals yet. Submit your first request above.</p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Your withdrawal history</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Date","Tokens","Amount","Method","Account","Status"].map(h=>(
                  <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map(r=>(
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900">{r.tokens_amount.toLocaleString()} GTK</td>
                  <td className="px-4 py-3.5 font-semibold text-primary-600">
                    {r.currency === "KES" ? "KES" : "$"} {r.cash_amount.toLocaleString("en",{minimumFractionDigits:2})}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 capitalize">
                    {r.method === "mpesa" ? "M-Pesa" : "Bank"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{r.account_name}</td>
                  <td className="px-4 py-3.5">
                    <Badge color={
                      r.status === "completed"  ? "green" :
                      r.status === "failed"     ? "red"   :
                      r.status === "canceled"   ? "gray"  :
                      r.status === "processing" ? "blue"  : "amber"
                    } dot>
                      {r.status === "completed" ? "Paid" :
                       r.status === "canceled"  ? "Rejected" :
                       r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Badge>
                    {(r.status === "failed" || r.status === "canceled") && r.failure_reason && (
                      <p className="text-xs text-red-500 mt-0.5 max-w-[160px] truncate" title={r.failure_reason}>
                        {r.failure_reason}
                      </p>
                    )}
                    {r.status === "completed" && r.processed_at && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(r.processed_at).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Success modal ── */}
      <Modal
        open={success}
        onClose={() => setSuccess(false)}
        title="Withdrawal Submitted!"
        icon={
          <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        }
        description="Your withdrawal request has been received. Payment will be processed within 1–3 business days. Your tokens have been deducted."
      >
        <Button variant="primary" size="md" fullWidth onClick={() => setSuccess(false)}>Close</Button>
      </Modal>
    </AppLayout>
  );
}
