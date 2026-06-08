"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MQrCode, MLocationPin, MCheckCircle, MWarning, MInfo,
  MLeaf, MAccessTime, MPeople,
} from "@/components/icons";
import Spinner from "@/components/ui/Spinner";

// ── types ───────────────────────────────────────────────────────────────────

type QrEventPublic = {
  label:        string;
  description:  string | null;
  action_type:  string;
  tokens_award: number;
  valid_from:   string;
  valid_until:  string;
  is_active:    boolean;
  has_location: boolean;
  radius_m:     number;
  org_name:     string | null;
  status:       "active" | "upcoming" | "expired" | "inactive";
};

type ScanState = "idle" | "locating" | "confirming" | "submitting" | "success" | "error";

// ── component ────────────────────────────────────────────────────────────────

export default function QrScanPage() {
  const params    = useParams();
  const router    = useRouter();
  const token     = typeof params?.token === "string" ? params.token : "";

  const [event,     setEvent]     = useState<QrEventPublic | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [loadErr,   setLoadErr]   = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [gps,       setGps]       = useState<{ lat: number; lng: number } | null>(null);
  const [geoErr,    setGeoErr]    = useState<string | null>(null);
  const [result,    setResult]    = useState<{ tokensAwarded: number; message: string } | null>(null);
  const [scanErr,   setScanErr]   = useState<string | null>(null);

  // ── load event details ──────────────────────────────────────────────────
  const loadEvent = useCallback(() => {
    if (!token) return;
    fetch(`/api/qr/${token}`)
      .then(r => r.json())
      .then(res => {
        if (res.error) throw new Error(res.error.message);
        setEvent(res.data);
      })
      .catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : "QR event not found."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  // status is computed server-side — no Date.now() needed in render
  const isExpired  = event?.status === "expired";
  const isUpcoming = event?.status === "upcoming";
  const isReady    = event?.status === "active";

  // ── GPS capture ─────────────────────────────────────────────────────────
  function captureGps() {
    setGeoErr(null);
    setScanState("locating");

    if (!navigator.geolocation) {
      setGeoErr("Your browser does not support GPS. Please use a mobile device.");
      setScanState("idle");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setScanState("confirming");
      },
      err => {
        const msg = err.code === 1
          ? "Location access denied. Please enable location permission and try again."
          : err.code === 2
            ? "Could not determine your location. Please check GPS signal."
            : "Location request timed out. Please try again.";
        setGeoErr(msg);
        setScanState("idle");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // ── submit scan ─────────────────────────────────────────────────────────
  async function submitScan() {
    setScanErr(null);
    setScanState("submitting");

    try {
      const body: { lat?: number; lng?: number } = {};
      if (gps) { body.lat = gps.lat; body.lng = gps.lng; }

      const res  = await fetch(`/api/qr/${token}/scan`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        const code = data.error?.code ?? "";
        if (code === "GPS_REQUIRED") {
          setScanErr("This event requires GPS verification. Please allow location access.");
          setScanState("idle");
        } else if (code === "OUTSIDE_RADIUS") {
          setScanErr(`You are too far from the event location (${data.error?.distanceM ?? "?"}m away, ${data.error?.radiusM ?? event?.radius_m}m radius required).`);
          setScanState("idle");
        } else if (code === "ALREADY_SCANNED") {
          setScanErr("You have already scanned this QR event.");
          setScanState("error");
        } else if (code === "WRONG_ORG") {
          setScanErr("This QR event belongs to a different organization.");
          setScanState("error");
        } else if (code === "EVENT_EXPIRED") {
          setScanErr("This QR event has expired.");
          setScanState("error");
        } else if (code === "EVENT_INACTIVE") {
          setScanErr("This QR event has been deactivated.");
          setScanState("error");
        } else {
          throw new Error(data.error?.message ?? "Scan failed. Please try again.");
        }
        return;
      }

      setResult({ tokensAwarded: data.data.tokensAwarded, message: data.data.message });
      setScanState("success");
    } catch (e: unknown) {
      setScanErr(e instanceof Error ? e.message : "Scan failed. Please try again.");
      setScanState("idle");
    }
  }

  // ── login redirect ──────────────────────────────────────────────────────
  function handleLoginRedirect() {
    window.location.assign(`/login?redirect=/qr/${token}`);
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between h-14 px-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image src="/branding/community-greentoken-logo.png" alt="Community GreenToken" fill className="object-contain" sizes="28px" />
          </div>
          <span className="text-sm font-bold text-primary-700">GreenToken</span>
        </Link>
        <Link href="/dashboard" className="text-xs font-medium text-gray-500 hover:text-gray-900">Go to Dashboard</Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <Spinner size="xl" className="mx-auto mb-4" label="Loading event…" />
              <p className="text-sm text-gray-500">Loading event…</p>
            </div>
          )}

          {/* Load error */}
          {!loading && loadErr && (
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <MWarning className="w-12 h-12 text-red-300 mx-auto mb-3" aria-hidden="true" />
              <h1 className="text-base font-bold text-gray-900 mb-1">QR Event Not Found</h1>
              <p className="text-sm text-gray-500">{loadErr}</p>
            </div>
          )}

          {/* Event card */}
          {!loading && event && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Green header */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-6 text-white text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <MQrCode className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h1 className="text-lg font-bold leading-snug">{event.label}</h1>
                {event.org_name && (
                  <p className="text-primary-200 text-xs mt-1 flex items-center justify-center gap-1">
                    <MPeople className="w-3 h-3" aria-hidden="true" />
                    {event.org_name}
                  </p>
                )}
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Meta row */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MLeaf className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
                    {event.action_type}
                  </span>
                  <span className="text-sm font-bold text-amber-600">+{event.tokens_award} GTK</span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                )}

                {/* Valid window */}
                <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
                  <MAccessTime className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-medium">Valid: </span>
                    {new Date(event.valid_from).toLocaleString()} – {new Date(event.valid_until).toLocaleString()}
                  </div>
                </div>

                {/* GPS always required */}
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
                  <MLocationPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  You must be within <span className="font-semibold mx-0.5">{event.radius_m}m</span> of the event location to scan.
                </div>

                {/* State-based UI */}

                {/* Inactive / upcoming / expired — status comes from server */}
                {event.status === "inactive" && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-red-700">Event Deactivated</p>
                    <p className="text-xs text-red-500 mt-0.5">This QR event is no longer active.</p>
                  </div>
                )}
                {isUpcoming && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-blue-700">Event Not Started Yet</p>
                    <p className="text-xs text-blue-500 mt-0.5">Starts {new Date(event.valid_from).toLocaleString()}</p>
                  </div>
                )}
                {isExpired && (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-gray-600">Event Expired</p>
                    <p className="text-xs text-gray-400 mt-0.5">This QR event ended on {new Date(event.valid_until).toLocaleString()}</p>
                  </div>
                )}

                {/* GPS captured confirmation */}
                {scanState === "confirming" && gps && (
                  <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2.5 flex items-start gap-2">
                    <MCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-xs text-green-700">
                      <p className="font-semibold mb-0.5">Location captured</p>
                      <p className="font-mono text-green-600">{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</p>
                    </div>
                  </div>
                )}

                {/* GPS error */}
                {geoErr && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700">
                    <MWarning className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {geoErr}
                  </div>
                )}

                {/* Scan error */}
                {scanErr && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700">
                    <MWarning className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {scanErr}
                  </div>
                )}

                {/* Success state */}
                {scanState === "success" && result && (
                  <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-5 text-center">
                    <MCheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-base font-bold text-green-700">Verified!</p>
                    <p className="text-sm text-green-600 mt-1">
                      You earned <span className="font-bold">{result.tokensAwarded} GTK</span> tokens.
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">Proof recorded on Stellar blockchain.</p>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                )}

                {/* CTA buttons — idle / locating / confirming */}
                {isReady && scanState !== "success" && scanState !== "error" && (
                  <div className="space-y-2 pt-1">
                    {(scanState === "idle" || scanState === "locating") && (
                      <button
                        onClick={captureGps}
                        disabled={scanState === "locating"}
                        className={cn(
                          "w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2",
                          scanState === "locating"
                            ? "bg-primary-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                        )}
                      >
                        {scanState === "locating" ? (
                          <><Spinner size="sm" color="white" decorative /> Getting Location…</>
                        ) : (
                          <><MLocationPin className="w-4 h-4" aria-hidden="true" /> Verify Location &amp; Scan</>

                        )}
                      </button>
                    )}

                    {scanState === "confirming" && (
                      <>
                        <button
                          onClick={submitScan}
                          className="w-full py-3 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          Confirm & Claim {event.tokens_award} GTK
                        </button>
                        <button
                          onClick={() => { setScanState("idle"); setGps(null); }}
                          className="w-full py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-700"
                        >
                          Retry Location
                        </button>
                      </>
                    )}

                    {scanState === "submitting" && (
                      <button disabled className="w-full py-3 rounded-xl text-sm font-semibold bg-primary-400 text-white cursor-not-allowed flex items-center justify-center gap-2">
                        <Spinner size="sm" color="white" decorative />
                        Recording on Blockchain…
                      </button>
                    )}
                  </div>
                )}

                {/* Not logged in prompt */}
                {isReady && scanState !== "success" && (
                  <div className="pt-1">
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-700">
                      <MInfo className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      You must be logged in to your organization to claim tokens.{" "}
                      <button onClick={handleLoginRedirect} className="underline font-semibold ml-0.5">Log in</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
