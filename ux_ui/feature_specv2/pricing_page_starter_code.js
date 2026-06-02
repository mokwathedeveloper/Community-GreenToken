// Pricing Page — Community GreenToken
// Route: /pricing  (publicly accessible)
import { useState } from 'react';
import { useRouter } from 'next/router';

const PLANS = [
  {
    name: 'Free', price: { monthly: 0, annual: 0 }, highlight: false,
    members: '50', actions: '3 types',
    features: ['Community leaderboard', 'Basic dashboard', '14-day Pro trial', 'Email support'],
    cta: 'Start Free', href: '/org/setup',
  },
  {
    name: 'Starter', price: { monthly: 49, annual: 490 }, highlight: false,
    members: '500', actions: '10 types',
    features: ['Everything in Free', 'Analytics dashboard', 'Custom token name + symbol', 'Priority email support'],
    cta: 'Get Started', priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  },
  {
    name: 'Pro', price: { monthly: 199, annual: 1990 }, highlight: true,
    members: '5,000', actions: 'Unlimited',
    features: ['Everything in Starter', 'White-label branding', 'API access', 'Per-org smart contract', 'Priority support'],
    cta: 'Get Started', priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  {
    name: 'Enterprise', price: { monthly: null, annual: null }, highlight: false,
    members: 'Unlimited', actions: 'Custom',
    features: ['Everything in Pro', 'Dedicated contract', 'SLA guarantee', 'Custom integrations', 'Onboarding call'],
    cta: 'Contact Us', href: 'mailto:hello@greentoken.app',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const router = useRouter();

  async function handleSelect(plan) {
    if (plan.href) { window.location.href = plan.href; return; }
    const res = await fetch('/api/billing/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: annual ? plan.priceId + '_annual' : plan.priceId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <main className="bg-bg-page min-h-screen">
      {/* Hero */}
      <section className="py-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm px-4 py-1.5 rounded-full mb-4">
          🎁 14-day Pro trial — no credit card required
        </div>
        <h1 className="text-4xl font-bold text-text-dark mb-3">Simple, Transparent Pricing</h1>
        <p className="text-text-secondary max-w-lg mx-auto">One platform, every scale. Start free and upgrade as your community grows.</p>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm font-medium ${!annual ? 'text-text-dark' : 'text-text-secondary'}`}>Monthly</span>
          <button
            role="switch" aria-checked={annual}
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition ${annual ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-text-dark' : 'text-text-secondary'}`}>
            Annual <span className="text-accent text-xs font-bold ml-1">Save 17%</span>
          </span>
        </div>
      </section>

      {/* Plan cards */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 border-2 flex flex-col transition hover:shadow-lg
                ${plan.highlight ? 'border-primary shadow-md' : 'border-gray-100'}`}
            >
              {plan.highlight && (
                <div className="text-center mb-3">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-text-dark">{plan.name}</h3>
              <div className="my-4">
                {plan.price.monthly === null
                  ? <p className="text-3xl font-bold text-text-dark">Custom</p>
                  : plan.price.monthly === 0
                    ? <p className="text-3xl font-bold text-primary">Free</p>
                    : <p className="text-3xl font-bold text-text-dark">
                        ${annual ? Math.round(plan.price.annual / 12) : plan.price.monthly}
                        <span className="text-sm text-text-secondary font-normal">/mo</span>
                      </p>
                }
              </div>
              <p className="text-sm text-text-secondary mb-1">Up to <strong>{plan.members}</strong> members</p>
              <p className="text-sm text-text-secondary mb-4">{plan.actions} action types</p>
              <ul className="space-y-2 text-sm text-text-secondary flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(plan)}
                className={`w-full py-3 rounded-lg font-medium transition
                  ${plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'border border-primary text-primary hover:bg-green-50'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
