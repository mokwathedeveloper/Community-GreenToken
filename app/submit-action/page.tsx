"use client";

// Rules: R-FE-01, R-FE-02, R-COMP-02, R-A11Y-01, R-A11Y-03, R-FE-05
// Spec: ux_ui/feature_specv2/action_submission_page.md
// Mockup: mockup/action_submission_page_mockup.png

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

const ACTION_TYPES = [
  "Recycling", "Tree Planting", "Carpooling", "Energy Saving",
  "Water Saving", "Community Cleanup", "Composting", "Public Transport",
  "Solar Energy Use", "Beach Cleanup",
];

const VERIFICATION_STEPS = [
  { title: "Submit Action",           desc: "Provide details, proof, and timestamp of your eco-action." },
  { title: "Community Verification",  desc: "Members review your submissions for accuracy and legitimacy." },
  { title: "Blockchain Proof",        desc: "Verified actions are recorded immutably on the Stellar network." },
  { title: "Earn Rewards",            desc: "Receive GreenTokens for every verified sustainable action." },
];

interface RecentAction {
  action_type:     string;
  description:     string;
  submitted_at:    string;
  status:          "pending" | "verified" | "rejected";
  tokens_awarded:  number;
  stellar_tx_hash: string | null;
}

export default function ActionSubmissionPage() {
  const { isLoading: authLoading } = useUser();

  const [actionType,    setActionType]    = useState("");
  const [description,   setDescription]   = useState("");
  const [evidence,      setEvidence]      = useState<File | null>(null);
  const [evidenceHash,  setEvidenceHash]  = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [now,           setNow]           = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Live stats
  const [actionsCount,  setActionsCount]  = useState<number | null>(null);
  const [tokensEarned,  setTokensEarned]  = useState<number | null>(null);
  const [pendingCount,  setPendingCount]  = useState<number | null>(null);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [statsLoading,  setStatsLoading]  = useState(true);

  // Live timestamp
  useEffect(() => {
    setNow(new Date().toISOString().slice(0, 19).replace("T", "T"));
    const t = setInterval(() => setNow(new Date().toISOString().slice(0, 19)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      fetch("/api/actions").then((r) => r.json()),
      fetch("/api/tokens/balance").then((r) => r.json()),
    ]).then(([actRes, balRes]) => {
      const all = actRes.data ?? [];
      setActionsCount(all.length);
      setPendingCount(all.filter((a: RecentAction) => a.status === "pending").length);
      setRecentActions(all.slice(0, 5));
      setTokensEarned(balRes.data?.totalEarned ?? 0);
    }).catch(() => {}).finally(() => setStatsLoading(false));
  }, [authLoading, success]);

  async function hashFile(file: File): Promise<string> {
    const buf  = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEvidence(file);
    if (file) setEvidenceHash(await hashFile(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!actionType)         { setError("Please select an action type."); return; }
    if (!description.trim()) { setError("Please describe your action."); return; }
    if (!evidence)           { setError("Please upload photo evidence."); return; }
    if (!evidenceHash)       { setError("Evidence hash not ready. Please re-upload."); return; }

    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/actions/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ actionType, description: description.trim(), evidenceHash }),
      });
      const json = await res.json();
      if (!res.ok) {
        const err = json.error;
        if (res.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (err?.code === "NO_ORGANIZATION") {
          setError("You need to create your organization first.");
          setTimeout(() => { window.location.href = "/org/setup"; }, 2500);
        } else {
          setError(err?.message ?? "Submission failed. Please try again.");
        }
        return;
      }
      setSuccess(true);
      setActionType(""); setDescription(""); setEvidence(null); setEvidenceHash(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Submit Action">

      {/* ── Page heading ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-lg flex-shrink-0" aria-hidden="true">🌿</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submit Action</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Record your sustainable actions. Every verified action contributes to a greener community and earns you GreenTokens.
          </p>
        </div>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Actions Submitted */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center text-xl flex-shrink-0" aria-hidden="true">✅</div>
          <div>
            <p className={cn("text-2xl font-bold text-gray-900", statsLoading && "animate-pulse")}>
              {statsLoading ? "—" : actionsCount ?? 0}
            </p>
            <p className="text-xs text-gray-500">Actions Submitted</p>
            {!statsLoading && pendingCount !== null && pendingCount > 0 && (
              <p className="text-xs text-amber-500 mt-0.5">{pendingCount} pending review</p>
            )}
          </div>
        </div>

        {/* Total Tokens */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center text-xl flex-shrink-0" aria-hidden="true">🪙</div>
          <div>
            <p className={cn("text-2xl font-bold text-gray-900", statsLoading && "animate-pulse")}>
              {statsLoading ? "—" : (tokensEarned ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Tokens</p>
            <p className="text-xs text-primary-600 mt-0.5">GTK earned</p>
          </div>
        </div>

        {/* Impact Points */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-xl flex-shrink-0" aria-hidden="true">⭐</div>
          <div>
            <p className={cn("text-2xl font-bold text-gray-900", statsLoading && "animate-pulse")}>
              {statsLoading ? "—" : Math.floor((actionsCount ?? 0) * 1.5)}
            </p>
            <p className="text-xs text-gray-500">Impact Points</p>
            <p className="text-xs text-primary-600 mt-0.5">+{Math.floor((actionsCount ?? 0) * 0.1)} this week</p>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

        {/* ── LEFT: Action Form (3/5) ── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-6">

          {/* Card header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary-500 text-base" aria-hidden="true">📋</span>
            <h3 className="text-sm font-bold text-gray-900">Action Form</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Fill in the details of your sustainable action below. This action will be independently reviewed.
          </p>

          {/* Error banners */}
          {error && error.includes("session") && (
            <div role="alert" className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
              <span aria-hidden="true">⚠️</span>
              <div>
                <p className="font-semibold">Session expired</p>
                <p className="text-xs mt-0.5">{error}</p>
                <Link href="/signin" className="text-primary-600 font-semibold text-xs hover:underline mt-1 inline-block">Sign In Again →</Link>
              </div>
            </div>
          )}
          {error && !error.includes("session") && (
            <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              <span aria-hidden="true">⚠</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Action Type */}
            <div>
              <label htmlFor="action-type" className="block text-sm font-medium text-gray-700 mb-1.5">
                Action Type
              </label>
              <select
                id="action-type"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none"
              >
                <option value="">Select an action type...</option>
                {ACTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="action-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="action-description"
                placeholder="Submit recycled materials"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{description.length} / 500</p>
            </div>

            {/* Timestamp — readonly display, matches mockup */}
            <div>
              <label htmlFor="action-timestamp" className="block text-sm font-medium text-gray-700 mb-1.5">
                Timestamp
              </label>
              <input
                id="action-timestamp"
                type="text"
                value={now}
                readOnly
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-default focus:outline-none font-mono"
              />
            </div>

            {/* Evidence upload */}
            <div>
              <label htmlFor="action-evidence" className="block text-sm font-medium text-gray-700 mb-1.5">
                Photo Evidence <span className="text-gray-400 font-normal text-xs">(required)</span>
              </label>
              <input
                ref={fileRef}
                id="action-evidence"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              />
              {evidenceHash && (
                <p className="text-xs text-gray-400 mt-1.5 font-mono truncate">
                  SHA-256: {evidenceHash.slice(0, 16)}…{evidenceHash.slice(-8)}
                </p>
              )}
            </div>

            {/* Info note — matches mockup */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <span className="text-blue-400 text-sm mt-0.5" aria-hidden="true">ℹ️</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                Please ensure all details are accurate. Actions are verified before tokens are awarded.
              </p>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Submit Action
            </Button>
          </form>
        </div>

        {/* ── RIGHT: Verification steps + Loading Preview (2/5) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* How Action Verification Works — dark green card (matches mockup) */}
          <div className="bg-primary-600 rounded-xl p-6 text-white">
            <h3 className="text-sm font-bold text-white mb-1">How Action Verification Works</h3>
            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              We use a transparent, community-driven process to verify every eco-action and ensure impactful contributions.
            </p>
            <div className="space-y-4">
              {VERIFICATION_STEPS.map(({ title, desc }, i) => (
                <div key={title} className="flex gap-3">
                  {/* Green numbered circle */}
                  <div
                    className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    aria-hidden="true">
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

          {/* Loading Preview card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Loading Preview</p>
            {actionType || description ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Type:</span>
                  <Badge color="green">{actionType || "—"}</Badge>
                </div>
                {description && (
                  <div>
                    <span className="text-xs text-gray-500">Description:</span>
                    <p className="text-xs text-gray-700 mt-0.5 line-clamp-2">{description}</p>
                  </div>
                )}
                {evidence && (
                  <div className="flex items-center gap-1.5 text-xs text-primary-600">
                    <span>📎</span>
                    <span className="truncate max-w-[160px]">{evidence.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3">This section will appear with your action preview as you fill the form.</p>
          </div>
        </div>
      </div>

      {/* ── Recent Actions table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Actions</h3>
          <Link href="/dashboard" className="text-xs text-primary-600 hover:underline font-medium">View All →</Link>
        </div>
        {statsLoading ? (
          <div className="px-6 py-6 space-y-3 animate-pulse">
            {[1,2,3].map((i) => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
          </div>
        ) : recentActions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No actions yet. Submit your first eco-action above!
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Your recent submitted actions</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Date","Type","Description","Status","Tokens","⛓️ Blockchain Proof"].map((h) => (
                  <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActions.map((r, i) => (
                <tr key={i} className={cn("hover:bg-gray-50 transition-colors", r.status === "verified" && "bg-primary-50/20")}>
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono whitespace-nowrap">
                    {r.submitted_at?.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{r.action_type}</td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-[160px] truncate">{r.description}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={r.status === "verified" ? "green" : r.status === "rejected" ? "red" : "amber"} dot>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-primary-600">
                    {r.tokens_awarded > 0 ? `+${r.tokens_awarded} GTK` : "—"}
                  </td>
                  {/* Stellar blockchain proof — shows tx hash after admin verifies */}
                  <td className="px-5 py-3.5">
                    {r.stellar_tx_hash ? (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${r.stellar_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-mono"
                        title="View on Stellar Explorer">
                        ⛓️ {r.stellar_tx_hash.slice(0,10)}…
                      </a>
                    ) : r.status === "verified" ? (
                      <span className="text-xs text-gray-400 italic">pending tx…</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Success Modal — large green ✓, matches mockup ── */}
      <Modal
        open={success}
        onClose={() => setSuccess(false)}
        title="Action submitted successfully!"
        icon={
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        }
        description="Thank you for contributing to a cleaner, greener community! Your action is under review and you'll earn GTK tokens once approved."
      >
        <Button variant="primary" size="md" fullWidth onClick={() => setSuccess(false)}>
          Close
        </Button>
      </Modal>
    </AppLayout>
  );
}
