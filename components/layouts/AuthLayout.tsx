import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

// Spec: DESIGN_SPEC.md Section 7.3
// Split layout: hero image left + form right
// Used by: Sign In, Sign Up

interface AuthLayoutProps {
  children: ReactNode;
  heroImage: string;
  heroAlt: string;
}

export default function AuthLayout({ children, heroImage, heroAlt }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Skip link (accessibility) */}
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-primary-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to form
      </a>

      {/* Hero image side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/15" aria-hidden="true" />

        {/* Brand overlay */}
        <div className="absolute bottom-8 left-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9">
              <Image src="/branding/community-greentoken-logo.png" alt="" fill className="object-contain" sizes="36px" />
            </div>
            <span className="text-white font-bold text-sm drop-shadow">Community GreenToken</span>
          </Link>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div id="auth-form" className="w-full max-w-md" tabIndex={-1}>
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-10 h-10">
                <Image src="/branding/community-greentoken-logo.png" alt="Community GreenToken" fill className="object-contain" sizes="40px" />
              </div>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
