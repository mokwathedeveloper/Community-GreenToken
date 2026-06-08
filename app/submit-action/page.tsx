"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import {
  MLeaf, MCheckCircle, MCoin, MWarning, MInfo,
  MAttachFile, MUpload, MLink, MBolt, MShield, MLocationPin,
} from "@/components/icons";
import { extractExif, type ExifResult } from "@/lib/exif/parser";

const ACTION_TYPES: { value: string; label: string; emoji: string }[] = [
  { value: "Recycling",          label: "Recycling",           emoji: "♻️" },
  { value: "TreePlanting",       label: "Tree Planting",       emoji: "🌳" },
  { value: "Carpooling",         label: "Carpooling",          emoji: "🚗" },
  { value: "EnergySaving",       label: "Energy Saving",       emoji: "⚡" },
  { value: "WaterSaving",        label: "Water Saving",        emoji: "💧" },
  { value: "CommunityCleanup",   label: "Community Cleanup",   emoji: "🧹" },
  { value: "CompostingOrganics", label: "Composting",          emoji: "🌿" },
  { value: "PublicTransport",    label: "Public Transport",    emoji: "🚌" },
  { value: "SolarEnergyUse",     label: "Solar Energy Use",    emoji: "☀️" },
  { value: "BeachCleanup",       label: "Beach Cleanup",       emoji: "🏖️" },
];

// Context-sensitive description hints per action type
const ACTION_PLACEHOLDERS: Record<string, string> = {
  Recycling:          "e.g. Sorted 5 kg of plastic and paper at the municipal recycling centre",
  TreePlanting:       "e.g. Planted 3 native saplings at the community park",
  Carpooling:         "e.g. Shared a 20 km commute with 2 colleagues instead of driving alone",
  EnergySaving:       "e.g. Switched off all appliances overnight, saving approximately 2 kWh",
  WaterSaving:        "e.g. Fixed a leaking tap and reduced shower time from 15 to 5 minutes",
  CommunityCleanup:   "e.g. Collected 3 bags of litter along River Road during the Saturday event",
  CompostingOrganics: "e.g. Added kitchen waste to the backyard compost bin every day this week",
  PublicTransport:    "e.g. Took the bus instead of a personal car for the 15 km commute",
  SolarEnergyUse:     "e.g. Charged all devices using rooftop solar panels throughout the day",
  BeachCleanup:       "e.g. Removed 2 kg of plastic waste from Diani beach shoreline",
};

const VERIFICATION_STEPS = [
  { title: "Submit Action",          desc: "Provide details, proof, and timestamp of your eco-action." },
  { title: "Community Verification", desc: "Members review your submissions for accuracy and legitimacy." },
  { title: "Blockchain Proof",       desc: "Verified actions are recorded immutably on the Stellar network." },
  { title: "Earn Rewards",           desc: "Receive GreenTokens for every verified sustainable action." },
];

interface RecentAction {
  id:              string;
  action_type:     string;
  description:     string;
  submitted_at:    string;
  status:          "pending" | "verified" | "rejected";
  tokens_awarded:  number;
  stellar_tx_hash: string | null;
}

export default function ActionSubmissionPage() {
  const { isLoading: authLoading } = useUser();

  const [actionType,   setActionType]   = useState("");
  const [description,  setDescription]  = useState("");
  const [evidence,     setEvidence]     = useState<File | null>(null);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);
  const [exifData,     setExifData]     = useState<ExifResult | null>(null);
  const [exifLoading,  setExifLoading]  = useState(false);
  const [dragOver,     setDragOver]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [now,          setNow]          = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Stats
  const [actionsCount,   setActionsCount]   = useState<number | null>(null);
  const [tokensEarned,   setTokensEarned]   = useState<number | null>(null);
  const [verifiedCount,  setVerifiedCount]  = useState<number | null>(null);
  const [pendingCount,   setPendingCount]   = useState<number | null>(null);
  const [weeklyVerified, setWeeklyVerified] = useState<number>(0);
  const [recentActions,  setRecentActions]  = useState<RecentAction[]>([]);
  const [statsLoading,   setStatsLoading]   = useState(true);

  // Live timestamp — updates every second
  useEffect(() => {
    const fmt = () => new Date().toISOString().slice(0, 19).replace("T", " ");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      fetch("/api/actions?limit=50").then(r => r.json()),
      fetch("/api/tokens/balance").then(r => r.json()),
    ]).then(([actRes, balRes]) => {
      const all: RecentAction[] = actRes.data ?? [];
      const verified  = all.filter(a => a.status === "verified");
      const pending   = all.filter(a => a.status === "pending");
      const weekAgo   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const wVerified = verified.filter(a => a.submitted_at >= weekAgo).length;
      setActionsCount(all.length);
      setVerifiedCount(verified.length);
      setPendingCount(pending.length);
      setWeeklyVerified(wVerified);
      setRecentActions(all.slice(0, 5));
      setTokensEarned(balRes.data?.totalEarned ?? 0);
    }).catch(() => {}).finally(() => setStatsLoading(false));
  }, [authLoading, success]);

  async function hashFile(file: File): Promise<string> {
    const buf  = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function handleFileSelected(file: File) {
    setEvidence(file);
    setExifData(null);
    setExifLoading(true);
    try {
      const [hash, exif] = await Promise.all([hashFile(file), extractExif(file)]);
      setEvidenceHash(hash);
      setExifData(exif);
    } finally {
      setExifLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) await handleFileSelected(file);
  }

  function clearFile() {
    setEvidence(null);
    setEvidenceHash(null);
    setExifData(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!actionType)        { setError("Please select an action type."); return; }
    if (!description.trim()){ setError("Please describe your action."); return; }
    if (!evidence)          { setError("Please upload photo evidence."); return; }

    // Block submission if photo has no EXIF — member must use a fresh camera photo
    if (exifData && !exifData.present) {
      setError("Your photo has no GPS or timestamp data. Please take a fresh photo directly from your camera app with location enabled.");
      return;
    }

    // 4 MB client-side guard (Vercel serverless payload limit)
    if (evidence.size > 4 * 1024 * 1024) {
      setError("Photo is too large. Please use a photo under 4 MB.");
      return;
    }

    setLoading(true); setError(null);
    try {
      // Send the actual image file — server extracts EXIF independently (GPS cannot be spoofed)
      const form = new FormData();
      form.append("actionType",   actionType);
      form.append("description",  description.trim());
      form.append("evidence",     evidence, evidence.name);

      const res  = await fetch("/api/actions/submit", {
        method: "POST",
        body:   form,   // no Content-Type header — browser sets multipart boundary
      });
      const json = await res.json();
      if (!res.ok) {
        const err = json.error;
        if (res.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (err?.code === "NO_ORGANIZATION") {
          setError("You need to create your organization first.");
          setTimeout(() => { window.location.assign("/org/setup"); }, 2500);
        } else if (err?.code === "RATE_LIMITED") {
          setError(`Too many submissions. Please wait ${err.retryAfter ?? 60} seconds.`);
        } else if (err?.code === "DUPLICATE_EVIDENCE") {
          setError("This photo has already been submitted as evidence. Please use a different photo.");
        } else if (err?.code === "NO_EXIF_METADATA") {
          setError("Your photo has no GPS or timestamp. Please take a fresh photo from your camera app with location turned on.");
        } else if (err?.code === "EVIDENCE_TOO_OLD") {
          setError("Photo evidence is more than 30 days old. Please upload a recent photo of your action.");
        } else {
          setError(err?.message ?? "Submission failed. Please try again.");
        }
        return;
      }
      setSuccess(true);
      setActionType(""); setDescription(""); clearFile();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const selectedType  = ACTION_TYPES.find(t => t.value === actionType);
  const placeholder   = actionType ? (ACTION_PLACEHOLDERS[actionType] ?? "Describe your eco-action in detail…") : "Select an action type first, then describe what you did…";

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-KE", {
      month: "short", day: "numeric",
      hour:  "2-digit", minute: "2-digit", hour12: false,
    });
  }

  return (
    <AppLayout title="Submit Action">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0" aria-hidden>
          <MLeaf className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submit Eco-Action</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Record your sustainable actions. Every verified action earns GreenTokens.
          </p>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0" aria-hidden>
            <MCheckCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className={cn("text-2xl font-bold text-gray-900", statsLoading && "animate-pulse")}>
              {statsLoading ? "—" : actionsCount ?? 0}
            </p>
            <p className="text-xs text-gray-500">Actions Submitted</p>
            {!statsLoading && pendingCount !== null && pendingCount > 0 && (
              <p className="text-xs text-amber-500 mt-0.5">{pendingCount} awaiting review</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0" aria-hidden>
            <MCoin className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={cn("text-2xl font-bold text-gray-900", statsLoading && "animate-pulse")}>
              {statsLoading ? "—" : (tokensEarned ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">GTK Earned</p>
            <p className="text-xs text-primary-600 mt-0.5">Total tokens</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0" aria-hidden>
            <MBolt className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className={cn("text-2xl font-bold text-gray-900", statsLoading && "animate-pulse")}>
              {statsLoading ? "—" : verifiedCount ?? 0}
            </p>
            <p className="text-xs text-gray-500">Verified Actions</p>
            {!statsLoading && (
              <p className="text-xs text-primary-600 mt-0.5">
                {weeklyVerified > 0 ? `+${weeklyVerified} this week` : "Keep going!"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

        {/* LEFT: Form (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center gap-2 mb-1">
            <MLeaf className="w-4 h-4 text-primary-500" aria-hidden />
            <h3 className="text-sm font-bold text-gray-900">Action Form</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Fill in the details of your eco-action. It will be independently reviewed before tokens are awarded.
          </p>

          {/* Error alerts */}
          {error && error.includes("session") ? (
            <div role="alert" className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
              <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Session expired</p>
                <p className="text-xs mt-0.5">{error}</p>
                <Link href="/signin" className="text-primary-600 font-semibold text-xs hover:underline mt-1 inline-block">Sign In Again →</Link>
              </div>
            </div>
          ) : error ? (
            <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              <MWarning className="w-4 h-4 flex-shrink-0" aria-hidden />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss" className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Action type */}
            <div>
              <label htmlFor="action-type" className="block text-sm font-medium text-gray-700 mb-1.5">
                Action Type <span className="text-red-500">*</span>
              </label>
              <select
                id="action-type"
                value={actionType}
                onChange={e => { setActionType(e.target.value); setError(null); }}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none"
              >
                <option value="">Select an action type…</option>
                {ACTION_TYPES.map(({ value, label, emoji }) => (
                  <option key={value} value={value}>{emoji} {label}</option>
                ))}
              </select>
              {selectedType && (
                <p className="text-xs text-primary-600 mt-1.5 flex items-center gap-1">
                  <span>{selectedType.emoji}</span>
                  {selectedType.label} selected
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="action-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="action-description"
                placeholder={placeholder}
                value={description}
                onChange={e => { setDescription(e.target.value); setError(null); }}
                rows={3}
                maxLength={500}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-400">Be specific — include quantities, locations, and outcomes.</p>
                <p className={cn("text-xs ml-4 flex-shrink-0", description.length > 450 ? "text-amber-500" : "text-gray-400")}>
                  {description.length} / 500
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label htmlFor="action-timestamp" className="block text-sm font-medium text-gray-700 mb-1.5">
                Submission Time
              </label>
              <input
                id="action-timestamp"
                type="text"
                value={now}
                readOnly
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-default focus:outline-none font-mono"
                aria-label="Current UTC timestamp (auto-set)"
              />
            </div>

            {/* Evidence upload — styled drop zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Photo Evidence <span className="text-red-500">*</span>
              </label>
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload evidence photo"
                onClick={() => fileRef.current?.click()}
                onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={async e => {
                  e.preventDefault(); setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) await handleFileSelected(file);
                }}
                className={cn(
                  "w-full border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all",
                  dragOver     ? "border-primary-400 bg-primary-50"
                  : evidence   ? "border-green-300 bg-green-50/50"
                               : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                )}
              >
                {evidence ? (
                  <div className="flex items-center justify-center gap-3">
                    <MAttachFile className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{evidence.name}</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {(evidence.size / 1024).toFixed(0)} KB • SHA-256: {evidenceHash?.slice(0, 10)}…
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); clearFile(); }}
                      aria-label="Remove file"
                      className="ml-2 text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                    >✕</button>
                  </div>
                ) : (
                  <>
                    <MUpload className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden />
                    <p className="text-sm font-medium text-gray-600">Drop photo here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC — up to 4 MB</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* ── EXIF Metadata Panel ── */}
            {exifLoading && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-primary-300 animate-ping" aria-hidden />
                <p className="text-xs text-gray-400">Extracting photo metadata…</p>
              </div>
            )}

            {!exifLoading && exifData && (
              <div
                role="status"
                aria-label="Photo proof metadata"
                className={cn(
                  "rounded-xl border px-4 py-3 space-y-2",
                  exifData.present
                    ? exifData.ageWarning
                      ? "bg-amber-50 border-amber-200"
                      : "bg-primary-50 border-primary-100"
                    : "bg-red-50 border-red-300"
                )}
              >
                {exifData.present ? (
                  <>
                    <p className={cn("text-xs font-semibold flex items-center gap-1.5",
                      exifData.ageWarning ? "text-amber-700" : "text-primary-700")}>
                      <MShield className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                      {exifData.ageWarning ? "Photo metadata captured — age warning" : "Photo proof metadata captured"}
                    </p>

                    {exifData.gpsPresent && (
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-700">
                          <MLocationPin className="w-3 h-3 text-primary-500 flex-shrink-0" aria-hidden />
                          GPS: {(exifData.lat ?? 0).toFixed(5)}°,&nbsp;{(exifData.lng ?? 0).toFixed(5)}°
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${exifData.lat},${exifData.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary-600 hover:underline font-medium whitespace-nowrap"
                          aria-label="View GPS location on Google Maps">
                          View on Maps ↗
                        </a>
                      </div>
                    )}

                    {!exifData.gpsPresent && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <MWarning className="w-3 h-3 flex-shrink-0" aria-hidden />
                        GPS not embedded — location cannot be verified from photo
                      </p>
                    )}

                    {exifData.capturedAt && (
                      <p className={cn("text-xs", exifData.ageWarning ? "text-amber-700" : "text-gray-600")}>
                        Captured:{" "}
                        <span className="font-medium">
                          {exifData.capturedAt.toLocaleString("en-KE", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {exifData.ageWarning && (
                          <span className="ml-1.5 text-amber-600 font-semibold">(older than 7 days — admin will review closely)</span>
                        )}
                      </p>
                    )}

                    {exifData.device && (
                      <p className="text-xs text-gray-500">Device: {exifData.device}</p>
                    )}

                    <p className="text-[10px] text-primary-600 border-t border-primary-100 pt-1.5 mt-1">
                      SHA-256 + GPS + timestamp committed to Stellar as tamper-proof evidence.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <MWarning className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                      Photo rejected — no GPS or timestamp found
                    </p>
                    <p className="text-xs text-red-600 leading-relaxed">
                      This photo has no location or time data embedded in it. Screenshots,
                      WhatsApp-forwarded images, and edited photos are not accepted as proof.
                    </p>
                    <ul className="text-xs text-red-700 space-y-0.5 pl-3 list-disc">
                      <li>Open your camera app and take a <strong>fresh photo right now</strong></li>
                      <li>Make sure GPS / location is enabled on your device</li>
                      <li>Do not send the photo through WhatsApp or edit it before uploading</li>
                    </ul>
                    <p className="text-[10px] text-red-500 border-t border-red-200 pt-1.5 font-medium">
                      Remove this photo and upload a valid one to continue.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <MInfo className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden />
              <p className="text-xs text-blue-700 leading-relaxed">
                Ensure all details are accurate. Actions are reviewed before tokens are awarded.
                Duplicate or fraudulent submissions are flagged automatically.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || (!!exifData && !exifData.present)}
              icon={<MLeaf className="w-4 h-4" />}>
              {exifData && !exifData.present ? "Upload a valid photo to continue" : "Submit Eco-Action"}
            </Button>
          </form>
        </div>

        {/* RIGHT: Steps + Live Preview (2/5) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Verification process */}
          <div className="bg-primary-600 rounded-xl p-6 text-white">
            <h3 className="text-sm font-bold text-white mb-1">How Verification Works</h3>
            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              A transparent, community-driven process that ensures every eco-action is real and impactful.
            </p>
            <div className="space-y-4">
              {VERIFICATION_STEPS.map(({ title, desc }, i) => (
                <div key={title} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" aria-hidden>
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

          {/* Live action preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {actionType || description ? "Live Preview" : "Action Preview"}
            </p>
            {actionType || description ? (
              <div className="space-y-3">
                {actionType && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Type</span>
                    <Badge color="green">
                      {selectedType?.emoji} {selectedType?.label}
                    </Badge>
                  </div>
                )}
                {description && (
                  <div>
                    <span className="text-xs text-gray-500">Description</span>
                    <p className="text-xs text-gray-700 mt-1 line-clamp-3 leading-relaxed">{description}</p>
                  </div>
                )}
                {evidence && (
                  <div className="flex items-center gap-1.5 text-xs text-primary-600">
                    <MAttachFile className="w-3.5 h-3.5" aria-hidden />
                    <span className="truncate max-w-[160px]">{evidence.name}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    Status after submission: <span className="text-amber-500 font-medium">Pending review</span>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Fill in the form to see your action preview here.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Actions ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Your Recent Actions</h3>
          <Link href="/dashboard" className="text-xs text-primary-600 hover:underline font-medium">
            View All →
          </Link>
        </div>

        {statsLoading ? (
          <div className="px-6 py-6 space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
          </div>
        ) : recentActions.length === 0 ? (
          <div className="py-12 text-center">
            <MLeaf className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden />
            <p className="text-sm font-semibold text-gray-600">No actions yet</p>
            <p className="text-xs text-gray-400 mt-1">Submit your first eco-action above to get started!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Your recent submitted eco-actions</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Type", "Description", "Status", "Tokens", "Blockchain"].map(h => (
                  <th key={h} scope="col"
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActions.map(r => (
                <tr key={r.id}
                  className={cn("hover:bg-gray-50 transition-colors", r.status === "verified" && "bg-primary-50/30")}>
                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap font-mono">
                    {formatDate(r.submitted_at)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                    {ACTION_TYPES.find(t => t.value === r.action_type)?.emoji ?? ""}{" "}
                    {ACTION_TYPES.find(t => t.value === r.action_type)?.label ?? r.action_type}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-[160px] truncate" title={r.description}>
                    {r.description}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={r.status === "verified" ? "green" : r.status === "rejected" ? "red" : "amber"} dot>
                      {r.status === "verified" ? "Verified" : r.status === "rejected" ? "Rejected" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {r.tokens_awarded > 0
                      ? <span className="text-primary-600">+{r.tokens_awarded} GTK</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {r.stellar_tx_hash ? (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${r.stellar_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-mono"
                        title={`Tx: ${r.stellar_tx_hash}`}
                      >
                        <MLink className="w-3 h-3 flex-shrink-0" aria-hidden />
                        {r.stellar_tx_hash.slice(0, 8)}…
                      </a>
                    ) : r.status === "verified" ? (
                      <span className="text-xs text-gray-400 italic">Pending on-chain</span>
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

      {/* ── Success Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={success}
        onClose={() => setSuccess(false)}
        title="Action Submitted!"
        icon={
          <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        }
        description="Thank you for contributing to a greener community! Your action is under review. You'll earn GTK tokens once an admin verifies it."
      >
        <div className="space-y-2">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center">
            <MLeaf className="w-4 h-4 mx-auto mb-1 text-primary-500" aria-hidden />
            <p className="text-xs text-primary-700 font-medium">Every verified action gets recorded on Stellar blockchain.</p>
          </div>
          <Button variant="primary" size="md" fullWidth onClick={() => setSuccess(false)}>
            Submit Another Action
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
