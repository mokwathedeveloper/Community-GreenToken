"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import {
  MQrCode, MWarning, MInfo, MDelete, MLocationPin,
  MAccessTime, MContentCopy, MCheckCircle, MLeaf,
} from "@/components/icons";

// ── types ───────────────────────────────────────────────────────────────────

type QrEvent = {
  id:           string;
  action_type:  string;
  label:        string;
  description:  string | null;
  lat:          number | null;
  lng:          number | null;
  radius_m:     number;
  tokens_award: number;
  valid_from:   string;
  valid_until:  string;
  token:        string;
  is_active:    boolean;
  scan_count:   number;
  created_at:   string;
  status:       "active" | "upcoming" | "expired" | "inactive";
};

const ACTION_TYPES = [
  "Recycling", "TreePlanting", "Carpooling", "EnergySaving",
  "WaterSaving", "CommunityCleanup", "CompostingOrganics",
  "PublicTransport", "SolarEnergyUse", "BeachCleanup",
] as const;

function isoLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ── main component ───────────────────────────────────────────────────────────

export default function QrEventsPage() {
  const router = useRouter();
  const { orgName, orgId, isLoading: userLoading, isOrgAdmin } = useUser();

  useEffect(() => {
    if (!userLoading && !isOrgAdmin) router.replace("/dashboard");
  }, [userLoading, isOrgAdmin, router]);

  const [events,    setEvents]    = useState<QrEvent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadErr,   setLoadErr]   = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [viewToken, setViewToken] = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); }, []);

  // ── form state ──────────────────────────────────────────────────────────
  const now          = new Date();
  const defaultFrom  = isoLocalInput(now);
  const defaultUntil = isoLocalInput(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const [form, setForm] = useState({
    actionType:  "CommunityCleanup" as typeof ACTION_TYPES[number],
    label:       "",
    description: "",
    lat:         "",
    lng:         "",
    radiusM:     "200",
    tokensAward: "10",
    validFrom:   defaultFrom,
    validUntil:  defaultUntil,
  });
  const [formErr,  setFormErr]  = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // ── fetch events ────────────────────────────────────────────────────────
  // Note: setLoading(true) is NOT called synchronously here — it starts as true via useState.
  // All setState calls below are in async callbacks to satisfy react-hooks/set-state-in-effect.
  const loadEvents = useCallback(() => {
    if (!orgId || !isOrgAdmin) return;
    fetch("/api/qr/create")
      .then(r => r.json())
      .then(res => {
        if (res.error) throw new Error(res.error.message);
        setEvents(res.data ?? []);
      })
      .catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : "Failed to load QR events."))
      .finally(() => setLoading(false));
  }, [orgId, isOrgAdmin]);

  useEffect(() => { if (!userLoading && isOrgAdmin) loadEvents(); }, [userLoading, isOrgAdmin, loadEvents]);

  // ── create QR event ─────────────────────────────────────────────────────
  async function handleCreate() {
    setFormErr(null);
    if (!form.label.trim()) { setFormErr("Event name is required."); return; }
    if (form.label.trim().length < 3) { setFormErr("Event name must be at least 3 characters."); return; }
    if (!form.validFrom || !form.validUntil) { setFormErr("Start and end time are required."); return; }
    if (new Date(form.validUntil) <= new Date(form.validFrom)) {
      setFormErr("End time must be after start time."); return;
    }

    const body: Record<string, unknown> = {
      actionType:  form.actionType,
      label:       form.label.trim(),
      description: form.description.trim() || undefined,
      radiusM:     parseInt(form.radiusM) || 200,
      tokensAward: parseInt(form.tokensAward) || 10,
      validFrom:   new Date(form.validFrom).toISOString(),
      validUntil:  new Date(form.validUntil).toISOString(),
    };

    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);
    if (form.lat && !isNaN(latNum)) body.lat = latNum;
    if (form.lng && !isNaN(lngNum)) body.lng = lngNum;
    if ((body.lat != null) !== (body.lng != null)) {
      setFormErr("Provide both latitude and longitude, or leave both blank."); return;
    }

    setCreating(true);
    try {
      const res  = await fetch("/api/qr/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message ?? "Failed to create QR event.");
      setShowForm(false);
      setViewToken(data.data.token);
      loadEvents();
    } catch (e: unknown) {
      setFormErr(e instanceof Error ? e.message : "Failed to create QR event.");
    } finally {
      setCreating(false);
    }
  }

  // ── toggle active ───────────────────────────────────────────────────────
  async function toggleActive(token: string, currentActive: boolean) {
    const res = await fetch(`/api/qr/${token}/deactivate`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_active: !currentActive }),
    });
    if (res.ok) {
      setEvents(prev => prev.map(e => e.token === token ? { ...e, is_active: !currentActive } : e));
    }
  }

  // ── copy scan URL ───────────────────────────────────────────────────────
  function copyUrl(token: string) {
    const url = `${window.location.origin}/qr/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2500);
    });
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";


  const statusBadge = (status: QrEvent["status"]) => {
    const cfg: Record<QrEvent["status"], string> = {
      active:   "bg-green-100 text-green-700 border-green-200",
      upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      expired:  "bg-gray-100 text-gray-500 border-gray-200",
      inactive: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", cfg[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <OrgAdminLayout orgName={orgName ?? "Your Org"} plan="Pro Plan">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MQrCode className="w-5 h-5 text-primary-600" aria-hidden="true" />
            QR Code Events
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create QR codes for events — members scan to auto-earn GTK tokens.
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); setFormErr(null); }} size="sm">
          + New QR Event
        </Button>
      </div>

      {/* Global error */}
      {loadErr && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">{loadErr}</span>
          <button onClick={() => setLoadErr(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Create QR event">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Create QR Event</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formErr && (
                <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {formErr}
                </div>
              )}

              {/* Event name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="qr-label">Event Name *</label>
                <input id="qr-label" type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Saturday Park Cleanup" maxLength={100}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              {/* Action type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="qr-type">Action Type *</label>
                <select id="qr-type" value={form.actionType} onChange={e => setForm(f => ({ ...f, actionType: e.target.value as typeof ACTION_TYPES[number] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="qr-desc">Description (optional)</label>
                <textarea id="qr-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} maxLength={300} placeholder="Brief event details visible to members on the scan page"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              {/* Tokens */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="qr-tokens">Tokens to Award *</label>
                <input id="qr-tokens" type="number" min={1} max={10000} value={form.tokensAward}
                  onChange={e => setForm(f => ({ ...f, tokensAward: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              {/* Valid window */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="qr-from">Start *</label>
                  <input id="qr-from" type="datetime-local" value={form.validFrom}
                    onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="qr-until">End *</label>
                  <input id="qr-until" type="datetime-local" value={form.validUntil}
                    onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              {/* GPS (optional) */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MLocationPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  Location Verification (optional)
                </p>
                <p className="text-xs text-gray-500 mb-2">If set, members must be within the radius of these coordinates to scan.</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1" htmlFor="qr-lat">Latitude</label>
                    <input id="qr-lat" type="number" step="0.000001" min={-90} max={90} value={form.lat}
                      onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="0.000000"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1" htmlFor="qr-lng">Longitude</label>
                    <input id="qr-lng" type="number" step="0.000001" min={-180} max={180} value={form.lng}
                      onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="0.000000"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1" htmlFor="qr-radius">Radius (m)</label>
                    <input id="qr-radius" type="number" min={50} max={50000} value={form.radiusM}
                      onChange={e => setForm(f => ({ ...f, radiusM: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <Button onClick={handleCreate} loading={creating} size="sm">Create QR Event</Button>
            </div>
          </div>
        </div>
      )}

      {/* QR code viewer modal */}
      {viewToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="QR code">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Scan QR Code</h2>
              <button onClick={() => setViewToken(null)} aria-label="Close" className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <div className="rounded-xl border-2 border-primary-100 p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${viewToken}/image`}
                  alt="QR code for member scan"
                  width={256}
                  height={256}
                  className="block"
                />
              </div>
              <p className="text-xs text-gray-500 text-center break-all">
                {appUrl}/qr/{viewToken}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => copyUrl(viewToken)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors",
                    copied
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {copied ? <MCheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> : <MContentCopy className="w-3.5 h-3.5" aria-hidden="true" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`/api/qr/${viewToken}/image`}
                  download={`qr-event-${viewToken.slice(0, 8)}.svg`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Download SVG
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MQrCode className="w-12 h-12 text-gray-200 mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500">No QR events yet</p>
          <p className="text-xs text-gray-400 mt-1">Create one to generate a scannable QR code for your next event.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const scanUrl = `${appUrl}/qr/${event.token}`;
            return (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                <div className="flex items-start gap-4">
                  {/* QR thumbnail */}
                  <button
                    onClick={() => setViewToken(event.token)}
                    className="flex-shrink-0 rounded-lg border border-gray-100 p-1 hover:border-primary-200 transition-colors"
                    aria-label={`View QR code for ${event.label}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/qr/${event.token}/image`}
                      alt=""
                      width={60}
                      height={60}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{event.label}</h3>
                      {statusBadge(event.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MLeaf className="w-3 h-3 text-primary-500" aria-hidden="true" />
                        {event.action_type}
                      </span>
                      <span className="text-xs font-semibold text-amber-600">{event.tokens_award} GTK / scan</span>
                      <span className="text-xs text-gray-400">{event.scan_count} scans</span>
                      {event.lat !== null && (
                        <span className="flex items-center gap-0.5 text-xs text-blue-600">
                          <MLocationPin className="w-3 h-3" aria-hidden="true" />
                          GPS {event.radius_m}m
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <MAccessTime className="w-3 h-3" aria-hidden="true" />
                      {new Date(event.valid_from).toLocaleString()} – {new Date(event.valid_until).toLocaleString()}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setViewToken(event.token)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <MQrCode className="w-3.5 h-3.5" aria-hidden="true" /> View QR
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(scanUrl); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                      aria-label="Copy scan URL"
                    >
                      <MContentCopy className="w-3.5 h-3.5" aria-hidden="true" /> Copy URL
                    </button>
                    <button
                      onClick={() => toggleActive(event.token, event.is_active)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        event.is_active
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      )}
                      aria-label={event.is_active ? "Deactivate QR event" : "Activate QR event"}
                    >
                      {event.is_active ? (
                        <><MDelete className="w-3.5 h-3.5" aria-hidden="true" /> Deactivate</>
                      ) : (
                        <><MCheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> Activate</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-2">
        <MInfo className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-blue-700">
          Members scan the QR code at your event. Their GPS location is verified against the event radius (if set)
          and recorded on the Stellar blockchain as tamper-proof evidence. Each member can only scan each event once.
        </p>
      </div>
    </OrgAdminLayout>
  );
}
