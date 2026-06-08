"use client";

import { useState, type FormEvent, useEffect } from "react";
import Image from "next/image";
import AppLayout from "@/components/layouts/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  MCrown, MBusiness, MShield, MLeaf, MLocationPin, MSave,
  MCheckCircle, MWarning, MContentCopy, MOpenInNew, MLink,
} from "@/components/icons";

const ROLE_META = {
  superadmin: { label: "Super Admin",  color: "bg-purple-100 text-purple-700 border-purple-200", icon: <MCrown    className="w-3.5 h-3.5" /> },
  owner:      { label: "Org Owner",    color: "bg-amber-100  text-amber-700  border-amber-200",  icon: <MBusiness className="w-3.5 h-3.5" /> },
  admin:      { label: "Org Admin",    color: "bg-blue-100   text-blue-700   border-blue-200",   icon: <MShield   className="w-3.5 h-3.5" /> },
  member:     { label: "Member",       color: "bg-green-100  text-green-700  border-green-200",  icon: <MLeaf     className="w-3.5 h-3.5" /> },
};

const STELLAR_ADDRESS_RE = /^G[A-Z2-7]{55}$/;

export default function ProfilePage() {
  const { user, role, orgName, displayName, avatarUrl, isLoading } = useUser();
  const { show: showToast, node: toastNode } = useToast();

  const [name,            setName]            = useState("");
  const [saving,          setSaving]          = useState(false);
  const [changingPwd,     setChangingPwd]     = useState(false);
  const [newPwd,          setNewPwd]          = useState("");
  const [confirmPwd,      setConfirmPwd]      = useState("");
  const [pwdLoading,      setPwdLoading]      = useState(false);

  // Stellar wallet state
  const [walletAddress,   setWalletAddress]   = useState<string | null>(null);
  const [walletInput,     setWalletInput]     = useState("");
  const [walletLoading,   setWalletLoading]   = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [showSecret,      setShowSecret]      = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-fills form when UserProvider resolves async displayName
  useEffect(() => { if (displayName) setName(displayName); }, [displayName]);

  // Load wallet_address from DB on mount (UserProvider does not expose it)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const addr = d?.data?.user?.wallet_address as string | null | undefined;
        if (addr) setWalletAddress(addr);
      })
      .catch(() => {});
  }, []);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { showToast("Name cannot be empty.", "error"); return; }

    const newWallet = walletInput.trim();
    if (newWallet && !STELLAR_ADDRESS_RE.test(newWallet)) {
      showToast("Invalid Stellar address. Must start with G and be 56 characters.", "error");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { display_name: name.trim() },
      });
      if (metaErr) { showToast(metaErr.message, "error"); return; }

      if (user?.id) {
        const payload: Record<string, string> = {
          display_name: name.trim(),
          updated_at:   new Date().toISOString(),
        };
        if (newWallet) payload.wallet_address = newWallet;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("users").update(payload).eq("id", user.id);

        if (newWallet) {
          setWalletAddress(newWallet);
          setWalletInput("");
          setShowManualEntry(false);
        }
      }
      showToast("Profile updated successfully!", "success");
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
      showToast("Password changed successfully!", "success");
      setNewPwd(""); setConfirmPwd("");
      setChangingPwd(false);
    } catch {
      showToast("Could not change password. Please try again.", "error");
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleGenerateWallet() {
    setWalletLoading(true);
    try {
      const res  = await fetch("/api/stellar/wallet/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error?.message ?? "Failed to generate wallet.", "error");
        return;
      }
      setWalletAddress(json.data.publicKey as string);
      setGeneratedSecret(json.data.secretKey as string);
      setShowSecret(false);
      showToast("Stellar wallet generated!", "success");
    } catch {
      showToast("Failed to generate wallet. Please try again.", "error");
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleConnectFreighter() {
    setWalletLoading(true);
    try {
      const { connectWallet } = await import("@/lib/stellar/freighter");
      const { publicKey } = await connectWallet();
      const supabase = createClient();
      if (user?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("users")
          .update({ wallet_address: publicKey })
          .eq("id", user.id);
      }
      setWalletAddress(publicKey);
      showToast("Freighter wallet connected!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to connect Freighter.", "error");
    } finally {
      setWalletLoading(false);
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
                <Image src={avatarUrl} alt={displayName ?? "Avatar"} width={80} height={80}
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
                    <MLocationPin className="w-3.5 h-3.5" aria-hidden="true" /> {orgName}
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

            {/* ── Stellar Wallet ── */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Stellar Wallet <span className="text-red-500" aria-hidden="true">*</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Required to earn and redeem GTK tokens on-chain.</p>
                </div>
                {walletAddress && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Explorer <MOpenInNew className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </div>

              {walletAddress ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2.5">
                    <MCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs font-mono text-green-700 truncate flex-1">
                      {walletAddress.slice(0, 8)}…{walletAddress.slice(-8)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(walletAddress)
                          .then(() => showToast("Address copied!", "success"))
                          .catch(() => {})
                      }
                      className="p-1 text-green-400 hover:text-green-600 transition-colors"
                      aria-label="Copy wallet address"
                    >
                      <MContentCopy className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  {!showManualEntry && (
                    <button
                      type="button"
                      onClick={() => setShowManualEntry(true)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Replace with a different address
                    </button>
                  )}
                </>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 space-y-2.5">
                  <p className="text-xs font-medium text-amber-700">
                    No Stellar wallet linked. Link one to earn GTK tokens on-chain.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateWallet}
                      disabled={walletLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
                    >
                      {walletLoading ? (
                        <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MShield className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      Generate Wallet
                    </button>
                    <button
                      type="button"
                      onClick={handleConnectFreighter}
                      disabled={walletLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-primary-300 text-primary-700 hover:bg-primary-50 disabled:opacity-60 transition-colors"
                    >
                      <MLink className="w-3.5 h-3.5" aria-hidden="true" />
                      Connect Freighter
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualEntry((s) => !s)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Enter manually
                    </button>
                  </div>
                </div>
              )}

              {showManualEntry && (
                <div className="space-y-2">
                  <input
                    id="wallet-manual"
                    type="text"
                    placeholder="G… (56-character Stellar public key)"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors",
                      walletInput && !STELLAR_ADDRESS_RE.test(walletInput)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    )}
                  />
                  {walletInput && !STELLAR_ADDRESS_RE.test(walletInput) && (
                    <p className="text-xs text-red-500">Must start with G and be 56 characters (A–Z and 2–7 only).</p>
                  )}
                  <p className="text-xs text-gray-400">Will be saved when you click Save Changes below.</p>
                  <button
                    type="button"
                    onClick={() => { setShowManualEntry(false); setWalletInput(""); }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" size="md" loading={saving} icon={<MSave className="w-4 h-4" />}>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Secret key reveal — shown once after wallet generation */}
        {generatedSecret && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <MWarning className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">Save your secret key — shown once only</h3>
            </div>
            <p className="text-xs text-red-600 mb-4">
              This key gives full control of your Stellar wallet. Write it down or import it into a wallet
              app (e.g. Freighter). It will <strong>never</strong> be shown again.
            </p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2.5 mb-4 font-mono">
              <span className="text-xs text-gray-700 break-all flex-1 select-all">
                {showSecret ? generatedSecret : `S${"•".repeat(55)}`}
              </span>
              <button
                type="button"
                onClick={() => setShowSecret((s) => !s)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 flex-shrink-0 whitespace-nowrap"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(generatedSecret)
                    .then(() => showToast("Secret key copied!", "success"))
                    .catch(() => {})
                }
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Copy secret key"
              >
                <MContentCopy className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setGeneratedSecret(null)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
            >
              <MCheckCircle className="w-4 h-4" aria-hidden="true" />
              I&apos;ve saved my secret key
            </button>
          </div>
        )}

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "User ID",      value: user?.id ? user.id.slice(0, 8) + "…" : "—" },
              { label: "Account Type", value: roleMeta?.label ?? "Member"        },
              { label: "Organization", value: orgName ?? "No organization yet"    },
              { label: "Member Since", value: (() => {
                  const ts = user?.created_at as string | undefined;
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
