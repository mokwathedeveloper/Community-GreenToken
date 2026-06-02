// Org Member Management Page — Community GreenToken
// Route: /org/admin/members  (owner or admin role)
import { useState } from 'react';

const MOCK_MEMBERS = [
  { id: 1, name: 'Alice Mokoena',  email: 'alice@example.com', role: 'admin',  balance: 1250, actions: 42, joined: '2026-01-15' },
  { id: 2, name: 'Bob Khumalo',    email: 'bob@example.com',   role: 'member', balance: 890,  actions: 31, joined: '2026-02-03' },
  { id: 3, name: 'Carol Nkosi',    email: 'carol@example.com', role: 'member', balance: 640,  actions: 18, joined: '2026-03-12' },
  { id: 4, name: 'David Sithole',  email: 'david@example.com', role: 'member', balance: 320,  actions: 9,  joined: '2026-04-20' },
];

const ROLE_COLORS = { owner: 'bg-yellow-100 text-yellow-700', admin: 'bg-blue-100 text-blue-700', member: 'bg-gray-100 text-gray-600' };

export default function MembersPage() {
  const [members, setMembers]   = useState(MOCK_MEMBERS);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink] = useState('capetown.greentoken.app/join/abc123def456');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  function changeRole(id, role) {
    setMembers(ms => ms.map(m => m.id === id ? {...m, role} : m));
  }

  function removeMember(id) {
    if (!confirm('Remove this member?')) return;
    setMembers(ms => ms.filter(m => m.id !== id));
  }

  function toggleSelect(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Members</h1>
          <p className="text-sm text-text-secondary">{members.length} / 5,000 members</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="bg-primary text-white text-sm px-5 py-2.5 rounded-lg hover:bg-primary-dark transition">
          + Invite Members
        </button>
      </div>

      {/* Member limit bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-1.5">
          <span>Members used</span><span>{members.length} / 5,000</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${(members.length/5000)*100}%` }} />
        </div>
      </div>

      {/* Search + bulk */}
      <div className="flex items-center gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => { selected.forEach(id => changeRole(id,'admin')); setSelected([]); }}
              className="text-xs border px-3 py-2 rounded-lg hover:bg-gray-50">Set as Admin</button>
            <button onClick={() => { selected.forEach(removeMember); setSelected([]); }}
              className="text-xs border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50">Remove Selected</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Organization member list</caption>
          <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
            <tr>
              <th className="pl-6 pr-2 py-3 text-left w-8">
                <input type="checkbox" onChange={e => setSelected(e.target.checked ? filtered.map(m=>m.id) : [])} />
              </th>
              {['Name', 'Role', 'Token Balance', 'Actions', 'Joined', 'Manage'].map(h => (
                <th key={h} scope="col" className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="pl-6 pr-2 py-4">
                  <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggleSelect(m.id)} />
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-text-dark">{m.name}</p>
                  <p className="text-xs text-text-secondary">{m.email}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-primary">{m.balance.toLocaleString()}</td>
                <td className="px-4 py-4 text-text-secondary">{m.actions}</td>
                <td className="px-4 py-4 text-text-secondary text-xs">{m.joined}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <select value={m.role} onChange={e => changeRole(m.id, e.target.value)}
                      aria-label={`Change role for ${m.name}`}
                      className="text-xs border rounded px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none">
                      {['admin','member'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={() => removeMember(m.id)} className="text-xs text-red-400 hover:underline">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-dark mb-4">Invite Members</h3>
            <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2 border border-green-200 mb-4">
              <span className="text-xs font-mono text-text-dark flex-1 truncate">{inviteLink}</span>
              <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="text-primary text-xs font-medium">Copy</button>
            </div>
            <p className="text-xs text-text-secondary mb-4">Link expires in 7 days</p>
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              <button className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-dark">Send</button>
            </div>
            <button onClick={() => setShowInvite(false)} className="w-full text-text-secondary text-sm mt-4 hover:underline">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
