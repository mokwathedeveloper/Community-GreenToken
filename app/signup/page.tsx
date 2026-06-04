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
      <div className="flex min-h-screen">

        {/* ── LEFT: Hero (55%) — image + text overlay ── */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col">
          <Image
            src="/assets/image/pages/auth/signup_hero.png"
            alt="Family planting a tree together"
            fill
            className="object-cover"
            style={{ objectPosition: "30% center" }}
            priority
            sizes="55vw"
          />
          {/* Dark gradient bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />

          {/* Bottom-left text overlay — matches mockup */}
          <div className="absolute bottom-0 left-0 right-0 px-10 pb-10">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Grow a greener<br />future, together.
            </h2>
            <p className="text-white/80 text-sm mb-6">
              Join a community that plants today and prospers tomorrow.
            </p>

            {/* Hero trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🌱", title: "Eco Impact",          desc: "Every action creates a lasting impact"          },
                { icon: "👥", title: "Community First",     desc: "Together we build a sustainable world"          },
                { icon: "🔗", title: "Transparent & Secure",desc: "Blockchain-powered trust and accountability"    },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2">
                  <span className="text-white/80 flex-shrink-0 text-sm mt-0.5" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{title}</p>
                    <p className="text-white/60 text-xs leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form panel (45%) ── */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center bg-white px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="relative w-9 h-9 flex-shrink-0">
                <Image src="/branding/community-greentoken-logo.png" alt="Community GreenToken" fill className="object-contain" sizes="36px" />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                Community <span className="text-primary-600">GreenToken</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Create your account</h1>
            <p className="text-xs text-gray-500 text-center mb-5">
              Join a global community building a sustainable and regenerative future.
            </p>

            {/* Invite banner */}
            {inviteToken && orgName && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-center text-sm text-primary-700 font-medium mb-4">
                🌿 You&apos;re joining <strong>{orgName}</strong>
              </div>
            )}

            {/* Role selector — only if NOT signing up via invite */}
            {!inviteToken && !checkingAdmin && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Who are you?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSelectedRole("admin")}
                    className={cn("border-2 rounded-xl p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      selectedRole === "admin" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300")}>
                    <p className="text-sm font-bold text-gray-900">🏢 Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">Create & manage an org.</p>
                    {selectedRole === "admin" && <span className="text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full mt-1 inline-block">✓ Selected</span>}
                  </button>
                  <button type="button" disabled={superAdminExists === true}
                    onClick={() => !superAdminExists && setSelectedRole("superadmin")}
                    className={cn("border-2 rounded-xl p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                      superAdminExists ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" :
                      selectedRole === "superadmin" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300")}>
                    <p className="text-sm font-bold text-gray-900">⚡ Super Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">{superAdminExists ? "Already taken." : "Platform admin (1 only)."}</p>
                    {superAdminExists
                      ? <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">🔒 Taken</span>
                      : selectedRole === "superadmin" && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mt-1 inline-block">✓ Selected</span>
                    }
                  </button>
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2 flex gap-1.5 items-start">
                  <span>ℹ️</span>
                  <span><strong>Members</strong> join via an invite link from their admin.</span>
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">

              {/* Full Name */}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true">👤</span>
                  <input id="signup-name" type="text" placeholder="Alice Mokoena"
                    value={name} onChange={e => setName(e.target.value)}
                    autoComplete="name" required
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true">✉️</span>
                  <input id="signup-email" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoComplete="email" required
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                </div>
              </div>

              {/* Password + strength */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true">🔒</span>
                  <input id="signup-password" type={showPwd ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password" required minLength={8}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5" aria-live="polite">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all",
                          i <= strength ? STRENGTH_COLORS[strength] : "bg-gray-100")} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      <span className={cn("font-semibold", strength >= 3 ? "text-primary-600" : strength >= 2 ? "text-blue-500" : "text-red-400")}>
                        {STRENGTH_LABELS[strength]}
                      </span>
                      {" "}— Use 8+ characters with letters, numbers &amp; symbols.
                    </p>
                  </div>
                )}
              </div>

              {/* Invite token */}
              {!inviteToken && (
                <div>
                  <label htmlFor="signup-invite" className="block text-sm font-medium text-gray-700 mb-1.5">Invite token <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true">🏷️</span>
                    <input id="signup-invite" type="text" placeholder="Paste invite token if you have one"
                      value={invite} onChange={e => setInvite(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                  </div>
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
                icon={<span>🌿</span>}>
                {inviteToken ? "Join Organization" : selectedRole === "superadmin" ? "Create Super Admin" : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or continue with</div>
            </div>

            {/* Google + GitHub side by side */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => showToast("Google sign-up coming soon!", "info")}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                <span className="text-red-500 font-bold">G</span> Continue with Google
              </button>
              <button type="button" onClick={() => showToast("GitHub sign-up coming soon!", "info")}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                <span className="text-gray-900 font-bold text-base leading-none">⌥</span> Continue with GitHub
              </button>
            </div>

            {/* Connect Wallet */}
            <button type="button" onClick={() => showToast("Freighter wallet registration coming soon!", "info")}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary-300 text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
              🔗 Connect Crypto Wallet
              <span className="ml-1 text-[10px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">Web3</span>
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary-600 font-semibold hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                Sign in →
              </Link>
            </p>

            {/* Bottom badges */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
              {[
                { icon: "🌿", label: "Eco-Focused" },
                { icon: "🔒", label: "Secure & Private" },
                { icon: "🌐", label: "Global Community" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="text-sm" aria-hidden="true">{icon}</span>
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                </div>
              ))}
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
