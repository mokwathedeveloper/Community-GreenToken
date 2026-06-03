"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon, BoltIcon, GiftIcon, HeartIcon,
  TrophyIcon, ChartBarIcon, Cog6ToothIcon,
  UsersIcon, BuildingOfficeIcon, CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  BoltIcon as BoltIconSolid,
  GiftIcon as GiftIconSolid,
  HeartIcon as HeartIconSolid,
  TrophyIcon as TrophyIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.2
// Rule R-COMP-07: SidebarBottomImage MUST be last, pinned with mt-auto

interface NavItem {
  label:       string;
  href:        string;
  icon:        React.ElementType;
  iconActive?: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",   icon: HomeIcon,      iconActive: HomeIconSolid },
  { label: "Actions",     href: "/feature",     icon: BoltIcon,      iconActive: BoltIconSolid },
  { label: "Rewards",     href: "/redeem",      icon: GiftIcon,      iconActive: GiftIconSolid },
  { label: "Donations",   href: "/donations",   icon: HeartIcon,     iconActive: HeartIconSolid },
  { label: "Leaderboard", href: "/leaderboard", icon: TrophyIcon,    iconActive: TrophyIconSolid },
  { label: "Analytics",   href: "/analytics",   icon: ChartBarIcon,  iconActive: ChartBarIconSolid },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Members",  href: "/org/admin/members",  icon: UsersIcon },
  { label: "Org Admin", href: "/org/admin",         icon: BuildingOfficeIcon },
  { label: "Billing",  href: "/org/admin/billing",  icon: CreditCardIcon },
  { label: "Settings", href: "/org/admin/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside
      aria-label="Application navigation"
      className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image src="/branding/community-greentoken-logo.png" alt="" fill className="object-contain" sizes="32px" />
        </div>
        <span className="text-sm font-bold text-gray-900 leading-tight">
          Community<br />GreenToken
        </span>
      </div>

      {/* Primary navigation */}
      <nav aria-label="Main" className="px-3 py-4 space-y-0.5 overflow-y-auto flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon, iconActive: IconActive }) => {
          const active = isActive(href);
          const ActiveIcon = active && IconActive ? IconActive : Icon;
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
              <ActiveIcon
                className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary-600" : "text-gray-400")}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}

        {/* Admin section divider */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
        </div>

        {ADMIN_ITEMS.map(({ label, href, icon: Icon }) => {
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
              <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-primary-600" : "text-gray-400")} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom image — Rule R-COMP-07: MUST be last with mt-auto */}
      <div className="px-4 pb-5 mt-auto">
        <Image
          src="/assets/image/sidebar/sidebar_bottom_all_pages.png"
          alt="Together we create a greener tomorrow"
          width={160}
          height={160}
          className="w-full max-w-[160px] mx-auto h-auto object-contain mb-3"
          loading="lazy"
        />
        <p className="text-xs text-gray-500 text-center mb-2.5 leading-snug">
          Together we create a greener tomorrow
        </p>
        <Link
          href="/how-it-works"
          className="flex items-center justify-center w-full py-2 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          Learn More
        </Link>
      </div>
    </aside>
  );
}
