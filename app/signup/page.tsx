"use client";

// Signup flow:
//   Admin      → creates org → becomes org owner → invites members
//   Super Admin → ONE singleton platform admin → option hidden after first is created
//   Member     → NOT on this page → invited only (via /join/[token])

import { Suspense, useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

type SignupRole = "admin" | "superadmin";
type PasswordStrength = 0 | 1 | 2 | 3 | 4;

function calcStrength(pw: string): PasswordStrength {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s as PasswordStrength;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-primary-500"];

function friendlyError(msg: string): string {
  if (msg.includes("already registered") || msg.includes("User already registered"))
    return "An account with this email already exists. Please sign in instead.";
  if (msg.includes("Password should be"))
    return "Password must be at least 6 characters.";
  if (msg.includes("Unable to validate") || msg.includes("invalid email"))
    return "Please enter a valid email address.";
  if (msg.includes("rate limit") || msg.includes("Too many"))
    return "Too many attempts. Please wait a moment and try again.";
  return msg;
}

function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { show: showToast, node: toastNode } = useToast();

  const inviteToken = params?.get("token");
  const orgName     = params?.get("org");

  const [selectedRole,     setSelectedRole]     = useState<SignupRole>("admin");
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);
  const [checkingAdmin,    setCheckingAdmin]    = useState(true);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [agree,    setAgree]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const strength = calcStrength(password);

  // Check if a super admin already exists (singleton guard)
  useEffect(() => {
    if (inviteToken) { setCheckingAdmin(false); return; }
    fetch("/api/auth/superadmin-exists")
      .then(r => r.json())
      .then(d => setSuperAdminExists(d.exists ?? false))
      .catch(() => setSuperAdminExists(true)) // fail-safe: assume exists
      .finally(() => setCheckingAdmin(false));
  }, [inviteToken]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!agree) {
      showToast("Please accept the Terms of Service and Privacy Policy.", "error");
      return;
    }
    if (strength < 2) {
      showToast("Please choose a stronger password (8+ chars, mixed case & numbers).", "error");
      return;
    }
    if (selectedRole === "superadmin" && superAdminExists) {
      showToast("A Super Admin already exists. Only one is allowed.", "error");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() || email.split("@")[0] } },
      });

      if (error) { showToast(friendlyError(error.message), "error"); return; }

      if (data.user && !data.session) {
        showToast("Check your inbox and click the confirmation link to continue.", "success");
        return;
      }

      if (data.session && data.user) {
        // ── Super Admin path ──────────────────────────────────────────
        if (selectedRole === "superadmin") {
          const res  = await fetch("/api/auth/set-superadmin", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ userId: data.user.id }),
          });
          const json = await res.json();
          if (!res.ok) { showToast(json.error?.message ?? "Failed to set Super Admin role.", "error"); return; }
          await supabase.auth.refreshSession(); // update JWT with new role
          showToast("Super Admin account created! Welcome 🌿", "success");
          await new Promise(r => setTimeout(r, 800));
          router.push("/admin");
          return;
        }

        // ── Admin path (with invite = member of existing org) ────────
        if (inviteToken) {
          showToast("Welcome to Community GreenToken! 🌿", "success");
          await new Promise(r => setTimeout(r, 800));
          router.push("/dashboard");
        } else {
          showToast("Account created! Let's set up your organization 🌿", "success");
          await new Promise(r => setTimeout(r, 800));
          router.push("/org/setup");
        }
      }
    } catch {
      showToast("Something went wrong. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {toastNode}
      <div className="flex min-h-screen">

        {/* Hero side */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image src="/assets/image/pages/auth/signup_hero.png" alt="Community planting trees together"
            fill className="object-cover" priority sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-12 left-10 right-10">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Grow a greener future, together.
            </h2>
            <p className="text-white/80 text-base">Join a community that plants today and prospers tomorrow.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <Image src="/branding/community-greentoken-logo.png" alt="" width={36} height={36} />
              <span className="font-bold text-gray-900">
                Community <span className="text-primary-600">GreenToken</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create your account</h1>
            <p className="text-sm text-gray-500 text-center mb-5">
              {inviteToken
                ? `You're joining ${orgName ?? "an organization"} as a member.`
                : "Choose your role to get started."}
            </p>

            {/* Invite banner */}
            {inviteToken && orgName && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-center text-sm text-primary-700 font-medium mb-5">
                🌿 You&apos;re joining <strong>{orgName}</strong> as a member
              </div>
            )}

            {/* ── Role selector (hidden when joining via invite) ── */}
            {!inviteToken && !checkingAdmin && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Who are you?</p>
                <div className="grid grid-cols-2 gap-3">

                  {/* Admin */}
                  <button type="button" onClick={() => setSelectedRole("admin")}
                    className={cn(
                      "border-2 rounded-xl p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      selectedRole === "admin" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                    )}>
                    <div className="text-2xl mb-1.5" aria-hidden="true">🏢</div>
                    <p className="text-sm font-bold text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500 leading-snug mt-1">
                      Create & manage an organization. Invite members.
                    </p>
                    {selectedRole === "admin" && (
                      <span className="mt-2 inline-flex text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">✓ Selected</span>
                    )}
                  </button>

                  {/* Super Admin — disabled once one exists */}
                  <button type="button"
                    disabled={superAdminExists === true}
                    onClick={() => !superAdminExists && setSelectedRole("superadmin")}
                    className={cn(
                      "border-2 rounded-xl p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      superAdminExists
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : selectedRole === "superadmin"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                    )}>
                    <div className="text-2xl mb-1.5" aria-hidden="true">⚡</div>
                    <p className="text-sm font-bold text-gray-900">Super Admin</p>
                    <p className="text-xs text-gray-500 leading-snug mt-1">
                      {superAdminExists ? "Already taken. One per platform." : "Platform-wide admin. One account only."}
                    </p>
                    {superAdminExists ? (
                      <span className="mt-2 inline-flex text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">🔒 Taken</span>
                    ) : selectedRole === "superadmin" ? (
                      <span className="mt-2 inline-flex text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">✓ Selected</span>
                    ) : null}
                  </button>
                </div>

                {/* Member explanation */}
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <span className="text-amber-500 text-xs mt-0.5" aria-hidden="true">ℹ️</span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Are you a member?</strong> Members join via an invite link sent by their admin — not through this page.
                  </p>
                </div>
              </div>
            )}

            {/* ── Form fields ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <Input id="signup-name" type="text" label="Full Name" placeholder="Alice Mokoena"
                value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />

              <Input id="signup-email" type="email" label="Email Address" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="signup-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password" required minLength={8}
                    aria-describedby="pwd-strength"
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                {password && (
                  <div id="pwd-strength" aria-live="polite">
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4].map(i=>(
                        <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all",
                          i <= strength ? STRENGTH_COLORS[strength] : "bg-gray-100")} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{STRENGTH_LABELS[strength]} — 8+ chars with letters, numbers &amp; symbols.</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input id="signup-terms" type="checkbox" checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600 flex-shrink-0" />
                <label htmlFor="signup-terms" className="text-xs text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary-600 hover:underline" target="_blank" rel="noopener">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener">Privacy Policy</Link>.
                </label>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}
                disabled={!agree || (selectedRole === "superadmin" && !!superAdminExists)}
                icon={<span>{selectedRole === "superadmin" ? "⚡" : "🏢"}</span>}>
                {inviteToken
                  ? "Join Organization"
                  : selectedRole === "superadmin"
                    ? "Create Super Admin Account"
                    : "Create Admin Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary-600 font-semibold hover:text-primary-700">Sign in →</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default function SignUpPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignUpPage />
    </Suspense>
  );
}
