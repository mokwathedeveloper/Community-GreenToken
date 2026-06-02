// Super Admin Dashboard — Community GreenToken
// Route: /admin  (superadmin role only)
import { useState } from 'react';

const MOCK_ORGS = [
  { id: 1, name: 'Cape Town Council', plan: 'pro',     members: 4823, mrr: 199, status: 'active' },
  { id: 2, name: 'Wits University',   plan: 'pro',     members: 812,  mrr: 199, status: 'active' },
  { id: 3, name: 'Pick n Pay',        plan: 'starter', members: 234,  mrr: 49,  status: 'past_due' },
  { id: 4, name: 'Demo School',       plan: 'free',    members: 47,   mrr: 0,   status: 'trialing' },
];

const PLATFORM_STATS = [
  { label: 'Active Orgs',    value: '47',      icon: '🏢' },
  { label: 'MRR',            value: '$8,750',  icon: '💰' },
  { label: 'Total Members',  value: '23,400',  icon: '👥' },
  { label: 'Platform Uptime',value: '99.8%',   icon: '🟢' },
];

const STATUS_COLORS = {
  active:   'bg-green-100 text-green-700',
  trialing: 'bg-blue-100 text-blue-700',
  past_due: 'bg-amber-100 text-amber-700',
  canceled: 'bg-red-100 text-red-700',
};

export default function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState(MOCK_ORGS);
  const [sortBy, setSortBy] = useState('mrr');

  const sorted = [...orgs].sort((a, b) => b[sortBy] - a[sortBy]);

  function suspendOrg(id) {
    if (!confirm('Suspend this organization?')) return;
    setOrgs(o => o.map(org => org.id === id ? {...org, status: 'suspended'} : org));
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Dark sidebar */}
      <aside className="w-56 bg-gray-950 flex flex-col py-6 px-4 space-y-2 flex-shrink-0">
        <div className="text-primary font-bold text-lg mb-6 px-2">🌿 GT Admin</div>
        {['Overview', 'Organizations', 'Billing', 'Contracts', 'Settings'].map(t => (
          <a key={t} href="#" className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition">{t}</a>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Platform Overview</h1>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PLATFORM_STATS.map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Organizations table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="font-semibold">All Organizations</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              Sort by:
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-gray-700 border-0 rounded px-2 py-1 text-white text-xs">
                <option value="mrr">MRR</option>
                <option value="members">Members</option>
              </select>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-xs uppercase">
              <tr>
                {['Organization', 'Plan', 'Members', 'MRR', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(org => (
                <tr key={org.id} className="border-t border-gray-700 hover:bg-gray-750 transition cursor-pointer">
                  <td className="px-6 py-4 font-medium">{org.name}</td>
                  <td className="px-6 py-4 capitalize text-gray-300">{org.plan}</td>
                  <td className="px-6 py-4 text-gray-300">{org.members.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">${org.mrr}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[org.status] || 'bg-gray-700 text-gray-300'}`}>
                      {org.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a href={`/admin/orgs/${org.id}`} className="text-blue-400 text-xs hover:underline">View</a>
                      <button onClick={() => suspendOrg(org.id)} className="text-red-400 text-xs hover:underline">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
