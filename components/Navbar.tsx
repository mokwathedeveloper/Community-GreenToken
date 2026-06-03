"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.1
// Rule R-COMP-08: Navbar is public-facing, RockieRaheem owns this.

const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/impact",       label: "Impact" },
  { href: "/leaderboard",  label: "Leaderboard" },
  { href: "/redeem",       label: "Redeem" },
  { href: "/about",        label: "About Us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Community GreenToken home">
          <div className="relative w-8 h-8">
            <Image
              src="/branding/community-greentoken-logo.png"
              alt=""
              fill
              className="object-contain"
              sizes="32px"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors hidden sm:block">
            Community GreenToken
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              role="listitem"
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-100",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                pathname === href
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/signin"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            Sign In
          </Link>
          <Link
            href="/org/setup"
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-in slide-up duration-200"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                pathname === href
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              Sign In
            </Link>
            <Link
              href="/org/setup"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
