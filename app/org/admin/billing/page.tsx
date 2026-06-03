"use client";

// Rules: R-FE-01, R-A11Y-01
// Spec: ux_ui/feature_specv2/billing_page_md.md
// Mockup: assets/image/saas/billing_page_mockup.png

import { useState, useEffect } from "react";
import Link from "next/link";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface BillingStatus {
  plan:               string;
  subscription_status: string;
  trial_ends_at:      string | null;
  member_limit:       number;
  member_count:       number;
  trial_days_left:    number | null;
}

const PLAN_LABELS: Record<string, { label: string; color: string; price: string }> = {
  free:     { label: "Free",    color: "text-gray-500",   price: "$0/month"   },
  starter:  { label: "Starter", color: "text-blue-600",   price: "$49/month"  },
  pro:      { label: "Pro",     color: "text-primary-600", price: "$199/month" },
  enterprise:{ label: "Enterprise", color: "text-purple-600", price: "Custom" },
};

export default function BillingPage() {
  const [status,  setStatus]  = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    fetch("/api/billing/status").then((r) => r.json())
      .then((d) => setStatus(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    const priceMap: Record<string, string> = {
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "price_starter",
      pro:     process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID    ?? "price_pro",
    };
    const res  = await fetch("/api/billing/create-checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: priceMap[plan], orgId: "current" }),
    });
    const json = await res.json();
    if (json.data?.url) window.location.href = json.data.url;
  }

  const plan = PLAN_LABELS[status?.plan ?? "free"] ?? PLAN_LABELS.free;

  return (
    <OrgAdminLayout orgName="GreenFuture Org" plan="Pro Plan">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing &amp; Subscription</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your plan, payment method, and invoices.</p>
      </div>

      {/* Past due alert */}
      {status?.subscription_status === "past_due" && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 mb-5 flex justify-between items-center">
          <p className="text-sm text-red-700 font-medium">⚠️ Payment failed — update your payment method</p>
          <Button variant="danger" size="sm" onClick={openPortal} loading={opening}>Update Payment</Button>
        </div>
      )}

      {/* Trial banner */}
      {status?.subscription_status === "trialing" && (status.trial_days_left ?? 0) > 0 && (
        <div role="status" className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 mb-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-amber-700 font-semibold">
              🎁 {status.trial_days_left} days left in Pro trial
            </p>
            <Link href="/pricing"><Button variant="primary" size="sm">Upgrade</Button></Link>
          </div>
          <ProgressBar value={(14 - (status.trial_days_left ?? 0))} max={14} size="sm" colorClass="bg-amber-400" />
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Plan</p>
            <h3 className={cn("text-3xl font-bold", plan.color)}>{plan.label}</h3>
            <p className="text-gray-500 text-sm mt-1">{plan.price}</p>
          </div>
          <Badge color={
            status?.subscription_status === "active"   ? "green" :
            status?.subscription_status === "past_due" ? "red"   :
            status?.subscription_status === "trialing" ? "amber" : "gray"
          }>
            {status?.subscription_status ?? "free"}
          </Badge>
        </div>
        <ProgressBar
          value={status?.member_count ?? 0}
          max={status?.member_limit ?? 50}
          showLabel label={`${status?.member_count ?? 0} / ${status?.member_limit ?? 50} members`}
          size="md"
        />
      </div>

      {/* Upgrade options */}
      {(status?.plan === "free" || status?.plan === "starter") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {status.plan !== "starter" && (
            <button onClick={() => upgrade("starter")}
              className="border-2 border-primary-500 text-primary-600 font-semibold py-4 rounded-xl hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none text-sm">
              Upgrade to Starter — $49/mo
            </button>
          )}
          <button onClick={() => upgrade("pro")}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none text-sm">
            Upgrade to Pro — $199/mo
          </button>
        </div>
      )}

      {/* Manage payment */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment &amp; Invoices</h3>
        <Button variant="outline" size="md" onClick={openPortal} loading={opening}>
          Manage Payment Method &amp; Download Invoices →
        </Button>
        <p className="text-xs text-gray-400 mt-3">Opens Stripe&apos;s secure customer portal</p>
      </div>
    </OrgAdminLayout>
  );
}
