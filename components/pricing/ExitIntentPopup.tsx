"use client";

// Spec §9 MANDATORY: Exit-intent popup offering free trial before user leaves
// Triggers when mouse leaves the viewport top edge (desktop)
// or after 30s on page without interaction (mobile fallback)
// Owner: RockieRaheem

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExitIntentPopupProps {
  /** Delay in ms before popup can show again after dismissal (default 24h) */
  cooldownMs?: number;
}

const STORAGE_KEY = "gt_exit_popup_dismissed";

export default function ExitIntentPopup({ cooldownMs = 86_400_000 }: ExitIntentPopupProps) {
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }, []);

  useEffect(() => {
    // Respect cooldown — don't annoy users who already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed && Date.now() - Number(dismissed) < cooldownMs) return;

    // Desktop: mouse leaves viewport top edge
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        setOpen(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    }

    // Mobile fallback: show after 30 seconds on page
    const mobileTimer = setTimeout(() => {
      setOpen((prev) => { if (!prev) return true; return prev; });
    }, 30_000);

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [cooldownMs]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") dismiss(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-heading"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden",
        "animate-in zoom-in-95 duration-200"
      )}>
        {/* Green top banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5 text-center">
          <p className="text-2xl mb-1" aria-hidden="true">🌿</p>
          <h2 id="exit-popup-heading" className="text-xl font-extrabold text-white leading-tight">
            Before you go…
          </h2>
          <p className="text-primary-100 text-sm mt-1">
            Start your free 14-day Pro trial — no credit card required.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
            {[
              "✓  5,000 members during trial",
              "✓  Full analytics dashboard",
              "✓  White-label branding",
              "✓  Per-org Stellar smart contract",
            ].map((f) => <li key={f}>{f}</li>)}
          </ul>

          <Link
            href="/org/setup"
            onClick={dismiss}
            className={cn(
              "block w-full text-center py-3 rounded-xl font-bold text-sm text-white",
              "bg-primary-600 hover:bg-primary-700 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}
          >
            Start Free 14-Day Trial
          </Link>

          <button
            onClick={dismiss}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
          >
            No thanks, I&apos;ll pass on the free trial
          </button>
        </div>
      </div>
    </div>
  );
}
