// Org Onboarding Wizard — Community GreenToken
// Route: /org/setup?step=1-5
import { useState } from 'react';
import { useRouter } from 'next/router';

const STEPS = ['Organization Profile', 'Token Config', 'Choose Plan', 'Deploy Contract', 'Invite Members'];

export default function OrgOnboardingPage() {
  const router   = useRouter();
  const step     = parseInt(router.query.step || '1', 10);
  const [org, setOrg]     = useState({ name: '', slug: '', type: 'school', tokenName: '', tokenSymbol: '', primaryColor: '#2ECC71' });
  const [slugOk, setSlugOk] = useState(null);
  const [saving, setSaving] = useState(false);

  async function checkSlug(val) {
    if (!val) { setSlugOk(null); return; }
    const res = await fetch(`/api/orgs/check-slug?slug=${val}`);
    const { available } = await res.json();
    setSlugOk(available);
  }

  async function nextStep() {
    setSaving(true);
    if (step === 1) await fetch('/api/orgs/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(org) });
    if (step === 2) await fetch(`/api/orgs/${router.query.orgId}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(org) });
    setSaving(false);
    router.push(`/org/setup?step=${step + 1}`);
  }

  return (
    <main className="min-h-screen bg-bg-page flex flex-col items-center py-12 px-4">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                ${i + 1 < step ? 'bg-primary text-white' : i + 1 === step ? 'bg-primary text-white ring-4 ring-green-100' : 'bg-gray-100 text-text-secondary'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className="text-xs text-text-secondary mt-1 text-center hidden sm:block">{s}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-text-dark mb-6">Step {step} of {STEPS.length} — {STEPS[step - 1]}</h2>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Organization Name *</label>
              <input value={org.name} onChange={e => setOrg({...org, name: e.target.value})}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Cape Town City Council" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subdomain *</label>
              <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <input value={org.slug} onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''); setOrg({...org, slug: v}); checkSlug(v); }}
                  className="flex-1 px-4 py-2.5 text-sm outline-none" placeholder="capetown" />
                <span className="px-3 text-sm text-text-secondary bg-gray-50 border-l py-2.5">.greentoken.app</span>
              </div>
              {slugOk === true  && <p className="text-xs text-primary mt-1">✓ Available</p>}
              {slugOk === false && <p className="text-xs text-red-500 mt-1">✗ Already taken</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization Type</label>
              <select value={org.type} onChange={e => setOrg({...org, type: e.target.value})}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                {['school','municipality','ngo','corporate','other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Token Name *</label>
              <input value={org.tokenName} onChange={e => setOrg({...org, tokenName: e.target.value})}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="CapeTownGreen" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Token Symbol * (3–5 uppercase)</label>
              <input value={org.tokenSymbol} onChange={e => setOrg({...org, tokenSymbol: e.target.value.toUpperCase().slice(0,5)})}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="CTG" maxLength={5} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={org.primaryColor} onChange={e => setOrg({...org, primaryColor: e.target.value})}
                  className="w-10 h-10 rounded cursor-pointer" />
                <input value={org.primaryColor} onChange={e => setOrg({...org, primaryColor: e.target.value})}
                  className="border rounded-lg px-4 py-2 text-sm w-32 focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <p className="text-text-secondary mb-4">Choose your plan on the pricing page.</p>
            <a href="/pricing" className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition">View Plans</a>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <p className="text-text-secondary">Deploy your organization's smart contract.</p>
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition">
              🚀 Deploy Contract
            </button>
            <p className="text-xs text-text-secondary">or use the shared contract (Free/Starter plans)</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-text-secondary">Share this invite link with your members:</p>
            <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-3 border border-green-200">
              <span className="text-sm font-mono flex-1 text-text-dark truncate">{org.slug}.greentoken.app/join/abc123</span>
              <button className="text-primary text-sm font-medium hover:underline">Copy</button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1
            ? <button onClick={() => router.push(`/org/setup?step=${step-1}`)} className="border border-gray-200 text-text-secondary px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">← Back</button>
            : <div />}
          {step < STEPS.length
            ? <button onClick={nextStep} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50">
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            : <button onClick={() => router.push('/org/admin')} className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-dark transition">
                🎉 Go Live!
              </button>}
        </div>
      </div>
    </main>
  );
}
