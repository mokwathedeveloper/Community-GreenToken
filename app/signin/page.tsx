"use client";

// Spec: ux_ui/feature_specv2/signin_page_md.md
// Mockup: mockup/signin_page_mockup.png
// Hero: assets/image/pages/auth/signin_hero.png

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

const TRUST_BADGES = [
  { icon: "🌿", title: "Sustainable Impact",    desc: "Every action builds a greener tomorrow"   },
  { icon: "👥", title: "Community Powered",     desc: "Together we build stronger communities"   },
  { icon: "🔒", title: "Secure & Transparent",  desc: "Your data stays yours, always"            },
];

function friendlyError(msg: string): string {
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
    return "Incorrect email or password. Please try again.";
  if (msg.includes("Email not confirmed"))
    return "Please check your inbox and confirm your email before signing in.";
  if (msg.includes("Too many requests") || msg.includes("rate limit"))
    return "Too many attempts. Please wait a minute and try again.";
  return msg;
}

export default function SignInPage() {
  const router = useRouter();
  const { show: showToast, node: toastNode } = useToast();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        showToast(friendlyError(error.message), "error");
        return;
      }

      if (data.session) {
        showToast("Welcome back! Signing you in…", "success");
        await new Promise(r => setTimeout(r, 800));
        router.push("/dashboard");
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

        {/* ── LEFT: Hero image — no dark overlay, natural light feel ── */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <Image
            src="/assets/image/pages/auth/signin_hero.png"
            alt="People tending an eco-friendly garden with wind turbines"
            fill
            className="object-cover object-center"
            priority
            sizes="50vw"
          />
          {/* Subtle bottom gradient only — keeps wind turbines visible */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />

          {/* Bottom-left branding */}
          <div className="absolute bottom-8 left-8">
            <span className="text-white/90 text-xs font-medium drop-shadow">Community GreenToken</span>
          </div>
        </div>

        {/* ── RIGHT: Form panel ── */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-sm">

            {/* ── Logo — visible on ALL screen sizes (matches mockup) ── */}
            <div className="flex items-center justify-center gap-2.5 mb-7">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/branding/community-greentoken-logo.png"
                  alt="Community GreenToken"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="font-bold text-gray-900 text-base">
                Community <span className="text-primary-600">GreenToken</span>
              </span>
            </div>

            {/* ── Heading ── */}
            <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500 text-center mb-7">Sign in to continue your green journey.</p>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true">
                    ✉️
                  </span>
                  <input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password"
                    className="text-xs text-primary-600 hover:text-primary-700 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  />
                  <button type="button"
                    onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                🌿 Sign In
              </Button>
            </form>

            {/* ── Divider ── */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
            </div>

            {/* ── Connect Wallet ── */}
            <button
              type="button"
              onClick={() => showToast("Freighter wallet login coming soon!", "info")}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 border-2 border-primary-300",
                "text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              )}>
              🔗 Connect Wallet
            </button>

            {/* ── Social logins ── */}
            <p className="text-center text-xs text-gray-400 my-3">Or continue with</p>

            <div className="flex gap-2.5">
              {[
                { name: "Google",    label: "G",   style: "text-red-500"  },
                { name: "Apple",     label: "🍎",  style: "text-gray-900" },
                { name: "Microsoft", label: "⊞",   style: "text-blue-600" },
              ].map(({ name, label, style }) => (
                <button key={name} type="button"
                  aria-label={`Sign in with ${name}`}
                  onClick={() => showToast(`${name} sign-in coming soon!`, "info")}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold transition-colors",
                    "hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                    style
                  )}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Sign up link ── */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup"
                className="text-primary-600 font-semibold hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                Sign up
              </Link>
            </p>

            {/* ── Trust badges — bottom of form, matches mockup ── */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-3">
              {TRUST_BADGES.map(({ icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="text-lg mb-1" aria-hidden="true">{icon}</div>
                  <p className="text-xs font-semibold text-gray-700 leading-tight">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
