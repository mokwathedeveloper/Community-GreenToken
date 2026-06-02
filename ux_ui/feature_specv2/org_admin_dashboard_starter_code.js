// Org Admin Dashboard — Community GreenToken
// Route: /org/admin  (owner or admin role)
import { useEffect, useState } from 'react';
import { useOrg } from '../hooks/useOrg';

const MOCK_STATS = [
  { label: 'Members',       value: '4,823', icon: '👥', note: '/ 5,000 limit' },
  { label: 'Tokens Minted', value: '142,500', icon: '🪙', note: 'total' },
  { label: 'Actions (30d)', value: '1,205', icon: '♻️', note: 'this month' },
  { label: 'Verify Rate',   value: '78%', icon: '✅', note: 'of submissions' },
];

const MOCK_QUEUE = [
  { id: 1, user: 'Alice M.', type: 'Recycling',     date: '2026-06-02', tokens: 10 },
  { id: 2, user: 'Bob K.',   type: 'Tree Planting',  date: '2026-06-02', tokens: 20 },
  { id: 3, user: 'Carol N.', type: 'Carpooling',     date: '2026-06-01', tokens: 15 },
];

export default function OrgAdminDashboard() {
  const { tokenName, plan, memberLimit } = useOrg?.() || { tokenName: 'GreenToken', plan: 'pro', memberLimit: 5000 };
  const [queue, setQueue]   = useState(MOCK_QUEUE);
  const [activeTab, setActiveTab] = useState('overview');

  function verify(id) { setQueue(q => q.filter(a => a.id !== id)); }
  function reject(id) { setQueue(q => q.filter(a => a.id !== id)); }

  const tabs = ['overview', 'members', 'actions', 'rewards', 'analytics', 'billing', 'settings'];

  return (
    <main className="min-h-screen bg-bg-page">
      {/* Trial/Plan banner */}
      {plan === 'trialing' && (
        <div role="alert" className="bg-amber-400 text-white text-sm text-center py-2 px-4">
          ⏳ Trial ends in 8 days — <a href="/org/admin/billing" className="underline font-medium">Upgrade now</a>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">🌿 {tokenName} Admin</h1>
            <p className="text-sm text-text-secondary">Manage your GreenToken program</p>
          </div>
          <button onClick={() => window.location.href = '/org/admin/members'}
            className="bg-primary text-white text-sm px-5 py-2.5 rounded-lg hover:bg-primary-dark transition">
            + Invite Members
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_STATS.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-text-dark">{s.value}</div>
              <p className="text-xs text-text-secondary mt-0.5">{s.label} <span className="text-gray-400">{s.note}</span></p>
            </div>
          ))}
        </div>

        {/* Member usage bar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between text-sm font-medium text-text-dark mb-2">
            <span>Member Capacity</span>
            <span>4,823 / {memberLimit?.toLocaleString() || '5,000'}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-primary h-3 rounded-full" style={{ width: '96.5%' }} />
          </div>
          <p className="text-xs text-amber-500 mt-2">⚠️ Approaching plan limit — <a href="/org/admin/billing" className="underline">upgrade to Pro</a></p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition whitespace-nowrap
                ${activeTab === t ? 'bg-white text-text-dark shadow-sm' : 'text-text-secondary hover:text-text-dark'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Action verification queue */}
        {activeTab === 'actions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 font-semibold text-text-dark">
              Pending Verification ({queue.length})
            </div>
            {queue.length === 0
              ? <p className="text-center text-text-secondary py-10">No pending actions 🎉</p>
              : queue.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-text-dark">{a.type} — {a.user}</p>
                      <p className="text-xs text-text-secondary">{a.date} · {a.tokens} tokens</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => verify(a.id)} aria-label={`Approve ${a.type} by ${a.user}`}
                        className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary-dark transition">✅ Approve</button>
                      <button onClick={() => reject(a.id)} aria-label={`Reject ${a.type} by ${a.user}`}
                        className="border border-red-300 text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition">✗ Reject</button>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-text-secondary text-sm text-center py-12">
            Welcome to your Admin Dashboard. Select a tab above to manage members, actions, or billing.
          </div>
        )}
      </div>
    </main>
  );
}
