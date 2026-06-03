"use client";

// Rules: R-FE-01, R-A11Y-08 (table scope+caption), R-A11Y-01
// Spec: ux_ui/feature_specv2/org_members_page_md.md

import { useState } from "react";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const MOCK_MEMBERS = [
  { id: "1", name: "Alice Mokoena",  email: "alice@example.com",  role: "admin"  as const, balance: 1250, actions: 42, joined: "2026-01-15" },
  { id: "2", name: "Bob Khumalo",    email: "bob@example.com",    role: "member" as const, balance: 890,  actions: 31, joined: "2026-02-03" },
  { id: "3", name: "Carol Nkosi",    email: "carol@example.com",  role: "member" as const, balance: 640,  actions: 18, joined: "2026-03-12" },
  { id: "4", name: "David Sithole",  email: "david@example.com",  role: "member" as const, balance: 320,  actions: 9,  joined: "2026-04-20" },
];

const ROLE_COLORS = { owner: "bg-yellow-100 text-yellow-700", admin: "bg-blue-100 text-blue-700", member: "bg-gray-100 text-gray-600" } as const;

export default function MembersPage() {
  const [members,     setMembers]     = useState(MOCK_MEMBERS);
  const [search,      setSearch]      = useState("");
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending,     setSending]     = useState(false);
  const INVITE_LINK = "capetown.greentoken.app/join/abc123def456";

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  function changeRole(id: string, role: "admin" | "member") {
    setMembers((ms) => ms.map((m) => m.id === id ? { ...m, role } : m));
  }

  async function sendInvite() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setShowInvite(false);
    setInviteEmail("");
  }

  return (
    <OrgAdminLayout orgName="GreenFuture Org" plan="Pro Plan">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your organization&apos;s team members.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowInvite(true)} icon={<span>+</span>}>
          Invite Members
        </Button>
      </div>

      {/* Member limit */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <ProgressBar value={members.length} max={500} size="sm" showLabel label="Members used" />
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input id="member-search" placeholder="Search by name or email…"
          value={search} onChange={(e) => setSearch(e.target.value)} label="" />
      </div>

      {/* Table — R-A11Y-08 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Organization member list</caption>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Role", "Token Balance", "Actions", "Joined", "Manage"].map((h) => (
                <th key={h} scope="col" className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", ROLE_COLORS[m.role])}>{m.role}</span>
                </td>
                <td className="px-5 py-3.5 font-medium text-primary-600">{m.balance.toLocaleString()} GTK</td>
                <td className="px-5 py-3.5 text-gray-600">{m.actions}</td>
                <td className="px-5 py-3.5 text-xs text-gray-400">{m.joined}</td>
                <td className="px-5 py-3.5">
                  <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as "admin" | "member")}
                    aria-label={`Change role for ${m.name}`}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Members">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Share this invite link:</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs font-mono text-gray-700 flex-1 truncate">{INVITE_LINK}</span>
              <button onClick={() => navigator.clipboard?.writeText(INVITE_LINK)}
                className="text-primary-600 text-xs font-medium flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">📋</button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Expires in 7 days</p>
          </div>
          <div>
            <Input id="invite-email" type="email" label="Or invite by email:" placeholder="email@example.com"
              value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <Button variant="primary" size="md" fullWidth loading={sending} onClick={sendInvite}>Send Invite</Button>
        </div>
      </Modal>
    </OrgAdminLayout>
  );
}
