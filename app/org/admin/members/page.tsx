"use client";

/**
 * /org/admin/members
 *
 * INVITE FLOW:
 * ─────────────────────────────────────────────────────────────
 *  Admin → types email + picks role → clicks "Send Invite"
 *    ↓
 *  POST /api/invites/email
 *    ↓
 *  Supabase sends one-time magic link to the user's email
 *    ↓
 *  User clicks link → lands on /join/[token]
 *    ↓
 *  Signs up (new) or signs in (existing)
 *    ↓
 *  POST /api/invites/[token]/accept → added to org_members
 *    ↓
 *  Redirected to /dashboard ✅
 *
 * Admin can also:
 *  • Copy a shareable invite link (for WhatsApp/Slack etc.)
 *  • See all pending invites and revoke them
 *  • Change member roles in-table
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import OrgAdminLayout from "@/components/layouts/OrgAdminLayout";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

type MemberRole = "owner" | "admin" | "member";

type Member = {
  id:        string;
  user_id:   string;
  role:      MemberRole;
  joined_at: string;
  users:     { display_name: string | null; email: string | null } | null;
};

type PendingInvite = {
  id:         string;
  token:      string;
  email:      string;
  role:       MemberRole;
  expires_at: string;
  sent_at:    string;
};

const ROLE_STYLE: Record<MemberRole, string> = {
  owner:  "bg-amber-100 text-amber-700",
  admin:  "bg-blue-100  text-blue-700",
  member: "bg-gray-100  text-gray-600",
};

export default function MembersPage() {
  const { show: showToast, node: toastNode } = useToast();
  const { orgId, orgName, isLoading: userLoading } = useUser();

  const [members,      setMembers]      = useState<Member[]>([]);
  const [invites,      setInvites]      = useState<PendingInvite[]>([]);
  const [memberLimit,  setMemberLimit]  = useState<number | null>(500);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showInvite,   setShowInvite]   = useState(false);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviteRole,   setInviteRole]   = useState<MemberRole>("member");
  const [sending,      setSending]      = useState(false);
  const [linkCopied,   setLinkCopied]   = useState(false);
  const [activeTab,    setActiveTab]    = useState<"members" | "invites">("members");

  const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const loadData = useCallback(() => {
    if (!orgId) return;
    Promise.all([
      fetch(`/api/orgs/${orgId}/members?limit=50`).then((r) => r.json()),
      fetch("/api/invites/email").then((r) => r.json()),
      fetch(`/api/orgs/${orgId}/usage`).then((r) => r.json()),
    ]).then(([membersRes, invitesRes, usageRes]) => {
      setMembers(membersRes.data ?? []);
      setInvites(invitesRes.data ?? []);
      if (usageRes?.data?.member_limit) setMemberLimit(usageRes.data.member_limit);
    }).catch(console.error).finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => { if (!userLoading) loadData(); }, [userLoading, loadData]);

  const filtered = members.filter((m) => {
    const name  = m.users?.display_name ?? "";
    const email = m.users?.email ?? "";
    const q     = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  async function changeRole(memberId: string, userId: string, role: MemberRole) {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/members/${userId}/role`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error?.message ?? "Role change failed.", "error");
        return;
      }
      setMembers((ms) => ms.map((m) => m.id === memberId ? { ...m, role } : m));
      showToast("Role updated successfully.", "success");
    } catch {
      showToast("Network error. Please try again.", "error");
    }
  }

  async function sendEmailInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) { showToast("Please enter an email address.", "error"); return; }
    setSending(true);
    try {
      const res  = await fetch("/api/invites/email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: inviteEmail, role: inviteRole, expiresInDays: 7 }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error?.message ?? "Failed to send invite.", "error");
        return;
      }
      // Add to pending invites list
      setInvites((inv) => [{
        id:         json.data.inviteToken,
        token:      json.data.inviteToken,
        email:      inviteEmail,
        role:       inviteRole,
        expires_at: json.data.expiresAt,
        sent_at:    new Date().toISOString(),
        status:     "pending" as const,
      }, ...inv]);
      showToast(`Invite sent to ${inviteEmail}! They will receive a one-time login link. 📧`, "success");
      setInviteEmail("");
      setInviteRole("member");
      setShowInvite(false);
      setActiveTab("invites");
    } catch {
      showToast("Could not send invite. Please try again.", "error");
    } finally {
      setSending(false);
    }
  }

  async function generateShareableLink() {
    try {
      const res  = await fetch("/api/invites/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: "member", expiresInDays: 7 }),
      });
      const json = await res.json();
      if (!res.ok) { showToast("Could not generate link.", "error"); return; }
      const link = `${appUrl}/join/${json.data.token}`;
      await navigator.clipboard?.writeText(link);
      setLinkCopied(true);
      showToast("Shareable link copied to clipboard!", "success");
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      showToast("Could not generate link.", "error");
    }
  }

  async function revokeInvite(token: string, email: string) {
    if (!confirm(`Revoke invite for ${email}?`)) return;
    try {
      await fetch(`/api/invites/email?token=${token}`, { method: "DELETE" });
      setInvites((inv) => inv.filter((i) => i.token !== token));
      showToast("Invite revoked.", "info");
    } catch {
      showToast("Could not revoke invite.", "error");
    }
  }

  return (
    <OrgAdminLayout orgName={orgName ?? "Your Org"} plan="Pro Plan">
      {toastNode}

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your organization&apos;s team and send invitations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateShareableLink} icon={<span>🔗</span>}>
            {linkCopied ? "Copied!" : "Copy Invite Link"}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowInvite(true)} icon={<span>✉️</span>}>
            Invite by Email
          </Button>
        </div>
      </div>

      {/* HOW IT WORKS — invite flow explanation */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-5">
        <h3 className="text-xs font-bold text-primary-800 uppercase tracking-wide mb-3">How User Admission Works</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: "1", icon: "✉️", title: "Admin Sends Invite",    desc: "Enter email + role → system sends a one-time magic link" },
            { step: "2", icon: "📩", title: "User Gets Email",       desc: "User receives an email with a one-time secure link (OTP)" },
            { step: "3", icon: "🔐", title: "User Signs Up/In",      desc: "User clicks link → signs up or logs in on the join page" },
            { step: "4", icon: "✅", title: "Auto-Joined to Org",    desc: "User is automatically added to the org with assigned role" },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-800">{icon} {title}</p>
                <p className="text-xs text-primary-600 mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member limit progress */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-bold text-gray-900">{members.length}</span> of {memberLimit ?? "∞"} members used
          </p>
          <Link href="/org/admin/billing">
            <Button variant="outline" size="xs">Upgrade Plan</Button>
          </Link>
        </div>
        {memberLimit && <ProgressBar value={members.length} max={memberLimit} size="sm" />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
        {(["members", "invites"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {tab === "invites"
              ? `Pending Invites (${invites.filter((i) => i.status === "pending").length})`
              : `Members (${members.length})`}
          </button>
        ))}
      </div>

      {/* ── MEMBERS TABLE ── */}
      {activeTab === "members" && (
        <>
          <div className="mb-3">
            <Input id="member-search" placeholder="Search by name or email…"
              value={search} onChange={(e) => setSearch(e.target.value)} label="" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <p className="text-center text-sm text-gray-400 py-8">Loading members…</p>
            ) : (
              <table className="w-full text-sm">
                <caption className="sr-only">Organization member list</caption>
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Member", "Role", "Joined", "Manage"].map((h) => (
                      <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((m) => {
                    const name  = m.users?.display_name ?? m.users?.email?.split("@")[0] ?? "Unknown";
                    const email = m.users?.email ?? "";
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{name}</p>
                              <p className="text-xs text-gray-400">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", ROLE_STYLE[m.role])}>
                            {m.role === "admin" ? "🛡️ Admin" : m.role === "owner" ? "🏢 Owner" : "🌿 Member"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">
                          {new Date(m.joined_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          {m.role !== "owner" ? (
                            <select value={m.role}
                              onChange={(e) => changeRole(m.id, m.user_id, e.target.value as MemberRole)}
                              aria-label={`Change role for ${name}`}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:outline-none">
                              <option value="admin">Make Admin</option>
                              <option value="member">Make Member</option>
                            </select>
                          ) : (
                            <span className="text-xs text-gray-400">Owner</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loading && filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                {search ? "No members match your search." : "No members yet. Send your first invite!"}
              </p>
            )}
          </div>
        </>
      )}

      {/* ── PENDING INVITES TABLE ── */}
      {activeTab === "invites" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {invites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-sm text-gray-500">No invites sent yet.</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowInvite(true)}>Send First Invite</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Pending and expired invitations</caption>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Email", "Role", "Status", "Expires", "Sent", "Action"].map((h) => (
                    <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invites.map((inv) => {
                  const isExpired = new Date(inv.expires_at) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900">{inv.email}</p>
                        <p className="text-xs text-gray-400 font-mono">{inv.token.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", ROLE_STYLE[inv.role])}>
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color={isExpired ? "red" : "green"} dot>
                          {isExpired ? "Expired" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(inv.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {inv.sent_at ? new Date(inv.sent_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 flex items-center gap-2">
                        {!isExpired && (
                          <button
                            onClick={async () => {
                              const link = `${appUrl}/join/${inv.token}`;
                              await navigator.clipboard?.writeText(link);
                              showToast("Link copied!", "success");
                            }}
                            className="text-xs text-primary-600 hover:underline">
                            Copy Link
                          </button>
                        )}
                        <button
                          onClick={() => revokeInvite(inv.token, inv.email)}
                          className="text-xs text-red-500 hover:underline">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── INVITE MODAL ── */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)}
        title="Invite Member by Email"
        description="The user will receive a secure one-time magic link by email. When they click it, they are automatically added to your organization.">

        <form onSubmit={sendEmailInvite} noValidate className="space-y-4 mt-2">

          {/* Role explanation */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: "member", icon: "🌿", label: "Member",   desc: "Submit actions, earn GTK, redeem rewards" },
              { role: "admin",  icon: "🛡️", label: "Admin",    desc: "Verify actions, manage members, view analytics" },
            ].map(({ role, icon, label, desc }) => (
              <button
                key={role}
                type="button"
                onClick={() => setInviteRole(role as MemberRole)}
                className={cn(
                  "text-left border-2 rounded-xl p-3 transition-all",
                  inviteRole === role ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200"
                )}>
                <p className="text-sm font-semibold text-gray-900">{icon} {label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
              </button>
            ))}
          </div>

          <Input id="invite-email" type="email" label="Email Address"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            hint="The user will receive a one-time secure link valid for 7 days."
            required />

          {/* What happens info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-blue-800 mb-1">What happens next:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>User receives email with a one-time login link</li>
              <li>They click the link → sign up or sign in</li>
              <li>They are automatically added as <strong>{inviteRole}</strong></li>
              <li>Link expires in 7 days and can only be used once</li>
            </ol>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="md" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth loading={sending} icon={<span>📩</span>}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

    </OrgAdminLayout>
  );
}
