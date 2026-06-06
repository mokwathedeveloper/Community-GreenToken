"use client";

// Spec: ux_ui/feature_specv2/signup_page_md.md
// Mockup: mockup/signup_page_mockup.png
// Layout: SPLIT — left hero (55%) + right form panel (45%)

import { Suspense, useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import {
  User, Mail, Lock, Tag, Eye, EyeOff, Wallet, Leaf, Globe, Github,
  Users, ShieldCheck,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type SignupRole = "admin" | "superadmin";
type PasswordStrength = 0 | 1 | 2 | 3 | 4;

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-primary-500"];

function calcStrength(pw: string): PasswordStrength {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s as PasswordStrength;
}

function friendlyError(msg: string): string {
  if (msg.includes("already registered") || msg.includes("User already registered"))
    return "An account with this email already exists. Please sign in.";
  if (msg.includes("Password should be"))
    return "Password must be at least 6 characters.";
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
  const [invite,   setInvite]   = useState(inviteToken ?? "");
  const [agree,    setAgree]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const strength = calcStrength(password);

  useEffect(() => {
    if (inviteToken) { setCheckingAdmin(false); return; }
    fetch("/api/auth/superadmin-exists")
      .then(r => r.json())
      .then(d => setSuperAdminExists(d.exists ?? false))
      .catch(() => setSuperAdminExists(true))
      .finally(() => setCheckingAdmin(false));
  }, [inviteToken]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!agree) { showToast("Please accept the Terms of Service and Privacy Policy.", "error"); return; }
    if (strength < 2) { showToast("Please choose a stronger password.", "error"); return; }
    if (selectedRole === "superadmin" && superAdminExists) {
      showToast("A Super Admin already exists. Only one is allowed.", "error"); return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name.trim() || email.split("@")[0] } },
      });

      if (error) { showToast(friendlyError(error.message), "error"); return; }

      if (data.user && !data.session) {
        showToast("Check your inbox and click the confirmation link.", "success"); return;
      }

      if (data.session && data.user) {
        if (selectedRole === "superadmin") {
          const res  = await fetch("/api/auth/set-superadmin", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id }),
          });
          const json = await res.json();
          if (!res.ok) { showToast(json.error?.message ?? "Failed to set Super Admin role.", "error"); return; }
          await supabase.auth.refreshSession();
          showToast("Super Admin account created! Welcome 🌿", "success");
          await new Promise(r => setTimeout(r, 800));
          router.push("/admin"); return;
        }
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
      {/*
        ── LAYOUT ──────────────────────────────────────────────────────────
        True split: LEFT 55% = hero image (object-cover, left-anchored so
        all 5 people are visible) + bottom text/icon overlay. RIGHT 45% =
        clean bright white panel, form content centred inside. The two sides
        are fully separated — no image bleeds behind the form.
        ────────────────────────────────────────────────────────────────────
      */}
      <div className="flex min-h-screen">

        {/* ══ LEFT: hero image panel (55%) ══ */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden">

          {/* Vibrant hero — left-anchored so the family stays visible */}
          <Image
            src="/assets/image/pages/auth/signup_hero.png"
            alt="Family of five planting a tree together"
            fill
            className="object-cover"
            style={{ objectPosition: "left center" }}
            priority
            sizes="55vw"
          />

          {/* Gradient: strong at bottom for text, fades up naturally */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />

          {/* ── Bottom-left overlay ── */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-10">

            {/* Headline */}
            <h2 className="text-[2.75rem] font-extrabold text-white leading-[1.15] tracking-tight drop-shadow-md mb-3">
              Grow a greener<br />future, together.
            </h2>

            {/* Subtitle */}
            <p className="text-white/80 text-[0.92rem] leading-relaxed mb-6 max-w-xs">
              Join a community that plants today and prospers tomorrow.
            </p>

            {/* Thin separator */}
            <div className="w-10 h-[2px] bg-white/30 rounded-full mb-6" aria-hidden="true" />

            {/* Feature blocks — icon on top, title bold, description lighter */}
            <div className="grid grid-cols-3 gap-5">
              {[
                {
                  icon: <Leaf className="w-[18px] h-[18px] text-white" />,
                  title: "Eco Impact",
                  desc:  "Every action creates a lasting impact",
                },
                {
                  icon: <Users className="w-[18px] h-[18px] text-white" />,
                  title: "Community First",
                  desc:  "Together we build a sustainable world",
                },
                {
                  icon: <ShieldCheck className="w-[18px] h-[18px] text-white" />,
                  title: "Transparent & Secure",
                  desc:  "Blockchain-powered trust and accountability",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex flex-col gap-2">
                  {/* Circular icon */}
                  <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center">
                    {icon}
                  </div>
                  <p className="text-white text-[0.78rem] font-bold leading-snug">{title}</p>
                  <p className="text-white/55 text-[0.72rem] leading-relaxed -mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT: clean white form panel (45%) ══ */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center bg-white px-8 py-10 overflow-y-auto min-h-screen">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative w-9 h-9 flex-shrink-0">
                <Image src="/branding/community-greentoken-logo.png" alt="Community GreenToken" fill className="object-contain" sizes="36px" />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                Community <span className="text-primary-600">GreenToken</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Create your account</h1>
            <p className="text-xs text-gray-500 text-center mb-4">
              Join a global community building a sustainable and regenerative future.
            </p>

            {/* Invite banner */}
            {inviteToken && orgName && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 text-center text-sm text-primary-700 font-medium mb-3">
                <Leaf className="inline w-3.5 h-3.5 mr-1" />
                You&apos;re joining <strong>{orgName}</strong>
              </div>
            )}

            {/* Role selector — only shown when not signing up via invite */}
            {!inviteToken && !checkingAdmin && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Who are you?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSelectedRole("admin")}
                    className={cn("border-2 rounded-xl p-2.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      selectedRole === "admin" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300")}>
                    <p className="text-sm font-bold text-gray-900">🏢 Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">Create &amp; manage an org.</p>
                  </button>
                  <button type="button" disabled={superAdminExists === true}
                    onClick={() => !superAdminExists && setSelectedRole("superadmin")}
                    className={cn("border-2 rounded-xl p-2.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      superAdminExists ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" :
                      selectedRole === "superadmin" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300")}>
                    <p className="text-sm font-bold text-gray-900">⚡ Super Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">{superAdminExists ? "Already taken." : "Platform admin (1 only)."}</p>
                  </button>
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 mt-1.5 flex gap-1.5 items-center">
                  <span aria-hidden="true">ℹ️</span>
                  <span><strong>Members</strong> join via an invite link from their admin.</span>
                </p>
              </div>
            )}

            {/* ── FORM — placeholders serve as labels, matching mockup ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">

              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input id="signup-name" type="text" placeholder="Full Name"
                  value={name} onChange={e => setName(e.target.value)}
                  autoComplete="name" required aria-label="Full Name"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white placeholder:text-gray-400" />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                <input id="signup-email" type="email" placeholder="Email Address"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" required aria-label="Email Address"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white placeholder:text-gray-400" />
              </div>

              {/* Password + strength */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <input id="signup-password" type={showPwd ? "text" : "password"}
                    placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password" required minLength={8} aria-label="Password"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white placeholder:text-gray-400" />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5" aria-live="polite">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all",
                            i <= strength ? STRENGTH_COLORS[strength] : "bg-gray-100")} />
                        ))}
                      </div>
                      <span className={cn("text-xs font-semibold flex-shrink-0",
                        strength >= 3 ? "text-primary-600" : strength >= 2 ? "text-blue-500" : "text-red-400")}>
                        {STRENGTH_LABELS[strength]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Use 8+ characters with a mix of letters, numbers &amp; symbols.</p>
                  </div>
                )}
              </div>

              {/* Invite token */}
              {!inviteToken && (
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <input id="signup-invite" type="text" placeholder="Invite token (optional)"
                    value={invite} onChange={e => setInvite(e.target.value)}
                    aria-label="Invite token (optional)"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white placeholder:text-gray-400" />
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-0.5">
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
                icon={<Leaf className="w-4 h-4" />}>
                {inviteToken ? "Join Organization" : selectedRole === "superadmin" ? "Create Super Admin" : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or continue with</div>
            </div>

            {/* Google + GitHub side by side */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => showToast("Google sign-up coming soon!", "info")}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                <GoogleIcon /> Continue with Google
              </button>
              <button type="button" onClick={() => showToast("GitHub sign-up coming soon!", "info")}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                <Github className="w-4 h-4" /> Continue with GitHub
              </button>
            </div>

            {/* Connect Wallet */}
            <button type="button" onClick={() => showToast("Freighter wallet registration coming soon!", "info")}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary-300 text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              <Wallet className="w-4 h-4" />
              Connect Crypto Wallet
              <span className="text-[10px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">Web3</span>
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500 mt-3">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary-600 font-semibold hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                Sign in →
              </Link>
            </p>

            {/* Bottom trust badges */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                <span className="text-xs text-gray-500 font-medium">Eco-Focused</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
                <span className="text-xs text-gray-500 font-medium">Secure &amp; Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                <span className="text-xs text-gray-500 font-medium">Global Community</span>
              </div>
            </div>

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
