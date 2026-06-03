"use client";

// Rules applied:
// R-FE-01: TypeScript (.tsx)
// R-FE-02: Typed props/interfaces
// R-COLOR-02: primary-600 on white text
// R-A11Y-01: focus-visible rings
// R-A11Y-03: labels + htmlFor on all inputs
// R-FE-07: Next.js <Image> for hero
// R-IMG-02: canonical hero path assets/image/pages/auth/signin_hero.png
// Spec: ux_ui/feature_specv2/signin_page_md.md

import type { Metadata } from "next";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Note: metadata export only works in Server Components
// This is a Client Component due to state; metadata declared separately
const PAGE_TITLE = "Sign In";

const SOCIAL_PROVIDERS = [
  { name: "Google",    icon: "G", bg: "bg-red-50   text-red-600   border-red-200"   },
  { name: "Apple",     icon: "🍎", bg: "bg-gray-50  text-gray-700  border-gray-200"  },
  { name: "Microsoft", icon: "⊞", bg: "bg-blue-50  text-blue-600  border-blue-200" },
];

const TRUST_BADGES = [
  { icon: "🌿", title: "Sustainable Impact",   desc: "Every action builds a greener tomorrow" },
  { icon: "👥", title: "Community Powered",   desc: "Together we build stronger communities" },
  { icon: "🔒", title: "Secure & Transparent", desc: "Your data stays yours, always"        },
];

export default function SignInPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showPwd,  setShowPwd]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Phase 2: replace with supabase.auth.signInWithPassword({ email, password })
      await new Promise((r) => setTimeout(r, 800)); // simulated
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // Rule R-IMG-02: AuthLayout with canonical hero path
    <div className="flex min-h-screen">
      {/* Hero side — R-FE-07: Next.js Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/assets/image/pages/auth/signin_hero.png"
          alt="Eco-friendly garden with people tending plants under sunlight"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
        <div className="absolute bottom-8 left-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/branding/community-greentoken-logo.png" alt="" fill={false}
              width={36} height={36} className="object-contain" />
            <span className="text-white font-bold text-sm drop-shadow">Community GreenToken</span>
          </Link>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" aria-label="Community GreenToken home">
              <Image src="/branding/community-greentoken-logo.png" alt="Community GreenToken" width={48} height={48} />
            </Link>
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">{PAGE_TITLE}</h1>
          <p className="text-sm text-gray-500 text-center mb-8">Sign in to continue your green journey.</p>

          {/* Error message — R-A11Y-07: role="alert" */}
          {error && (
            <div role="alert" className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
              <span aria-hidden="true">⚠</span>{error}
            </div>
          )}

          {/* Form — R-A11Y-03: labels on all inputs */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="signin-email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className={cn(
                  "text-xs text-primary-600 hover:text-primary-700 transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                )}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={cn(
                    "w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-lg",
                    "text-gray-900 placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  )}
                />
                {/* R-A11Y-01: show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
                >
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* R-COLOR-02: bg-primary-600 for white text */}
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<span>🌿</span>}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
          </div>

          {/* Wallet connect */}
          <button
            type="button"
            onClick={() => alert("Freighter wallet integration — Phase 2")}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-3 border-2 border-primary-300",
              "text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors mb-4",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}
          >
            <span aria-hidden="true">🔗</span> Connect Wallet
          </button>

          <p className="text-center text-xs text-gray-400 mb-4">Or continue with</p>

          {/* Social providers */}
          <div className="flex gap-3">
            {SOCIAL_PROVIDERS.map(({ name, icon, bg }) => (
              <button
                key={name}
                type="button"
                aria-label={`Sign in with ${name}`}
                className={cn(
                  "flex-1 flex items-center justify-center py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                  bg, "hover:opacity-80",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                )}
              >
                {icon}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              Sign up
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-10 w-full max-w-md grid grid-cols-3 gap-3">
          {TRUST_BADGES.map(({ icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="text-xl mb-1" aria-hidden="true">{icon}</div>
              <p className="text-xs font-medium text-gray-700">{title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
