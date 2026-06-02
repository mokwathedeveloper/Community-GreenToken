// Org Settings Page — Community GreenToken
// Route: /org/admin/settings  (owner role only)
import { useState } from 'react';

const ACTION_TYPES_DEFAULT = [
  { id: 1, label: 'Recycling',        tokens: 10, enabled: true  },
  { id: 2, label: 'Tree Planting',    tokens: 20, enabled: true  },
  { id: 3, label: 'Carpooling',       tokens: 15, enabled: true  },
  { id: 4, label: 'Community Clean-up', tokens: 25, enabled: true },
  { id: 5, label: 'Energy Saving',    tokens: 10, enabled: false },
];

export default function OrgSettingsPage() {
  const [tab, setTab]       = useState('profile');
  const [org, setOrg]       = useState({ name: 'Cape Town Council', logo: null, email: 'admin@capetown.gov.za', tokenName: 'CapeTownGreen', tokenSymbol: 'CTG', primaryColor: '#2ECC71' });
  const [actions, setActions] = useState(ACTION_TYPES_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  async function save() {
    setSaving(true);
    await fetch('/api/orgs/update', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(org) });
    setSaving(false);
  }

  const tabs = ['profile', 'token', 'contract', 'danger zone'];

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text-dark mb-6">Organization Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition whitespace-nowrap
              ${tab === t ? 'bg-white text-text-dark shadow-sm' : 'text-text-secondary hover:text-text-dark'}
              ${t === 'danger zone' ? (tab === t ? 'text-red-600' : 'hover:text-red-500') : ''}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Organization Name</label>
            <input value={org.name} onChange={e => setOrg({...org, name: e.target.value})}
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Contact Email</label>
            <input type="email" value={org.email} onChange={e => setOrg({...org, email: e.target.value})}
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Logo</label>
            <input type="file" accept="image/*"
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-primary hover:file:bg-green-100" />
          </div>
          <button onClick={save} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Token tab */}
      {tab === 'token' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Token Name</label>
              <input value={org.tokenName} onChange={e => setOrg({...org, tokenName: e.target.value})}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Symbol (3–5 chars)</label>
              <input value={org.tokenSymbol} onChange={e => setOrg({...org, tokenSymbol: e.target.value.toUpperCase().slice(0,5)})}
                maxLength={5}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={org.primaryColor} onChange={e => setOrg({...org, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer" />
              <input value={org.primaryColor} onChange={e => setOrg({...org, primaryColor: e.target.value})}
                className="border rounded-lg px-4 py-2 text-sm w-32 focus:ring-2 focus:ring-primary focus:outline-none" />
              <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: org.primaryColor }} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-text-dark mb-3">Action Types & Token Rewards</p>
            <div className="space-y-2">
              {actions.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <input type="checkbox" checked={a.enabled} onChange={e => setActions(acts => acts.map((x,j) => j===i ? {...x, enabled: e.target.checked} : x))} />
                  <span className="flex-1 text-sm text-text-dark">{a.label}</span>
                  <input type="number" value={a.tokens} min={1} max={100}
                    onChange={e => setActions(acts => acts.map((x,j) => j===i ? {...x, tokens: +e.target.value} : x))}
                    className="w-16 border rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-primary focus:outline-none" />
                  <span className="text-xs text-text-secondary">tokens</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Token Config'}
          </button>
        </div>
      )}

      {/* Contract tab */}
      {tab === 'contract' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-text-dark">Smart Contract Info</h3>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-text-secondary space-y-2">
            <p><span className="text-text-dark">Address:</span> 0x1234...abcd (read-only)</p>
            <p><span className="text-text-dark">Network:</span> Stellar Testnet</p>
            <p><span className="text-text-dark">Token:</span> {org.tokenSymbol}</p>
          </div>
          <a href="#" className="text-primary text-sm hover:underline">View on Explorer →</a>
        </div>
      )}

      {/* Danger zone */}
      {tab === 'danger zone' && (
        <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50 space-y-4">
          <h3 className="text-red-700 font-semibold flex items-center gap-2">⚠️ Danger Zone</h3>
          <p className="text-red-600 text-sm">Deleting your organization permanently removes all members, tokens, and data. This cannot be undone.</p>
          <div>
            <label className="block text-sm font-medium text-red-700 mb-1">
              Type your org slug to confirm:
            </label>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="capetown"
              className="border border-red-300 rounded-lg px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
              aria-describedby="delete-warning" />
            <p id="delete-warning" className="text-xs text-red-500 mt-1">This action is permanent and irreversible.</p>
          </div>
          <button
            disabled={deleteConfirm !== 'capetown'}
            className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Delete Organization
          </button>
        </div>
      )}
    </main>
  );
}
