"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

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

const TRUST_BADGES = [
  { icon: "🌿", title: "Eco-Focused",      desc: "Every action creates a lasting impact"          },
  { icon: "🔒", title: "Secure & Private", desc: "Blockchain-powered trust and accountability"    },
  { icon: "🌍", title: "Global Community", desc: "Join changemakers worldwide"                    },
];

function friendlyError(msg: string): string {
  if (msg.includes("already registered") || msg.includes("User already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (msg.includes("Password should be")) {
    return "Password must be at least 6 characters.";
  }
  if (msg.includes("Unable to validate") || msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("rate limit") || msg.includes("Too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return msg;
}

function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { show: showToast, node: toastNode } = useToast();

  const inviteToken = params?.get("token");
  const orgName     = params?.get("org");

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [agree,    setAgree]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const strength = calcStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!agree) {
      showToast("Please accept the Terms of Service and Privacy Policy to continue.", "error");
      return;
    }
    if (strength < 2) {
      showToast("Please choose a stronger password (at least 8 characters with mixed case & numbers).", "error");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name.trim() || email.split("@")[0] },
        },
      });

      if (error) {
        showToast(friendlyError(error.message), "error");
        return;
      }

      // Supabase may return a user with no session if email confirmation is required
      if (data.user && !data.session) {
        showToast(
          "Account created! Check your inbox and click the confirmation link to continue.",
          "success"
        );
        return;
      }

      // Session created immediately (email confirmation disabled or auto-confirmed)
      if (data.session) {
        showToast("Account created! Welcome to Community GreenToken 🌿", "success");
        await new Promise((r) => setTimeout(r, 1000));
        router.push(inviteToken ? "/dashboard" : "/org/setup");
      }
    } catch {
      showToast("Something went wrong. Please check your connection and try again.", "error");
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
          <Image
            src="/assets/image/pages/auth/signup_hero.png"
            alt="Community planting trees together"
            fill className="object-cover" priority sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-12 left-10 right-10">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Grow a greener future, together.
            </h2>
            <p className="text-white/80 text-base">Join a community that plants today and prospers tomorrow.</p>
          </div>
          <div className="absolute bottom-4 left-10 right-10 grid grid-cols-3 gap-4">
            {TRUST_BADGES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2">
                <span className="text-white/80 flex-shrink-0 text-sm" aria-hidden="true">{icon}</span>
                <div>
                  <p className="text-white text-xs font-semibold">{title}</p>
                  <p className="text-white/60 text-xs leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form side */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image src="/branding/community-greentoken-logo.png" alt="" width={36} height={36} />
              <span className="font-bold text-gray-900">
                Community <span className="text-primary-600">GreenToken</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create your account</h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              Join a global community building a sustainable and regenerative future.
            </p>

            {/* Invite banner */}
            {inviteToken && orgName && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-center text-sm text-primary-700 font-medium mb-5">
                🌿 You&apos;re joining <strong>{orgName}</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <Input id="signup-name" type="text" label="Full Name" placeholder="Alice Mokoena"
                value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />

              <Input id="signup-email" type="email" label="Email Address" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />

              {/* Password with strength meter */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required minLength={8}
                    aria-describedby="pwd-strength"
                    className={cn(
                      "w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    )}
                  />
                  <button type="button" onClick={() => setShowPwd((p) => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded text-sm">
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                {password && (
                  <div id="pwd-strength" aria-live="polite">
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all",
                          i <= strength ? STRENGTH_COLORS[strength] : "bg-gray-100")} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {STRENGTH_LABELS[strength]} — Use 8+ characters with letters, numbers &amp; symbols.
                    </p>
                  </div>
                )}
              </div>

              {/* Invite token field when no token in URL */}
              {!inviteToken && (
                <Input id="signup-invite" type="text" label="Invite token (optional)"
                  placeholder="Leave blank to create a new organization"
                  hint="Have a team invite? Paste the token here." />
              )}

              {/* Terms checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input id="signup-terms" type="checkbox" checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600 flex-shrink-0" />
                <label htmlFor="signup-terms" className="text-xs text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary-600 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded" target="_blank" rel="noopener">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary-600 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded" target="_blank" rel="noopener">Privacy Policy</Link>.
                </label>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={!agree} icon={<span>🌿</span>}>
                Create Account
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 my-4">or continue with</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {["Google", "GitHub"].map((provider) => (
                <button key={provider} type="button"
                  onClick={() => showToast(`${provider} sign-up coming soon!`, "info")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-700",
                    "hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                  )}>
                  Continue with {provider}
                </button>
              ))}
            </div>

            <button type="button"
              onClick={() => showToast("Freighter wallet registration coming soon!", "info")}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary-300",
                "text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              )}>
              🔗 Connect Crypto Wallet{" "}
              <span className="ml-1 text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">Web3</span>
            </button>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary-600 font-semibold hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                Sign in →
              </Link>
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
