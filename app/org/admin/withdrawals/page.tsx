"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useUser } from "@/hooks/useUser";
import { MCoin, MCheckCircle, MWarning, MAccessTime, MAttachMoney, MPhoneAndroid, MCreditCard, MPerson } from "@/components/icons";
import { cn } from "@/lib/utils";

type WithdrawalRow = {
  id:                string;
  user_id:           string;
  tokens_amount:     number;
  cash_amount:       number;
  currency:          string;
  method:            string;
  account_name:      string;
  account_number:    string;
  bank_name:         string | null;
  status:            "pending" | "processing" | "completed" | "failed" | "canceled";
  failure_reason:    string | null;
  payment_provider:  string | null;
  payment_reference: string | null;
  processed_at:      string | null;
  admin_note:        string | null;
  created_at:        string;
  member:            { display_name: string | null; email: string | null } | null;
};

type Meta = {
  mpesa_available:  boolean;
  stripe_available: boolean;
};

type ApproveForm = {
  paymentProvider: "mpesa" | "stripe" | "manual";
  adminNote: string;
};

const STATUS_COLOR: Record<string, "amber" | "blue" | "green" | "red" | "gray"> = {
  pending:    "amber",
  processing: "blue",
  completed:  "green",
  failed:     "red",
  canceled:   "gray",
};

const STATUS_LABEL: Record<string, string> = {
  pending:    "Pending",
  processing: "Processing",
  completed:  "Paid",
  failed:     "Failed",
  canceled:   "Canceled",
};

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const { orgName, isOrgAdmin, isLoading: userLoading } = useUser();

  const [rows,         setRows]         = useState<WithdrawalRow[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ mpesa_available: false, stripe_available: false });
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [errMsg,       setErrMsg]       = useState<string | null>(null);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<WithdrawalRow | null>(null);
  const [approveForm,   setApproveForm]   = useState<ApproveForm>({ paymentProvider: "manual", adminNote: "" });
  const [approving,     setApproving]     = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting,    setRejecting]    = useState(false);

  useEffect(() => {
    if (!userLoading && !isOrgAdmin) router.replace("/dashboard");
  }, [userLoading, isOrgAdmin, router]);

  const loadWithdrawals = useCallback(async () => {
    if (!isOrgAdmin) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : "";
      const res  = await fetch(`/api/admin/withdrawals?limit=50${statusParam}`);
      const json = await res.json();
      setRows(json.data ?? []);
      setTotal(json.pagination?.total ?? 0);
      if (json.meta) setMeta(json.meta);
    } catch { setErrMsg("Failed to load withdrawals."); }
    finally  { setLoading(false); }
  }, [isOrgAdmin, filterStatus]);

  useEffect(() => {
    if (!userLoading && isOrgAdmin) loadWithdrawals();
  }, [userLoading, isOrgAdmin, loadWithdrawals]);

  // Open approve modal with sensible provider default
  function openApprove(row: WithdrawalRow) {
    let defaultProvider: "mpesa" | "stripe" | "manual" = "manual";
    if (row.method === "mpesa" && row.currency === "KES" && meta.mpesa_available) defaultProvider = "mpesa";
    else if (row.method === "bank_transfer" && row.currency === "USD" && meta.stripe_available) defaultProvider = "stripe";
    setApproveForm({ paymentProvider: defaultProvider, adminNote: "" });
    setApproveTarget(row);
    setErrMsg(null);
  }

  async function handleApprove() {
    if (!approveTarget) return;
    setApproving(true); setErrMsg(null);
    try {
      const res = await fetch(`/api/admin/withdrawals/${approveTarget.id}/approve`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(approveForm),
      });
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error?.message ?? "Approval failed."); return; }
      setSuccessMsg(json.data?.message ?? "Withdrawal approved.");
      setApproveTarget(null);
      await loadWithdrawals();
    } finally { setApproving(false); }
  }

  async function handleReject() {
    if (!rejectTarget || rejectReason.trim().length < 5) {
      setErrMsg("Please enter a rejection reason (at least 5 characters).");
      return;
    }
    setRejecting(true); setErrMsg(null);
    try {
      const res = await fetch(`/api/admin/withdrawals/${rejectTarget.id}/reject`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reason: rejectReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error?.message ?? "Rejection failed."); return; }
      setSuccessMsg(`Withdrawal rejected. ${json.data?.tokensRefunded} GTK refunded to member.`);
      setRejectTarget(null); setRejectReason("");
      await loadWithdrawals();
    } finally { setRejecting(false); }
  }

  const memberName  = (r: WithdrawalRow) => r.member?.display_name ?? r.member?.email?.split("@")[0] ?? r.account_name;
  const memberEmail = (r: WithdrawalRow) => r.member?.email ?? null;

  const pendingCount = rows.filter(r => r.status === "pending").length;

  if (userLoading) return null;

  return (
    <OrgAdminLayout orgName={orgName ?? undefined} plan="Pro Plan">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Approve and pay member token withdrawals via M-Pesa, Stripe, or manually.
          </p>
        </div>
        {/* Provider availability indicators */}
        <div className="flex items-center gap-2 text-xs">
          <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold",
            meta.mpesa_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
            <MPhoneAndroid className="w-3 h-3" />
            M-Pesa {meta.mpesa_available ? "Ready" : "Not configured"}
          </span>
          <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold",
            meta.stripe_available ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}>
            <MCreditCard className="w-3 h-3" />
            Stripe {meta.stripe_available ? "Ready" : "Not configured"}
          </span>
        </div>
      </div>

      {/* Feedback */}
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
          { label: "Total Requests", value: total,                                          color: "text-gray-700"    },
          { label: "Pending",        value: rows.filter(r=>r.status==="pending").length,    color: "text-amber-600"   },
          { label: "Processing",     value: rows.filter(r=>r.status==="processing").length, color: "text-blue-600"    },
          { label: "Paid",           value: rows.filter(r=>r.status==="completed").length,  color: "text-green-600"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={cn("text-2xl font-bold", color)}>{loading ? "…" : value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 font-medium">Filter:</span>
        {(["", "pending", "processing", "completed", "failed", "canceled"] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
              filterStatus === s
                ? "bg-primary-600 text-white border-primary-600"
                : "border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
            )}>
            {s === "" ? "All" : STATUS_LABEL[s] ?? s}
            {s === "pending" && pendingCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 text-[10px]">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Withdrawal Queue</h2>
          <span className="text-xs text-gray-400">{total} total</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading withdrawals…</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <MAccessTime className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              {filterStatus === "pending" ? "No pending withdrawals" : "No withdrawal requests yet"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Member withdrawal requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Member withdrawal requests</caption>
              <thead className="bg-gray-50">
                <tr>
                  {["Member", "Amount", "Payment method", "Requested", "Status", "Actions"].map(h => (
                    <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {/* Member */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-600">
                            {memberName(row).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{memberName(row)}</p>
                          {memberEmail(row) && (
                            <a href={`mailto:${memberEmail(row)}`} className="text-xs text-primary-500 hover:underline">{memberEmail(row)}</a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">
                        {row.currency === "KES" ? `KES ${row.cash_amount.toLocaleString()}` : `$${row.cash_amount.toFixed(2)}`}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                        <MCoin className="w-3 h-3 text-amber-400" />{row.tokens_amount.toLocaleString()} GTK
                      </p>
                    </td>

                    {/* Payment method */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {row.method === "mpesa"
                          ? <MPhoneAndroid className="w-4 h-4 text-green-500" />
                          : <MAttachMoney  className="w-4 h-4 text-blue-500"  />
                        }
                        <div>
                          <p className="text-xs font-medium text-gray-700 capitalize">
                            {row.method === "mpesa" ? "M-Pesa" : "Bank Transfer"}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{row.account_number}</p>
                          {row.bank_name && <p className="text-xs text-gray-400">{row.bank_name}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge color={STATUS_COLOR[row.status] ?? "gray"} dot>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </Badge>
                      {row.payment_provider && (
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">via {row.payment_provider}</p>
                      )}
                      {row.failure_reason && (
                        <p className="text-xs text-red-500 mt-0.5">{row.failure_reason}</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {row.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <Button variant="primary" size="xs"
                            onClick={() => openApprove(row)}
                            icon={<MCheckCircle className="w-3.5 h-3.5" />}>
                            Approve & Pay
                          </Button>
                          <Button variant="danger" size="xs"
                            onClick={() => { setRejectTarget(row); setRejectReason(""); setErrMsg(null); }}>
                            Reject
                          </Button>
                        </div>
                      ) : row.status === "processing" ? (
                        <span className="text-xs text-blue-600 font-semibold">Awaiting confirmation…</span>
                      ) : row.status === "completed" ? (
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <MCheckCircle className="w-3.5 h-3.5" /> Paid
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

      {/* ── Approve & Pay Modal ────────────────────────────────────────────────── */}
      <Modal
        open={!!approveTarget}
        onClose={() => { setApproveTarget(null); setErrMsg(null); }}
        title="Approve & Pay Withdrawal"
        icon={<MAttachMoney className="w-6 h-6 text-primary-600" />}
        size="md"
      >
        {approveTarget && (
          <div className="space-y-4 mt-1">
            {errMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{errMsg}</div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Member</span>
                <span className="font-semibold text-gray-900">{memberName(approveTarget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">
                  {approveTarget.currency === "KES"
                    ? `KES ${approveTarget.cash_amount.toLocaleString()}`
                    : `$${approveTarget.cash_amount.toFixed(2)} USD`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GTK Deducted</span>
                <span className="font-semibold text-gray-900">{approveTarget.tokens_amount.toLocaleString()} GTK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Send to</span>
                <span className="font-mono text-gray-900">{approveTarget.account_number}</span>
              </div>
            </div>

            {/* Payment provider selection */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Payment Method</p>
              <div className="space-y-2">
                {/* M-Pesa */}
                {approveTarget.currency === "KES" && (
                  <label className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors",
                    approveForm.paymentProvider === "mpesa" ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200",
                    !meta.mpesa_available && "opacity-50 cursor-not-allowed"
                  )}>
                    <input type="radio" name="provider" value="mpesa" disabled={!meta.mpesa_available}
                      checked={approveForm.paymentProvider === "mpesa"}
                      onChange={() => setApproveForm(f => ({ ...f, paymentProvider: "mpesa" }))}
                      className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MPhoneAndroid className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-900">M-Pesa B2C</span>
                        {meta.mpesa_available
                          ? <Badge color="green">Configured</Badge>
                          : <Badge color="gray">Not configured</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {meta.mpesa_available
                          ? "Automatically sends KES to member's M-Pesa number via Daraja API."
                          : "Add MPESA_* environment variables to enable."}
                      </p>
                    </div>
                  </label>
                )}

                {/* Stripe */}
                {approveTarget.currency === "USD" && (
                  <label className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors",
                    approveForm.paymentProvider === "stripe" ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200",
                    !meta.stripe_available && "opacity-50 cursor-not-allowed"
                  )}>
                    <input type="radio" name="provider" value="stripe" disabled={!meta.stripe_available}
                      checked={approveForm.paymentProvider === "stripe"}
                      onChange={() => setApproveForm(f => ({ ...f, paymentProvider: "stripe" }))}
                      className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MCreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">Stripe Payout</span>
                        {meta.stripe_available
                          ? <Badge color="blue">Configured</Badge>
                          : <Badge color="gray">Not configured</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {meta.stripe_available
                          ? "Creates a Stripe payout from your Stripe balance. Monitor in Stripe Dashboard."
                          : "Add STRIPE_SECRET_KEY environment variable to enable."}
                      </p>
                    </div>
                  </label>
                )}

                {/* Manual */}
                <label className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors",
                  approveForm.paymentProvider === "manual" ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200"
                )}>
                  <input type="radio" name="provider" value="manual"
                    checked={approveForm.paymentProvider === "manual"}
                    onChange={() => setApproveForm(f => ({ ...f, paymentProvider: "manual" }))}
                    className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MPerson className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">Mark as Manually Paid</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      You've already sent the payment outside this system. This marks the request as completed.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Admin note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="admin-note">
                Admin note <span className="text-gray-400 font-normal">(optional — visible to you only)</span>
              </label>
              <input id="admin-note" type="text" maxLength={200}
                value={approveForm.adminNote}
                onChange={e => setApproveForm(f => ({ ...f, adminNote: e.target.value }))}
                placeholder="e.g. Sent via M-Pesa at 14:30"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="md" fullWidth onClick={() => { setApproveTarget(null); setErrMsg(null); }}>Cancel</Button>
              <Button variant="primary" size="md" fullWidth loading={approving} onClick={handleApprove}>
                {approveForm.paymentProvider === "mpesa"  ? "Send via M-Pesa" :
                 approveForm.paymentProvider === "stripe" ? "Create Stripe Payout" :
                                                            "Mark as Paid"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject Modal ───────────────────────────────────────────────────────── */}
      <Modal
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(""); setErrMsg(null); }}
        title="Reject Withdrawal"
        icon={<MWarning className="w-6 h-6 text-red-500" />}
        size="sm"
      >
        {rejectTarget && (
          <div className="space-y-4 mt-1">
            {errMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{errMsg}</div>
            )}
            <p className="text-sm text-gray-600">
              Rejecting <strong>{memberName(rejectTarget)}</strong>'s withdrawal of{" "}
              <strong>{rejectTarget.tokens_amount.toLocaleString()} GTK</strong>.
              Their tokens will be <strong>refunded immediately</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="reject-reason">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea id="reject-reason" rows={3} maxLength={200}
                value={rejectReason}
                onChange={e => { setRejectReason(e.target.value); setErrMsg(null); }}
                placeholder="e.g. Invalid account number, please resubmit with correct details."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              <p className="text-xs text-gray-400 mt-0.5">{rejectReason.length}/200</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="md" fullWidth onClick={() => { setRejectTarget(null); setRejectReason(""); setErrMsg(null); }}>Cancel</Button>
              <Button variant="danger" size="md" fullWidth loading={rejecting} onClick={handleReject}>
                Reject & Refund Tokens
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </OrgAdminLayout>
  );
}
