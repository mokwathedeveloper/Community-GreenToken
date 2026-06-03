"use client";

import { useState, type FormEvent, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ROLE_META = {
  superadmin: { label: "Super Admin",  color: "bg-purple-100 text-purple-700 border-purple-200", icon: "👑" },
  owner:      { label: "Org Owner",    color: "bg-amber-100  text-amber-700  border-amber-200",  icon: "🏢" },
  admin:      { label: "Org Admin",    color: "bg-blue-100   text-blue-700   border-blue-200",   icon: "🛡️" },
  member:     { label: "Member",       color: "bg-green-100  text-green-700  border-green-200",  icon: "🌿" },
} as const;

export default function ProfilePage() {
  const { user, role, orgName, displayName, avatarUrl, isLoading } = useUser();
  const { show: showToast, node: toastNode } = useToast();

  const [name,        setName]        = useState("");
  const [wallet,      setWallet]      = useState("");
  const [saving,      setSaving]      = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [pwdLoading,  setPwdLoading]  = useState(false);

  // Populate form from live user data once loaded
  useEffect(() => {
    if (displayName) setName(displayName);
  }, [displayName]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { showToast("Name cannot be empty.", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();

      // Update auth user metadata (display_name shown in UserMenu)
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { display_name: name.trim() },
      });
      if (metaErr) { showToast(metaErr.message, "error"); return; }

      // Update public.users profile row
      if (user?.id) {
        await (supabase as any)
          .from("users")
          .update({
            display_name:   name.trim(),
            wallet_address: wallet.trim() || null,
            updated_at:     new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      showToast("Profile updated successfully! ✅", "success");
    } catch {
      showToast("Could not save profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPwd.length < 8) { showToast("New password must be at least 8 characters.", "error"); return; }
    if (newPwd !== confirmPwd) { showToast("New passwords do not match.", "error"); return; }
    setPwdLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) { showToast(error.message, "error"); return; }
      showToast("Password changed successfully! 🔐", "success");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setChangingPwd(false);
    } catch {
      showToast("Could not change password. Please try again.", "error");
    } finally {
      setPwdLoading(false);
    }
  }

  const roleMeta = role ? ROLE_META[role] : null;
  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (isLoading) {
    return (
      <AppLayout title="My Profile">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Profile">
      {toastNode}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and account settings.</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          {/* Avatar + identity */}
          <div className="flex items-center gap-5 px-6 py-6 border-b border-gray-50">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName ?? "Avatar"}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-50" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold ring-4 ring-primary-50">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">{displayName ?? "User"}</h3>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {roleMeta && (
                  <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border", roleMeta.color)}>
                    <span aria-hidden="true">{roleMeta.icon}</span>
                    {roleMeta.label}
                  </span>
                )}
                {orgName && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    📍 {orgName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSaveProfile} noValidate className="px-6 py-6 space-y-4">
            <Input
              id="profile-name"
              label="Display Name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if needed.</p>
            </div>
            <Input
              id="profile-wallet"
              label="Stellar Wallet Address (optional)"
              placeholder="G…"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              hint="Connect your Stellar wallet to earn and redeem GTK tokens on-chain."
            />
            <Button type="submit" variant="primary" size="md" loading={saving} icon={<span>💾</span>}>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "User ID",      value: user?.id ? user.id.slice(0, 8) + "…" : "—" },
              { label: "Account Type", value: roleMeta?.label ?? "Member"        },
              { label: "Organization", value: orgName ?? "No organization yet"    },
              { label: "Member Since", value: (() => {
                  const ts = (user as any)?.created_at as string | undefined;
                  return ts ? new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—";
              })() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Password</h3>
              <p className="text-xs text-gray-400 mt-0.5">Keep your account secure with a strong password.</p>
            </div>
            {!changingPwd && (
              <Button variant="outline" size="sm" onClick={() => setChangingPwd(true)}>
                Change Password
              </Button>
            )}
          </div>

          {changingPwd && (
            <form onSubmit={handleChangePassword} noValidate className="space-y-3 border-t border-gray-50 pt-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <input id="new-password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min. 8 characters" required minLength={8}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input id="confirm-password" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Repeat new password" required
                  className={cn("w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors",
                    confirmPwd && newPwd !== confirmPwd ? "border-red-300 bg-red-50" : "border-gray-200"
                  )} />
                {confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setChangingPwd(false); setNewPwd(""); setConfirmPwd(""); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={pwdLoading}
                  disabled={!newPwd || newPwd !== confirmPwd}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h3>
          <p className="text-xs text-red-600 mb-4">These actions are permanent and cannot be undone.</p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => showToast("Contact support@greentoken.app to delete your account.", "info")}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
