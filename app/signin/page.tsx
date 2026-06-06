"use client";

// Spec: ux_ui/feature_specv2/signin_page_md.md
// Mockup: mockup/signin_page_mockup.png
// Layout: full-screen hero background → white form card floating in the CENTER

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { MLeaf, MPeople, MLock, MLink } from "@/components/icons";

const TRUST_BADGES = [
  { Icon: MLeaf,   title: "Sustainable Impact",   desc: "Every action builds a greener tomorrow"  },
  { Icon: MPeople, title: "Community Powered",    desc: "Together we build stronger communities"  },
  { Icon: MLock,   title: "Secure & Transparent", desc: "Your data stays yours, always"           },
];

function friendlyError(msg: string): string {
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
    return "Incorrect email or password. Please try again.";
  if (msg.includes("Email not confirmed"))
    return "Please confirm your email before signing in.";
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
      if (error) { showToast(friendlyError(error.message), "error"); return; }
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

      {/*
        ── FULL-SCREEN LAYOUT ────────────────────────────────────────────
        Hero image fills the entire screen as background.
        White form card floats in the CENTER on top of the hero.
        Trust badges sit at the very bottom outside the card.
        ─────────────────────────────────────────────────────────────────
      */}
      {/* object-cover fills edge-to-edge — zero gaps, zero white bars */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10">

        {/* ── Full-screen background: covers every pixel, no bars ── */}
        <Image
          src="/assets/image/pages/auth/signin_hero.png"
          alt="People gardening in a sunlit eco-friendly garden"
          fill
          className="object-cover"
          style={{ objectPosition: "50% 55%" }}
          priority
          sizes="100vw"
        />

        {/* ── White form card — centered on the hero ── */}
        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-8">

          {/* Logo + name */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/branding/community-greentoken-logo.png"
                alt="Community GreenToken"
                fill
                className="object-contain"
                sizes="36px"
              />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              Community <span className="text-primary-600">GreenToken</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Welcome back</h1>
          <p className="text-xs text-gray-500 text-center mb-6">Sign in to continue your green journey.</p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">

            {/* Email */}
            <div>
              <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" aria-hidden="true">
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
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
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
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors bg-white"
                />
                <button type="button"
                  onClick={() => setShowPwd(p => !p)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm rounded focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none">
                  {showPwd ? "●" : "○"}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<MLeaf className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or</div>
          </div>

          {/* Connect Wallet */}
          <button
            type="button"
            onClick={() => showToast("Freighter wallet login coming soon!", "info")}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary-300",
              "text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            )}>
            <MLink className="w-4 h-4" /> Connect Wallet
          </button>

          {/* Social logins */}
          <p className="text-center text-xs text-gray-400 my-3">Or continue with</p>
          <div className="flex gap-2">
            {[
              { name: "Google",    label: "G",   cls: "text-red-500"  },
              { name: "Apple",     label: "🍎",  cls: "text-gray-900" },
              { name: "Microsoft", label: "⊞",   cls: "text-blue-600" },
            ].map(({ name, label, cls }) => (
              <button key={name} type="button"
                aria-label={`Sign in with ${name}`}
                onClick={() => showToast(`${name} sign-in coming soon!`, "info")}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  cls
                )}>
                {label}
              </button>
            ))}
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup"
              className="text-primary-600 font-semibold hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
              Sign up
            </Link>
          </p>
        </div>

        {/* ── Trust badges — dark text + frosted pill background for visibility ── */}
        {/* Hero bottom is very light so white text would be invisible — use dark text */}
        <div className="relative z-10 mt-6 w-full max-w-md grid grid-cols-3 gap-3 px-2">
          {TRUST_BADGES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center bg-white/75 backdrop-blur-sm rounded-2xl px-3 py-3 shadow-sm border border-white/60"
            >
              <Icon className="w-6 h-6 text-primary-600 mb-1.5" />
              <p className="text-xs font-bold text-gray-800 leading-tight">{title}</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
