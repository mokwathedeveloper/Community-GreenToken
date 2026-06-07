"use client";

/**
 * /join/[token]
 *
 * User lands here after clicking an invite link from their email.
 * Flow:
 *   1. Page loads → fetch invite details from DB (org name, role, expiry)
 *   2. If invite is valid → show "You've been invited to [Org]" card
 *   3. If user is NOT logged in → show sign-up / sign-in form
 *   4. On auth success → POST /api/invites/[token]/accept → redirect to /dashboard
 *   5. If invite expired/invalid → show clear error
 */

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MLink2, MAccessTime, MCheckCircle, MGift, MLeaf, MEmail, MWarning } from "@/components/icons";

type InviteStatus = "loading" | "valid" | "expired" | "invalid" | "accepted" | "already_member" | "wrong_email";
type AuthMode     = "signup" | "signin";

interface InviteInfo {
  orgName:       string;
  orgSlug:       string;
  role:          string;
  expiresAt:     string;
  invitedEmail?: string;   // set for email-specific invites
}

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const router    = useRouter();
  const { show: showToast, node: toastNode } = useToast();

  const [status,   setStatus]   = useState<InviteStatus>("loading");
  const [invite,   setInvite]   = useState<InviteInfo | null>(null);
  const [mode,     setMode]     = useState<AuthMode>("signup");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  // Load invite details
  useEffect(() => {
    if (!token) return;

    async function loadInvite() {
      const supabase = createClient();

      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();

      // ── Fetch invite via the admin-client API endpoint ──────────────────
      // DO NOT query the invites table directly from the browser client.
      // RLS on invites blocks unauthenticated (and new-user) reads.
      // GET /api/invites/[token] uses createAdminClient() — bypasses RLS.
      let inviteData: {
        role: string;
        expires_at: string;
        uses_left: number | null;
        is_expired: boolean;
        is_valid: boolean;
        invited_email?: string | null;
        organizations: { name: string; slug: string } | null;
      } | null = null;

      try {
        const res  = await fetch(`/api/invites/${token}`);
        const json = await res.json();
        if (!res.ok || !json.data) { setStatus("invalid"); return; }
        inviteData = json.data;
      } catch {
        setStatus("invalid"); return;
      }

      if (!inviteData) { setStatus("invalid"); return; }

      if (inviteData.is_expired || !inviteData.is_valid) {
        setStatus("expired");
        setInvite({
          orgName:   inviteData.organizations?.name ?? "an organization",
          orgSlug:   inviteData.organizations?.slug ?? "",
          role:      inviteData.role,
          expiresAt: inviteData.expires_at,
        });
        return;
      }

      const org = inviteData.organizations;
      const invitedEmail = (inviteData.invited_email as string | null) ?? undefined;
      setInvite({
        orgName:      org?.name   ?? "an organization",
        orgSlug:      org?.slug   ?? "",
        role:         inviteData.role,
        expiresAt:    inviteData.expires_at,
        invitedEmail,
      });

      // Pre-fill the email field if this is an email-specific invite
      if (invitedEmail) setEmail(invitedEmail);

      // Default to signin mode if there's a specific email (likely existing user from magic link)
      if (invitedEmail) setMode("signin");

      // If already logged in, auto-accept
      if (session?.user) {
        await acceptInvite(session.user.id);
      } else {
        setStatus("valid");
      }
    }

    loadInvite();
  }, [token]);

  async function acceptInvite(userId?: string) {
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      const json = await res.json();

      if (res.status === 409) {
        setStatus("already_member");
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }
      if (res.status === 403 && json.error?.code === "WRONG_EMAIL") {
        setStatus("wrong_email");
        return;
      }
      if (!res.ok) {
        showToast(json.error?.message ?? "Could not accept invite.", "error");
        setStatus("invalid");
        return;
      }

      setStatus("accepted");
      showToast(`Welcome to ${invite?.orgName ?? "the organization"}!`, "success");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    }
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        // emailRedirectTo sends the user back to this exact invite URL after
        // email confirmation, so they auto-join even if confirmation is required.
        const joinUrl = typeof window !== "undefined" ? window.location.href : "";
        const { data: signUpData, error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { display_name: name.trim() || email.split("@")[0] },
            emailRedirectTo: joinUrl,
          },
        });
        if (error) { showToast(error.message, "error"); return; }

        // If no session, email confirmation is required — user needs to verify email first
        if (!signUpData.session) {
          showToast(
            "Check your email to confirm your account. Once confirmed, you'll be taken straight to the organisation.",
            "success"
          );
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { showToast("Incorrect email or password.", "error"); return; }
      }
      // After auth, accept the invite
      await acceptInvite();
    } finally {
      setLoading(false);
    }
  }

  const roleLabel: Record<string, string> = {
    owner:  "Org Owner",
    admin:  "Org Admin",
    member: "Member",
  };

  const roleColor: Record<string, string> = {
    owner:  "bg-amber-100 text-amber-700",
    admin:  "bg-blue-100 text-blue-700",
    member: "bg-green-100 text-green-700",
  };

  return (
    <>
      {toastNode}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/branding/community-greentoken-logo.png" alt="" width={40} height={40} />
              <span className="font-bold text-gray-900 text-lg">
                Community <span className="text-primary-600">GreenToken</span>
              </span>
            </Link>
          </div>

          {/* ── Loading ── */}
          {status === "loading" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Checking your invitation…</p>
            </div>
          )}

          {/* ── Invalid ── */}
          {status === "invalid" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4"><MLink2 className="w-12 h-12 text-gray-400" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invite Not Found</h2>
              <p className="text-sm text-gray-500 mb-6">This invite link is invalid or has already been used.</p>
              <p className="text-xs text-gray-400 mb-6">If you think this is a mistake, ask your org admin to send a new invite.</p>
              <Link href="/signin"><Button variant="outline" size="md" fullWidth>Sign in instead</Button></Link>
            </div>
          )}

          {/* ── Wrong email ── */}
          {status === "wrong_email" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4"><MWarning className="w-12 h-12 text-amber-400" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Wrong Email Address</h2>
              <p className="text-sm text-gray-500 mb-2">
                This invite was sent to{" "}
                <strong className="text-gray-800">{invite?.invitedEmail ?? "a specific email address"}</strong>.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please sign out and sign back in with that email address, then click this link again.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/signin"><Button variant="primary" size="md" fullWidth>Sign in with the right account</Button></Link>
              </div>
            </div>
          )}

          {/* ── Expired ── */}
          {status === "expired" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4"><MAccessTime className="w-12 h-12 text-amber-400" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invite Expired</h2>
              <p className="text-sm text-gray-500 mb-2">
                This invite expired on{" "}
                <strong>{invite?.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : "an earlier date"}</strong>.
              </p>
              <p className="text-sm text-gray-400 mb-6">Ask your admin to send a new invite.</p>
              <Link href="/signin"><Button variant="outline" size="md" fullWidth>Sign in instead</Button></Link>
            </div>
          )}

          {/* ── Already a member ── */}
          {status === "already_member" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4"><MCheckCircle className="w-12 h-12 text-primary-600" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Already a member!</h2>
              <p className="text-sm text-gray-500">You are already in {invite?.orgName}. Redirecting to your dashboard…</p>
            </div>
          )}

          {/* ── Accepted ── */}
          {status === "accepted" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4"><MGift className="w-12 h-12 text-primary-600" /></div>
              <h2 className="text-xl font-bold text-primary-700 mb-2">You're in!</h2>
              <p className="text-sm text-gray-500">Welcome to <strong>{invite?.orgName}</strong>. Taking you to your dashboard…</p>
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
            </div>
          )}

          {/* ── Valid invite — auth form ── */}
          {status === "valid" && invite && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

              {/* Invite header */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-6 text-white text-center">
                <div className="flex justify-center mb-3"><MLeaf className="w-10 h-10 text-white" /></div>
                <h2 className="text-xl font-bold mb-1">You've been invited!</h2>
                <p className="text-primary-100 text-sm">
                  Join <strong className="text-white">{invite.orgName}</strong> on Community GreenToken
                </p>
                <div className="mt-3 flex justify-center">
                  <span className={cn("text-xs font-bold px-3 py-1 rounded-full", roleColor[invite.role] ?? "bg-white/20 text-white")}>
                    {roleLabel[invite.role] ?? invite.role}
                  </span>
                </div>
                <p className="text-xs text-primary-200 mt-2">
                  Expires {new Date(invite.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Auth form */}
              <div className="px-6 py-6">
                {/* Mode toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
                  {(["signup", "signin"] as AuthMode[]).map((m) => (
                    <button key={m} onClick={() => setMode(m)}
                      className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                      {m === "signup" ? "New Account" : "I have an account"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAuth} noValidate className="space-y-3">
                  {mode === "signup" && (
                    <Input id="join-name" type="text" label="Full Name" placeholder="Alice Mokoena"
                      value={name} onChange={(e) => setName(e.target.value)} required />
                  )}

                  <div>
                    <Input id="join-email" type="email"
                      label={invite?.invitedEmail ? "Email Address (locked to invite)" : "Email Address"}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { if (!invite?.invitedEmail) setEmail(e.target.value); }}
                      readOnly={!!invite?.invitedEmail}
                      autoComplete="email" required
                    />
                    {invite?.invitedEmail && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-primary-600">
                        <MEmail className="w-3 h-3" aria-hidden="true" />
                        This invite is locked to this email address
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="join-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {mode === "signup" ? "Create Password" : "Password"}
                    </label>
                    <input
                      id="join-password"
                      type="password"
                      placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required minLength={8}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<MLeaf className="w-4 h-4" />}>
                    {mode === "signup" ? `Join ${invite.orgName}` : `Sign In & Join ${invite.orgName}`}
                  </Button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-4">
                  {mode === "signup"
                    ? "Already have an account? "
                    : "Don't have an account? "}
                  <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                    className="text-primary-600 font-medium hover:underline">
                    {mode === "signup" ? "Sign in instead" : "Create one"}
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
