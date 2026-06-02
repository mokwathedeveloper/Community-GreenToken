// Billing Page — Community GreenToken
// Route: /org/admin/billing  (owner role only)
import { useState, useEffect } from 'react';

const PLAN_INFO = {
  free:     { label: 'Free',    price: '$0/month',   color: 'text-gray-500' },
  starter:  { label: 'Starter', price: '$49/month',  color: 'text-blue-600' },
  pro:      { label: 'Pro',     price: '$199/month', color: 'text-primary'  },
  trialing: { label: 'Pro Trial', price: 'Free (14 days)', color: 'text-amber-600' },
};

export default function BillingPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/status')
      .then(r => r.json())
      .then(d => { setStatus(d); setLoading(false); });
  }, []);

  async function openPortal() {
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
  }

  async function upgrade(plan) {
    const priceMap = { starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID, pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID };
    const res = await fetch('/api/billing/create-checkout', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ priceId: priceMap[plan] }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  if (loading) return <div className="p-12 text-center text-text-secondary">Loading billing info…</div>;
  const plan = PLAN_INFO[status?.plan] || PLAN_INFO.free;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-text-dark mb-8">Billing & Subscription</h1>

      {/* Past due banner */}
      {status?.subscription_status === 'past_due' && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
          <p className="text-red-700 text-sm font-medium">⚠️ Payment failed — update your payment method to keep access</p>
          <button onClick={openPortal} className="text-red-600 text-sm font-semibold underline">Update now</button>
        </div>
      )}

      {/* Current plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-secondary mb-1">Current Plan</p>
            <h2 className={`text-2xl font-bold ${plan.color}`}>{plan.label}</h2>
            <p className="text-text-secondary text-sm mt-1">{plan.price}</p>
            {status?.trial_ends_at && (
              <p className="text-amber-600 text-xs mt-2 font-medium">
                Trial ends: {new Date(status.trial_ends_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium
            ${status?.subscription_status === 'active' ? 'bg-green-100 text-green-700'
              : status?.subscription_status === 'past_due' ? 'bg-red-100 text-red-600'
              : 'bg-amber-100 text-amber-700'}`}>
            {status?.subscription_status?.replace('_',' ') || 'active'}
          </span>
        </div>

        {/* Usage bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Members Used</span>
            <span>{status?.member_count?.toLocaleString()} / {status?.member_limit?.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(100,(status?.member_count/status?.member_limit)*100)||0}%` }} />
          </div>
        </div>
      </div>

      {/* Upgrade options */}
      {['free','starter','trialing'].includes(status?.plan) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {status?.plan !== 'starter' && (
            <button onClick={() => upgrade('starter')} className="border-2 border-primary text-primary font-medium py-4 rounded-xl hover:bg-green-50 transition text-sm">
              Upgrade to Starter — $49/mo
            </button>
          )}
          <button onClick={() => upgrade('pro')} className="bg-primary text-white font-medium py-4 rounded-xl hover:bg-primary-dark transition text-sm">
            Upgrade to Pro — $199/mo
          </button>
        </div>
      )}

      {/* Manage payment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-text-dark mb-4">Payment & Invoices</h3>
        <button onClick={openPortal} className="border border-gray-200 text-text-dark text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition">
          Manage Payment Method & View Invoices →
        </button>
        <p className="text-xs text-text-secondary mt-3">Opens Stripe's secure customer portal</p>
      </div>
    </main>
  );
}
