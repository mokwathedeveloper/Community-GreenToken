"use client";

// Rules: R-FE-01, R-FE-02, R-COMP-02 (Button), R-A11Y-01, R-A11Y-03, R-FE-05
// Spec: ux_ui/feature_specv2/action_submission_page_md.md
// Mockup: mockup/action_submission_page_mockup.png

import type { Metadata } from "next";
import { useState, useRef, type FormEvent } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const ACTION_TYPES = [
  { value: "Recycling",          label: "♻️  Recycling" },
  { value: "TreePlanting",       label: "🌳  Tree Planting" },
  { value: "Carpooling",         label: "🚗  Carpooling" },
  { value: "EnergySaving",       label: "⚡  Energy Saving" },
  { value: "WaterSaving",        label: "💧  Water Saving" },
  { value: "CommunityCleanup",   label: "🤝  Community Cleanup" },
  { value: "CompostingOrganics", label: "🌱  Composting" },
  { value: "PublicTransport",    label: "🚌  Public Transport" },
  { value: "SolarEnergyUse",     label: "☀️  Solar Energy" },
  { value: "BeachCleanup",       label: "🏖️  Beach Cleanup" },
];

const VERIFICATION_STEPS = [
  { icon: "📸", title: "Upload Evidence",   desc: "Provide details and proof of your eco-action to verify and justify the reward." },
  { icon: "🔍", title: "Admin Review",      desc: "Your submission is reviewed by an organization admin." },
  { icon: "⛓️", title: "Blockchain Record", desc: "Verified actions are recorded on the Stellar blockchain immutably." },
  { icon: "🪙", title: "Earn GreenTokens", desc: "After verification, GTK tokens are minted to your Stellar wallet." },
];

// Mock recent actions
const RECENT = [
  { type: "Recycling",    desc: "Collected recycled materials", date: "2026-05-19 14:22", status: "verified"  as const, tokens: 10 },
  { type: "TreePlanting", desc: "Planted 2 trees in the park",  date: "2026-05-18 09:14", status: "pending"   as const, tokens: 0  },
];

export default function ActionSubmissionPage() {
  const [actionType,   setActionType]   = useState("");
  const [description,  setDescription]  = useState("");
  const [evidence,     setEvidence]     = useState<File | null>(null);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // SHA-256 hash of evidence file — Rule: evidence hash on-chain
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
    if (!actionType)   { setError("Please select an action type."); return; }
    if (!description.trim()) { setError("Please describe your action."); return; }
    if (!evidence)     { setError("Please upload photo evidence."); return; }
    setLoading(true); setError(null);
    try {
      // Phase 2: POST /api/actions/submit with { actionType, description, evidenceHash }
      await new Promise((r) => setTimeout(r, 1000));
      setSuccess(true);
      setActionType(""); setDescription(""); setEvidence(null); setEvidenceHash(null);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Submit Action">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Submit Action</h2>
        <p className="text-sm text-gray-500 mt-1">Record your sustainable actions and get verified. Every verified action earns you GreenTokens.</p>
      </div>

      {/* Top stats — R-COMP-01 pattern */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Actions Submitted", value: "128", change: "+12 this week" },
          { label: "Impact Points",     value: "2,450" },
          { label: "Impact Points",     value: "45" },
        ].map(({ label, value, change }, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            {change && <p className="text-xs text-primary-600 mt-0.5">{change}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Form — R-A11Y-03: all inputs have labels */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs text-gray-400 mb-4">This action will be independently reviewed. All verified actions contribute to a greener community and earn you GreenTokens.</p>

          {error && (
            <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              <span aria-hidden="true">⚠</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Select
              id="action-type"
              label="Action Type"
              options={[{ value: "", label: "Select an action type..." }, ...ACTION_TYPES]}
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              required
            />

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
                maxLength={200}
                required
                className={cn(
                  "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                )}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{description.length}/200</p>
            </div>

            {/* Evidence upload */}
            <div>
              <label htmlFor="action-evidence" className="block text-sm font-medium text-gray-700 mb-1.5">
                Photo Evidence <span className="text-gray-400 font-normal">(required)</span>
              </label>
              <input
                ref={fileRef}
                id="action-evidence"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              />
              {evidenceHash && (
                <p className="text-xs text-gray-400 mt-1.5 font-mono truncate">
                  SHA-256: {evidenceHash.slice(0, 16)}…{evidenceHash.slice(-8)}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<span>🌿</span>}>
              Submit Action
            </Button>
          </form>
        </div>

        {/* Right panel — how verification works */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">How Action Verification Works</h3>
            <div className="space-y-3">
              {VERIFICATION_STEPS.map(({ icon, title, desc }, i) => (
                <div key={title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-sm flex-shrink-0" aria-hidden="true">{icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{i + 1}. {title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Leaderboard Preview</p>
            <p className="text-xs text-gray-400">This section will appear after you submit your first action and scores are calculated.</p>
          </div>
        </div>
      </div>

      {/* Recent actions */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Recent Actions</h3>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">Your recent submitted actions</caption>
          <thead className="bg-gray-50">
            <tr>
              {["Type", "Description", "Date", "Status", "Tokens"].map((h) => (
                <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {RECENT.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{r.type}</td>
                <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate">{r.desc}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{r.date}</td>
                <td className="px-5 py-3.5">
                  <Badge color={r.status === "verified" ? "green" : "amber"} dot>{r.status}</Badge>
                </td>
                <td className="px-5 py-3.5 font-semibold text-primary-600">{r.tokens > 0 ? `+${r.tokens} GTK` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Success modal — R-A11Y-06 focus trap */}
      <Modal
        open={success}
        onClose={() => setSuccess(false)}
        title="Action Submitted Successfully!"
        icon={<span className="text-3xl">✅</span>}
        iconColor="text-primary-500"
        description="Your eco-action has been submitted and is awaiting admin verification. You'll earn GTK tokens once approved!"
      >
        <Button variant="primary" size="md" fullWidth onClick={() => setSuccess(false)}>
          Close
        </Button>
      </Modal>
    </AppLayout>
  );
}
