"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  MCrown, MLeaf, MOpenInNew, MContentCopy, MWarning, MCheckCircle, MAccessTime,
} from "@/components/icons";
import Spinner from "@/components/ui/Spinner";

type CertificateSummary = {
  id:              string;
  cert_number:     string;
  action_type:     string;
  tokens_earned:   number;
  co2_kg_offset:   number;
  stellar_tx_hash: string | null;
  issued_at:       string;
  user_id:         string;
};

const ACTION_LABELS: Record<string, string> = {
  Recycling:           "Recycling",
  TreePlanting:        "Tree Planting",
  Carpooling:          "Carpooling",
  EnergySaving:        "Energy Conservation",
  WaterSaving:         "Water Conservation",
  CommunityCleanup:    "Community Cleanup",
  CompostingOrganics:  "Composting Organics",
  PublicTransport:     "Public Transport",
  SolarEnergyUse:      "Solar Energy",
  BeachCleanup:        "Beach Cleanup",
};

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Recycling:          { bg: "bg-lime-50",    text: "text-lime-700",    border: "border-lime-200"   },
  TreePlanting:       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Carpooling:         { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  EnergySaving:       { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  WaterSaving:        { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"    },
  CommunityCleanup:   { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  CompostingOrganics: { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200"  },
  PublicTransport:    { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
  SolarEnergyUse:     { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200" },
  BeachCleanup:       { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"   },
};

function getActionColor(type: string) {
  return ACTION_COLORS[type] ?? { bg: "bg-primary-50", text: "text-primary-700", border: "border-primary-200" };
}

export default function CertificatesPage() {
  const [certs,           setCerts]           = useState<CertificateSummary[]>([]);
  const [total,           setTotal]           = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [loadErr,         setLoadErr]         = useState<string | null>(null);
  const [copied,          setCopied]          = useState<string | null>(null);
  const [backfilling,     setBackfilling]     = useState(false);
  const [migrationPending, setMigrationPending] = useState(false);

  async function loadCerts() {
    const r    = await fetch("/api/certificates?limit=50");
    const json = await r.json();
    setCerts(json.data ?? []);
    setTotal(json.meta?.total ?? 0);
    if (json.meta?.migrationPending) setMigrationPending(true);
    return (json.data ?? []) as CertificateSummary[];
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadCerts is async; all setState calls fire after awaits
    loadCerts()
      .then(async (data) => {
        // Auto-backfill: if no certs returned, trigger issuance for existing verified actions
        if (data.length === 0) {
          setBackfilling(true);
          try {
            const br = await fetch("/api/certificates/backfill", { method: "POST" });
            const bj = await br.json();
            if (bj.data?.issued > 0) {
              // Reload after backfill issued new certificates
              await loadCerts();
            }
          } catch { /* non-critical */ }
          setBackfilling(false);
        }
      })
      .catch((err: unknown) => setLoadErr(err instanceof Error ? err.message : "Failed to load certificates."))
      .finally(() => setLoading(false));
  }, []);

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  }

  const totalCo2 = certs.reduce((sum, c) => sum + Number(c.co2_kg_offset), 0);

  return (
    <AppLayout title="My Certificates">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MCrown className="w-6 h-6 text-amber-500" aria-hidden />
            Carbon Credit Certificates
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Each certificate is anchored to the Stellar blockchain — a unique, non-reproducible proof of your eco-action.
          </p>
        </div>
      </div>

      {loadErr && (
        <div role="alert" className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <MWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{loadErr}</span>
          <button onClick={() => setLoadErr(null)} aria-label="Dismiss" className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Summary stat row ─────────────────────────────────────────────── */}
      {!loading && certs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Certificates Earned",  value: total.toLocaleString(),           Icon: MCrown,  color: "text-amber-500",  bg: "bg-amber-50"  },
            { label: "Total CO₂e Offset",    value: `${totalCo2.toFixed(2)} kg`,      Icon: MLeaf,   color: "text-green-600",  bg: "bg-green-50"  },
            { label: "Anchored on Stellar",   value: certs.filter(c => c.stellar_tx_hash).length.toString(), Icon: MCheckCircle, color: "text-primary-600", bg: "bg-primary-50" },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                <Icon className={cn("w-5 h-5", color)} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Certificate cards ────────────────────────────────────────────── */}
      {loading ? (
        <div role="status" aria-label="Loading certificates…" aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} aria-hidden="true" className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
              {backfilling
                ? <Spinner size="md" color="amber" decorative />
                : <MCrown className="w-8 h-8 text-amber-300" aria-hidden />
              }
            </div>
          </div>
          <p className="text-sm font-bold text-gray-700">
            {backfilling
              ? "Generating your certificates…"
              : migrationPending
              ? "Certificates not yet enabled"
              : "No certificates yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            {backfilling
              ? "Issuing carbon credit certificates for your verified actions."
              : migrationPending
              ? "An admin needs to run migration 031_create_certificates.sql in Supabase SQL Editor to enable this feature."
              : "Complete an eco-action (QR scan or submit a photo) and get it verified to earn your first carbon credit certificate."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert) => {
            const colors = getActionColor(cert.action_type);
            const label  = ACTION_LABELS[cert.action_type] ?? cert.action_type;
            const isVerified = !!cert.stellar_tx_hash;

            return (
              <article
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Card header band */}
                <div className="bg-gradient-to-r from-[#14532d] to-[#166534] px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-green-300 font-semibold tracking-widest">CARBON CREDIT CERTIFICATE</p>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{cert.cert_number}</p>
                    </div>
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-300 bg-white/10 rounded-full px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                        <MCheckCircle className="w-3 h-3" aria-hidden /> On-chain
                      </span>
                    ) : (
                      <span title="Certificate issued — awaiting Stellar blockchain anchor" className="flex items-center gap-1 text-[10px] font-bold text-yellow-300 bg-white/10 rounded-full px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                        <MAccessTime className="w-3 h-3" aria-hidden /> Issued
                      </span>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  {/* Action type badge */}
                  <span className={cn(
                    "self-start text-xs font-semibold px-2.5 py-1 rounded-full border",
                    colors.bg, colors.text, colors.border,
                  )}>
                    {label}
                  </span>

                  {/* CO2 offset — focal point */}
                  <div className="text-center py-2">
                    <p className="text-3xl font-extrabold text-emerald-600 leading-none">
                      {Number(cert.co2_kg_offset).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">kg CO₂e offset</p>
                  </div>

                  {/* GTK row */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                    <span className="font-medium text-gray-700">
                      🌱 {cert.tokens_earned.toLocaleString()} GTK earned
                    </span>
                    <span>
                      {new Date(cert.issued_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Stellar tx — truncated with copy */}
                  {isVerified && cert.stellar_tx_hash && (
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-[10px] text-gray-400 font-mono truncate flex-1">
                        TX: {cert.stellar_tx_hash.slice(0, 16)}…{cert.stellar_tx_hash.slice(-8)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(cert.stellar_tx_hash!, cert.id + "-copy")}
                        aria-label="Copy transaction hash"
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {copied === cert.id + "-copy"
                          ? <MCheckCircle className="w-3.5 h-3.5 text-green-500" aria-hidden />
                          : <MContentCopy className="w-3.5 h-3.5" aria-hidden />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Card footer — actions */}
                <div className="px-5 pb-5 flex gap-2">
                  <a
                    href={`/api/certificates/${cert.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg px-3 py-2 transition-colors"
                    aria-label={`View certificate ${cert.cert_number}`}
                  >
                    <MOpenInNew className="w-3.5 h-3.5" aria-hidden />
                    View Certificate
                  </a>
                  <a
                    href={`/api/certificates/${cert.id}`}
                    download={`${cert.cert_number}.svg`}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
                    aria-label={`Download certificate ${cert.cert_number}`}
                  >
                    <Badge color="gray">SVG</Badge>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
