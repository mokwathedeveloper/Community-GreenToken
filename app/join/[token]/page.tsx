"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  MLink2, MAccessTime, MCheckCircle, MGift, MLeaf,
  MEmail, MWarning, MLock,
} from "@/components/icons";

type InviteStatus =
  | "loading"
  | "check_email"   // landed here without a session — prompt to check inbox
  | "valid"         // has session, invite valid, show form (new user or already authed)
  | "expired"
  | "invalid"
  | "accepted"
  | "already_member"
  | "wrong_email";

type AuthMode = "signup" | "signin";

interface InviteInfo {
  orgName:      string;
  orgSlug:      string;
  role:         string;
  expiresAt:    string;
  invitedEmail?: string;
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

  // Guard: prevent acceptInvite() running twice simultaneously.
  // onAuthStateChange fires SIGNED_IN for both magic links AND manual sign-in.
  // Without this guard, both the listener and handleAuth call acceptInvite
  // concurrently — causing a 409 race that leaves the button stuck loading.
  const acceptingRef   = useRef(false);
  const manualAuthRef  = useRef(false); // true while handleAuth is in flight

  useEffect(() => {
    if (!token) return;

    const supabase = createClient();

    // Listen for auth state changes — catches #access_token=... fragments
    // that Supabase processes asynchronously after the page loads.
    // Skip when manualAuthRef is set — handleAuth already calls acceptInvite().
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session && !manualAuthRef.current) {
          acceptInvite();
        }
      }
    );

    async function loadInvite() {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch invite via admin-client API (bypasses RLS)
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

      const invitedEmail = (inviteData.invited_email as string | null) ?? undefined;
      const info: InviteInfo = {
        orgName:      inviteData.organizations?.name ?? "an organization",
        orgSlug:      inviteData.organizations?.slug ?? "",
        role:         inviteData.role,
        expiresAt:    inviteData.expires_at,
        invitedEmail,
      };
      setInvite(info);

      if (invitedEmail) {
        setEmail(invitedEmail);
        setMode("signin");
      }

      if (session?.user) {
        // Already authenticated — try to accept immediately
        await acceptInvite();
      } else {
        // No session: if this was an email invite, ask them to check inbox.
        // If it's a generic link, show the sign-up/sign-in form directly.
        setStatus(invitedEmail ? "check_email" : "valid");
      }
    }

    loadInvite();

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function acceptInvite() {
    // Prevent concurrent calls — both magic link listener and handleAuth can trigger this.
    if (acceptingRef.current) return;
    acceptingRef.current = true;

    try {
      const res  = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
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
        setStatus("valid");    // stay on form so they can retry
        acceptingRef.current = false;
        return;
      }

      setStatus("accepted");
      showToast(`Welcome to ${invite?.orgName ?? "the organization"}!`, "success");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
      acceptingRef.current = false;  // allow retry on network error
    }
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    manualAuthRef.current = true;   // block onAuthStateChange from double-firing
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const joinUrl = typeof window !== "undefined" ? window.location.href : "";
        const { data: signUpData, error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { display_name: name.trim() || email.split("@")[0] },
            emailRedirectTo: joinUrl,
          },
        });
        if (error) { showToast(error.message, "error"); return; }
        if (!signUpData.session) {
          showToast(
            "Check your email to confirm your account — then click the confirmation link to join automatically.",
            "success"
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { showToast("Incorrect email or password.", "error"); return; }
      }
      await acceptInvite();
    } finally {
      manualAuthRef.current = false;
      setLoading(false);
    }
  }

  const roleLabel: Record<string, string> = {
    owner: "Org Owner", admin: "Org Admin", member: "Member",
  };
  const roleColor: Record<string, string> = {
    owner: "bg-amber-100 text-amber-700",
    admin: "bg-blue-100 text-blue-700",
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

          {/* ── Check email (no session, email-specific invite) ── */}
          {status === "check_email" && invite && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-6 text-white text-center">
                <div className="flex justify-center mb-3"><MEmail className="w-10 h-10 text-white" /></div>
                <h2 className="text-xl font-bold mb-1">Check your inbox!</h2>
                <p className="text-primary-100 text-sm">
                  You've been invited to join{" "}
                  <strong className="text-white">{invite.orgName}</strong>
                </p>
              </div>
              <div className="px-6 py-6 text-center space-y-4">
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    A one-time login link was sent to:
                  </p>
                  <p className="text-primary-700 font-bold text-sm break-all">
                    {invite.invitedEmail}
                  </p>
                </div>
                <ol className="text-left space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">1</span>
                    Open the email from Community GreenToken
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">2</span>
                    Click the <strong>"Accept Invitation"</strong> button in the email
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">3</span>
                    You'll be logged in automatically — no password needed
                  </li>
                </ol>
                <p className="text-xs text-gray-400">
                  Didn't get the email? Check spam, or ask your admin to resend.
                </p>

                {/* Fallback: already have account */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Already have an account?</p>
                  <button
                    onClick={() => { setMode("signin"); setStatus("valid"); }}
                    className="text-sm text-primary-600 font-medium hover:underline"
                  >
                    Sign in with your password instead →
                  </button>
                </div>
              </div>
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
              <Link href="/signin"><Button variant="primary" size="md" fullWidth>Sign in with the right account</Button></Link>
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

          {/* ── Valid invite — auth form (generic link or fallback) ── */}
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

                {/* Locked-email notice */}
                {invite.invitedEmail && (
                  <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-lg px-3 py-2 mb-4 text-xs text-primary-700">
                    <MLock className="w-3.5 h-3.5 flex-shrink-0" />
                    This invite is locked to <strong className="ml-1">{invite.invitedEmail}</strong>
                  </div>
                )}

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
                    <Input id="join-name" type="text" label="Full Name" placeholder="Grace Wanjiku"
                      value={name} onChange={(e) => setName(e.target.value)} required />
                  )}

                  <div>
                    <Input id="join-email" type="email"
                      label="Email Address"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { if (!invite?.invitedEmail) setEmail(e.target.value); }}
                      readOnly={!!invite?.invitedEmail}
                      autoComplete="email" required
                    />
                  </div>

                  <div>
                    <label htmlFor="join-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {mode === "signup" ? "Create a Password" : "Your Password"}
                    </label>
                    <input
                      id="join-password"
                      type="password"
                      placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required minLength={8}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                    {mode === "signup" && (
                      <p className="mt-1 text-xs text-gray-400">
                        This becomes your permanent password for the app.
                      </p>
                    )}
                  </div>

                  <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<MLeaf className="w-4 h-4" />}>
                    {mode === "signup" ? `Create Account & Join ${invite.orgName}` : `Sign In & Join ${invite.orgName}`}
                  </Button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-4">
                  {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
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
