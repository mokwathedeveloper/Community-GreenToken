"use client";

// Spec: ux_ui/feature_specv2/billing_page_md.md
// Starter: ux_ui/feature_specv2/billing_page_starter_code.js
// Components: CurrentPlanCard · PlanUsageSummary · TrialCountdown · InvoiceList · PaymentMethodCard · BillingAlertBanner

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { MWarning, MGift, MSync } from "@/components/icons";

interface BillingStatus {
  plan:                string;
  subscription_status: string;
  trial_ends_at:       string | null;
  trial_days_left:     number | null;
  is_trialing:         boolean;
  member_limit:        number;
  member_count:        number;
  stripe_subscription_id: string | null;
}

const PLANS: Record<string, { label: string; price: string; color: string; bgColor: string; limit: string }> = {
  free:       { label: "Free",       price: "$0/month",   color: "text-gray-600",   bgColor: "bg-gray-50",    limit: "50 members"    },
  starter:    { label: "Starter",    price: "$49/month",  color: "text-blue-600",   bgColor: "bg-blue-50",    limit: "500 members"   },
  pro:        { label: "Pro",        price: "$199/month", color: "text-primary-600",bgColor: "bg-primary-50", limit: "5,000 members" },
  enterprise: { label: "Enterprise", price: "Custom",     color: "text-purple-600", bgColor: "bg-purple-50",  limit: "Unlimited"     },
};

const PLAN_FEATURES: Record<string, { included: string[]; locked: string[] }> = {
  free:    { included: ["Community dashboard","3 action types","Basic leaderboard"], locked: ["Analytics","Custom token","White-label","API access"] },
  starter: { included: ["Analytics dashboard","Custom token name/symbol","10 action types","Email support"], locked: ["White-label branding","API access","Priority support"] },
  pro:     { included: ["White-label branding","API access","Unlimited action types","Priority support","Custom integrations"], locked: [] },
  enterprise: { included: ["All Pro features","Dedicated contract","SLA agreement","Custom onboarding"], locked: [] },
};


export default function BillingPage() {
  const router = useRouter();
  const { orgName, isLoading: userLoading, isOrgAdmin } = useUser();
  const [status,    setStatus]    = useState<BillingStatus | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [opening,   setOpening]   = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !isOrgAdmin) { router.replace("/dashboard"); return; }
    if (userLoading) return;
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then((d) => setStatus(d.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userLoading, isOrgAdmin, router]);

  async function openPortal() {
    setOpening(true);
    try {
      const res  = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (json.data?.url) window.open(json.data.url, "_blank");
    } finally {
      setOpening(false);
    }
  }

  async function upgrade(plan: string) {
    setUpgrading(plan);
    const priceMap: Record<string, string> = {
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "price_starter",
      pro:     process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID    ?? "price_pro",
    };
    try {
      const res  = await fetch("/api/billing/create-checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceMap[plan] }),
      });
      const json = await res.json();
      if (json.data?.url) window.location.href = json.data.url;
    } finally {
      setUpgrading(null);
    }
  }

  const currentPlan  = PLANS[status?.plan ?? "free"]    ?? PLANS.free;
  const features     = PLAN_FEATURES[status?.plan ?? "free"] ?? PLAN_FEATURES.free;
  const usagePct     = status ? Math.min(100, Math.round((status.member_count / (status.member_limit || 1)) * 100)) : 0;
  const trialDays    = status?.trial_days_left ?? 0;
  const isPastDue    = status?.subscription_status === "past_due";
  const isTrialing   = status?.is_trialing;
  const isCanceled   = status?.subscription_status === "canceled";
  const canUpgrade   = ["free", "starter", "trialing"].includes(status?.plan ?? "free");

  return (
    <OrgAdminLayout orgName={orgName ?? "Your Org"} plan={`${currentPlan.label} Plan`}>

      {/* ── Page header ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing &amp; Subscription</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Current Plan · Invoices · Upgrade
        </p>
      </div>

      {/* ── BillingAlertBanner — past due ── */}
      {isPastDue && (
        <div role="alert" className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-6 py-4 mb-5">
          <div className="flex items-center gap-2">
            <MWarning className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-700">Payment failed</p>
              <p className="text-xs text-red-600 mt-0.5">Update your payment method to avoid service interruption.</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={openPortal} loading={opening}>
            Update Payment
          </Button>
        </div>
      )}

      {/* ── BillingAlertBanner — canceled ── */}
      {isCanceled && (
        <div role="alert" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 mb-5">
          <div className="flex items-center gap-2">
            <MWarning className="w-5 h-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Subscription canceled — you&apos;re on Free</p>
              <p className="text-xs text-amber-600 mt-0.5">Upgrade to restore analytics, custom tokens, and more.</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => upgrade("starter")}>
            Resubscribe
          </Button>
        </div>
      )}

      {/* ── Trial countdown ── */}
      {isTrialing && trialDays > 0 && (
        <div role="status" className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-amber-800 flex items-center gap-1.5"><MGift className="w-4 h-4 text-amber-600" aria-hidden="true" /> Pro Trial — {trialDays} days remaining</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your trial ends on {status?.trial_ends_at ? new Date(status.trial_ends_at).toLocaleDateString("en",{month:"long",day:"numeric",year:"numeric"}) : "—"}.
                Upgrade to keep all Pro features.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => upgrade("pro")}>Upgrade Now</Button>
          </div>
          <ProgressBar value={14 - trialDays} max={14} size="sm" />
          <div className="flex justify-between text-xs text-amber-600 mt-1">
            <span>Day 1</span>
            <span>{trialDays} days left</span>
          </div>
        </div>
      )}

      {/* ── Main 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Component A — CurrentPlanCard */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current Plan</p>
              <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-2", currentPlan.bgColor, currentPlan.color)}>
                {currentPlan.label}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{currentPlan.price}</p>
              <p className="text-xs text-gray-400 mt-0.5">{currentPlan.limit}</p>
            </div>
            <Badge color={
              isPastDue   ? "red"   :
              isTrialing  ? "amber" :
              isCanceled  ? "gray"  : "green"
            }>
              {loading ? "…" : (status?.subscription_status ?? "free").replace("_"," ")}
            </Badge>
          </div>

          {/* Renewal info */}
          {!isTrialing && status?.subscription_status === "active" && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <MSync className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>Renews automatically — manage via Stripe portal</span>
            </div>
          )}

          {/* Member usage bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Members used</span>
              <span className="font-semibold text-gray-900">
                {loading ? "…" : `${(status?.member_count ?? 0).toLocaleString()} / ${(status?.member_limit ?? 50).toLocaleString()}`}
              </span>
            </div>
            <ProgressBar
              value={status?.member_count ?? 0}
              max={status?.member_limit ?? 50}
              size="md"
            />
            <p className="text-xs text-gray-400 mt-1">{usagePct}% capacity used</p>
          </div>

          {/* Manage portal button */}
          <div className="mt-5 pt-4 border-t border-gray-50">
            <Button variant="outline" size="sm" onClick={openPortal} loading={opening} fullWidth>
              Manage Payment &amp; View Invoices →
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">Opens Stripe&apos;s secure customer portal</p>
          </div>
        </div>

        {/* Component B — PlanUsageSummary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Plan Features</p>

          {/* Included */}
          <div className="space-y-2 mb-4">
            {features.included.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          {/* Locked */}
          {features.locked.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Unlock with upgrade</p>
              <div className="space-y-2">
                {features.locked.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-400">{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Compare plans link */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <Link href="/pricing" target="_blank"
              className="text-xs text-primary-600 hover:underline font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              Compare all plans →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Upgrade cards (Component C) ── */}
      {canUpgrade && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Upgrade Your Plan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Starter upgrade — only show if on free */}
            {(status?.plan === "free" || status?.plan === "trialing") && (
              <div className="border-2 border-blue-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-base font-bold text-blue-600">Starter</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">$49<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">500 members</span>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-600 mb-4">
                  {["Analytics dashboard","Custom token name","10 action types","Email support"].map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <span className="text-blue-500">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" fullWidth
                  loading={upgrading === "starter"}
                  onClick={() => upgrade("starter")}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  Upgrade to Starter
                </Button>
              </div>
            )}

            {/* Pro upgrade */}
            <div className="border-2 border-primary-400 rounded-xl p-5 hover:border-primary-600 hover:shadow-sm transition-all relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-primary-500 text-white font-bold px-2.5 py-1 rounded-full">MOST POPULAR</span>
              </div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-base font-bold text-primary-600">Pro</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-0.5">$199<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
                <span className="text-xs bg-primary-50 text-primary-600 font-semibold px-2.5 py-1 rounded-full">5,000 members</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600 mb-4">
                {["White-label branding","API access","Unlimited action types","Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <span className="text-primary-500">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Button variant="primary" size="sm" fullWidth
                loading={upgrading === "pro"}
                onClick={() => upgrade("pro")}>
                Upgrade to Pro
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Need unlimited members?{" "}
            <a href="mailto:enterprise@greentoken.app" className="text-primary-600 hover:underline">Contact us for Enterprise →</a>
          </p>
        </div>
      )}

      {/* ── Payment Method + Invoice list (Component D) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* PaymentMethodCard */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment Method</p>

          {status?.stripe_subscription_id ? (
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold tracking-widest">VISA</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-xs text-gray-400">Expires 04/28</p>
              </div>
              <Badge color="green">Active</Badge>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-5 text-gray-400">
              <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-400">CARD</span>
              </div>
              <p className="text-sm">No payment method on file</p>
            </div>
          )}

          <Button variant="outline" size="sm" fullWidth onClick={openPortal} loading={opening}>
            {status?.stripe_subscription_id ? "Update Payment Method" : "Add Payment Method"}
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">Secured by Stripe</p>
        </div>

        {/* InvoiceList — managed via Stripe portal */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice History</p>
            <button onClick={openPortal}
              className="text-xs text-primary-600 hover:underline font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              Open Portal →
            </button>
          </div>

          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
            </div>
          ) : !status?.stripe_subscription_id ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">No invoices yet</p>
              <p className="text-xs text-gray-400 mt-1">Invoices will appear here once you subscribe to a paid plan.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800">Invoice history is in Stripe</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                All your receipts, PDF invoices, and payment history are available securely in the Stripe Customer Portal.
              </p>
              <Button variant="outline" size="sm" onClick={openPortal} loading={opening} className="mt-4">
                View &amp; Download Invoices →
              </Button>
            </div>
          )}

          <div className="px-6 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400 text-center">Secured and managed by Stripe</p>
          </div>
        </div>
      </div>

    </OrgAdminLayout>
  );
}
