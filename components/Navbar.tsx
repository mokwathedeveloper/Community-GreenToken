"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import {
  MHome, MLightbulb, MBarChart, MTrophy, MGift, MPeople,
  MBolt, MLogin, MLeaf, MCoin, MDashboard,
} from "@/components/icons";

const NAV_LINKS = [
  { href: "/",              label: "Home",          Icon: MHome        },
  { href: "/how-it-works",  label: "How It Works",  Icon: MLightbulb   },
  { href: "/impact",        label: "Impact",        Icon: MBarChart    },
  { href: "/leaderboard",   label: "Leaderboard",   Icon: MTrophy      },
  { href: "/redeem",        label: "Redeem",        Icon: MGift        },
  { href: "/about",         label: "About Us",      Icon: MPeople      },
  { href: "/submit-action", label: "Submit Action", Icon: MBolt        },
  { href: "/tokenomics",    label: "Tokenomics",    Icon: MCoin        },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, displayName, avatarUrl } = useUser();
  const isLoggedIn = !isLoading && !!user;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="Community GreenToken home">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/branding/community-greentoken-logo.png"
              alt=""
              fill
              className="object-contain"
              sizes="32px"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors hidden sm:block truncate max-w-[160px]">
            Community GreenToken
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-0.5" role="list">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active   = pathname === href;
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

        {/* Desktop Auth / User Area */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {isLoading ? (
            // Skeleton placeholder — prevents layout shift while auth resolves
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
              <div className="h-8 w-28 bg-gray-100 animate-pulse rounded-lg" />
            </div>
          ) : isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <MDashboard className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Dashboard
              </Link>
              {/* Avatar / display name */}
              <Link
                href="/profile"
                aria-label="Your profile"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName ?? "Profile"}
                    width={28}
                    height={28}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-700 leading-none">
                      {(displayName ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden xl:block max-w-[100px] truncate">
                  {displayName}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <MLogin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Sign In
              </Link>
              <Link
                href="/org/setup"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <MLeaf className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Menu — slide-in-from-top fade-in animation (tailwindcss-animate) */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-in fade-in-0 slide-in-from-top-2 duration-200"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
        >
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation",
                pathname === href
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}

          {/* Mobile Auth / User Area */}
          <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
            {isLoading ? (
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
            ) : isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? "Profile"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-700">
                        {(displayName ?? "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors min-h-[44px] touch-manipulation"
                >
                  <MDashboard className="w-4 h-4" aria-hidden="true" />
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] touch-manipulation"
                >
                  <MLogin className="w-4 h-4" aria-hidden="true" />
                  Sign In
                </Link>
                <Link
                  href="/org/setup"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm min-h-[44px] touch-manipulation"
                >
                  <MLeaf className="w-4 h-4" aria-hidden="true" />
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
