"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MDashboard, MBolt, MGift, MHeart, MTrophy, MBarChart, MSettings, MAttachMoney, MCrown } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

const BASE_NAV = [
  { label: "Dashboard",    href: "/dashboard",     Icon: MDashboard,   adminHref: undefined                  },
  { label: "Actions",      href: "/submit-action", Icon: MBolt,        adminHref: undefined                  },
  { label: "Rewards",      href: "/redeem",        Icon: MGift,        adminHref: undefined                  },
  { label: "Withdraw",     href: "/withdraw",      Icon: MAttachMoney, adminHref: undefined                  },
  { label: "Certificates", href: "/certificates",  Icon: MCrown,       adminHref: undefined                  },
  { label: "Donations",    href: "/donations",     Icon: MHeart,       adminHref: undefined                  },
  { label: "Leaderboard",  href: "/leaderboard",   Icon: MTrophy,      adminHref: undefined                  },
  { label: "Analytics",    href: "/analytics",     Icon: MBarChart,    adminHref: undefined                  },
  { label: "Settings",     href: "/profile",       Icon: MSettings,    adminHref: "/org/admin/settings"      },
] as const;

interface SidebarProps {
  drawerOpen:    boolean;
  onDrawerClose: () => void;
}

// Shared nav body rendered in both desktop sidebar and mobile drawer
function SidebarNavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname    = usePathname();
  const { isOrgAdmin } = useUser();

  const NAV_ITEMS = BASE_NAV.map((item) => ({
    ...item,
    href: isOrgAdmin && item.adminHref ? item.adminHref : item.href,
  }));

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Submit Action CTA */}
      <div className="px-3 pt-3 pb-1">
        <Link
          href="/submit-action"
          onClick={onItemClick}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold",
            "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white transition-colors duration-150",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none",
          )}
        >
          <span className="text-base leading-none" aria-hidden="true">+</span>
          Submit Action
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Main navigation" className="px-3 py-2 space-y-0.5 overflow-y-auto flex-1">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onItemClick}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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

      {/* Bottom section */}
      <div className="px-4 pb-4 mt-auto">
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
          onClick={onItemClick}
          className={cn(
            "flex items-center justify-center w-full py-2 text-xs font-semibold",
            "text-primary-600 border border-primary-200 rounded-lg",
            "hover:bg-primary-50 transition-colors duration-100",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
          )}
        >
          Learn More
        </Link>
      </div>
    </>
  );
}

export default function Sidebar({ drawerOpen, onDrawerClose }: SidebarProps) {
  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDrawerClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, onDrawerClose]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────────────────────── */}
      <aside
        aria-label="Application navigation"
        className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm flex-shrink-0"
      >
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
            <span className="text-xs font-bold text-gray-900 leading-tight block">Community</span>
            <span className="text-xs font-bold text-primary-600 leading-tight block">GreenToken</span>
          </div>
        </div>

        <SidebarNavContent />
      </aside>

      {/* ── Mobile drawer (< lg) ──────────────────────────────────────────── */}

      {/* Backdrop — click to dismiss */}
      <div
        aria-hidden="true"
        onClick={onDrawerClose}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Slide-in panel */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 left-0 z-[60] flex flex-col w-72 bg-white shadow-2xl",
          "transition-transform duration-300 ease-in-out lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header: logo + close button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
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
            <div>
              <span className="text-xs font-bold text-gray-900 leading-tight block">Community</span>
              <span className="text-xs font-bold text-primary-600 leading-tight block">GreenToken</span>
            </div>
          </div>

          <button
            onClick={onDrawerClose}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <XMarkIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav content — same items as desktop, closes drawer on click */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <SidebarNavContent onItemClick={onDrawerClose} />
        </div>
      </div>
    </>
  );
}
