"use client";

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
  { icon: "👥", title: "Community Powered",    desc: "Together we build stronger communities"   },
  { icon: "🔒", title: "Secure & Transparent", desc: "Your data stays yours, always"            },
];

// Map Supabase error messages to user-friendly text
function friendlyError(msg: string): string {
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Please check your inbox and confirm your email before signing in.";
  }
  if (msg.includes("Too many requests") || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
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
        // Small delay so the user sees the success toast before redirect
        await new Promise((r) => setTimeout(r, 900));
        router.push("/dashboard");
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
            src="/assets/image/pages/auth/signin_hero.png"
            alt="People tending an eco-friendly garden"
            fill className="object-cover" priority sizes="50vw"
          />
          <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
          <div className="absolute bottom-8 left-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/branding/community-greentoken-logo.png" alt="" width={36} height={36} className="object-contain" />
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

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500 text-center mb-8">Sign in to continue your green journey.</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                id="signin-email" type="email" label="Email address"
                placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" required
              />

              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
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
              onClick={() => showToast("Freighter wallet login coming soon!", "info")}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 py-3 border-2 border-primary-300",
                "text-sm font-semibold text-primary-700 rounded-xl hover:bg-primary-50 transition-colors mb-4",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              )}
            >
              <span aria-hidden="true">🔗</span> Connect Wallet
            </button>

            <p className="text-center text-xs text-gray-400 mb-4">Or continue with</p>

            <div className="flex gap-3">
              {["Google", "Apple", "Microsoft"].map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`Sign in with ${name}`}
                  onClick={() => showToast(`${name} sign-in coming soon!`, "info")}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                    "border-gray-200 text-gray-600 hover:bg-gray-50",
                    "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                  )}
                >
                  {name === "Google" ? "G" : name === "Apple" ? "🍎" : "⊞"}
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
    </>
  );
}
