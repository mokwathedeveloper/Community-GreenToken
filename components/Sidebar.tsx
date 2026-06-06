"use client";

// Rebuilt to exactly match mockup/dashboard_page_mockup.png
// Key mockup observations:
// 1. Logo + "Community GreenToken" at top
// 2. "Submit Action" green button below logo
// 3. Nav: Dashboard, Actions, Rewards, Donations, Leaderboard, Analytics, Settings
// 4. NO admin items in user sidebar (those live in org admin layout)
// 5. Bottom: plant illustration + "Together we create a greener tomorrow" + "Learn More"
// Rule R-COMP-07: SidebarBottomImage pinned with mt-auto

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MDashboard, MBolt, MGift, MHeart, MTrophy, MBarChart, MSettings, MAttachMoney } from "@/components/icons";
import { cn } from "@/lib/utils";

// Member sidebar — NO billing (billing is owner-only in OrgAdminLayout)
// RBAC: member sees personal finance (earn, redeem rewards, donate, withdraw cash)
const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",          Icon: MDashboard    },
  { label: "Actions",     href: "/submit-action",      Icon: MBolt         },
  { label: "Rewards",     href: "/redeem",             Icon: MGift         },
  { label: "Withdraw",    href: "/withdraw",           Icon: MAttachMoney  },
  { label: "Donations",   href: "/donations",          Icon: MHeart        },
  { label: "Leaderboard", href: "/leaderboard",        Icon: MTrophy       },
  { label: "Analytics",   href: "/analytics",          Icon: MBarChart     },
  { label: "Settings",    href: "/org/admin/settings", Icon: MSettings     },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      aria-label="Application navigation"
      className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm flex-shrink-0"
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image
            src="/branding/community-greentoken-logo.png"
            alt=""
            fill
            className="object-contain"
            sizes="36px"
            aria-hidden="true"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-gray-900 leading-tight block">
            Community
          </span>
          <span className="text-xs font-bold text-primary-600 leading-tight block">
            GreenToken
          </span>
        </div>
      </div>

      {/* ── Submit Action button (matches mockup green CTA) ──────────── */}
      <div className="px-3 pt-3 pb-1">
        <Link
          href="/submit-action"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold",
            "bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-150",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
          )}
        >
          <span className="text-base" aria-hidden="true">+</span>
          Submit Action
        </Link>
      </div>

      {/* ── Primary Navigation ───────────────────────────────────────── */}
      <nav aria-label="Main navigation" className="px-3 py-2 space-y-0.5 overflow-y-auto flex-1">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary-600" : "text-gray-400")}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section (matches mockup exactly) ─────────────────── */}
      {/* Rule R-COMP-07: mt-auto pins to bottom */}
      <div className="px-4 pb-4 mt-auto">
        {/* Plant illustration */}
        <div className="flex justify-center mb-2">
          <Image
            src="/assets/image/sidebar/sidebar_bottom_all_pages.png"
            alt="Together we create a greener tomorrow"
            width={120}
            height={120}
            className="w-28 h-auto object-contain"
            loading="eager"
          />
        </div>
        <p className="text-xs text-gray-500 text-center mb-2 leading-snug">
          Together we create<br />a greener tomorrow
        </p>
        <Link
          href="/how-it-works"
          className={cn(
            "flex items-center justify-center w-full py-2 text-xs font-semibold",
            "text-primary-600 border border-primary-200 rounded-lg",
            "hover:bg-primary-50 transition-colors duration-100",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          )}
        >
          Learn More
        </Link>
      </div>
    </aside>
  );
}
