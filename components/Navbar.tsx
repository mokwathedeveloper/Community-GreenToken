"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MHome, MLightbulb, MBarChart, MTrophy, MGift, MPeople, MBolt, MLogin, MLeaf } from "@/components/icons";

// Spec: DESIGN_SPEC.md Section 6.1
// Rule R-COMP-08: Navbar is public-facing, RockieRaheem owns this.

const NAV_LINKS = [
  { href: "/",              label: "Home",          Icon: MHome        },
  { href: "/how-it-works",  label: "How It Works",  Icon: MLightbulb   },
  { href: "/impact",        label: "Impact",        Icon: MBarChart    },
  { href: "/leaderboard",   label: "Leaderboard",   Icon: MTrophy      },
  { href: "/redeem",        label: "Redeem",        Icon: MGift        },
  { href: "/about",         label: "About Us",      Icon: MPeople      },
  { href: "/submit-action", label: "Submit Action", Icon: MBolt        },
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
        <div className="hidden lg:flex items-center gap-0.5" role="list">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            const isAction = href === "/submit-action";
            return (
              <Link
                key={href}
                href={href}
                role="listitem"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-100 whitespace-nowrap",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  isAction
                    ? "text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200"
                    : active
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/signin"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <MLogin className="w-3.5 h-3.5" aria-hidden="true" />
            Sign In
          </Link>
          <Link
            href="/org/setup"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <MLeaf className="w-3.5 h-3.5" aria-hidden="true" />
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
          className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-in slide-up duration-200"
        >
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                pathname === href
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <MLogin className="w-4 h-4" aria-hidden="true" />
              Sign In
            </Link>
            <Link
              href="/org/setup"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150 shadow-sm"
            >
              <MLeaf className="w-4 h-4" aria-hidden="true" />
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
