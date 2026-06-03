"use client";

// Dedicated layout for Org Admin pages — matches mockup/org_admin_dashboard_mockup.png
// The org admin has its OWN sidebar (different from user dashboard sidebar)
// Sidebar items: Overview, Members, Actions, Rewards, Analytics, Billing,
//               Organization Settings, Team & Roles, Audit Logs, Statistics

import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useUser } from "@/hooks/useUser";
import {
  Squares2X2Icon,
  UsersIcon,
  BoltIcon,
  GiftIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import NetworkBadge from "@/components/stellar/NetworkBadge";

const ORG_NAV = [
  { label: "Overview",               href: "/org/admin",           Icon: Squares2X2Icon    },
  { label: "Members",                href: "/org/admin/members",   Icon: UsersIcon         },
  { label: "Actions",                href: "/feature",             Icon: BoltIcon          },
  { label: "Rewards",                href: "/redeem",              Icon: GiftIcon          },
  { label: "Analytics",              href: "/analytics",           Icon: ChartBarIcon      },
  { label: "Billing",                href: "/org/admin/billing",   Icon: CreditCardIcon    },
  { label: "Organization Settings",  href: "/org/admin/settings",  Icon: BuildingOfficeIcon },
  { label: "Team & Roles",           href: "/org/admin/members",   Icon: ShieldCheckIcon   },
  { label: "Audit Logs",             href: "/org/admin",           Icon: DocumentTextIcon  },
  { label: "Statistics",             href: "/analytics",           Icon: ChartBarIcon      },
];

interface OrgAdminLayoutProps {
  children: ReactNode;
  orgName?: string;
  plan?: string;
}

export default function OrgAdminLayout({
  children,
  orgName = "GreenFuture Org",
  plan = "Pro Plan",
}: OrgAdminLayoutProps) {
  const pathname = usePathname();
  const { user, role, orgName: realOrgName, displayName, avatarUrl, isOrgAdmin, isSuperAdmin } = useUser();
  const resolvedOrgName = realOrgName ?? orgName;

  const isActive = (href: string) =>
    href === "/org/admin" ? pathname === "/org/admin" : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Org Admin Sidebar */}
      <aside
        aria-label="Organization admin navigation"
        className="hidden lg:flex flex-col w-56 h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm flex-shrink-0"
      >
        {/* Logo + Org Name */}
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image src="/branding/community-greentoken-logo.png" alt="" fill className="object-contain" sizes="32px" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate leading-tight">Community</p>
            <p className="text-xs font-bold text-primary-600 truncate leading-tight">GreenToken</p>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Organization admin menu" className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {ORG_NAV.map(({ label, href, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-100",
                  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
                  active ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary-600" : "text-gray-400")} aria-hidden="true" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Plan indicator + Org name */}
        <div className="px-3 pb-4 mt-auto border-t border-gray-100 pt-3">
          <div className="bg-primary-50 rounded-xl p-3">
            <p className="text-xs font-bold text-primary-700">{plan}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{orgName}</p>
            <Link href="/org/admin/billing"
              className="mt-2 block text-xs font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-none">
              Manage Plan →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          <p className="text-sm font-semibold text-gray-700">{resolvedOrgName}</p>
          <div className="flex items-center gap-3">
            <NetworkBadge />
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
              {plan}
            </span>
            <UserMenu
              displayName={displayName}
              email={user?.email}
              avatarUrl={avatarUrl}
              role={role}
              orgName={resolvedOrgName}
              isOrgAdmin={isOrgAdmin}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        </header>

        {/* Page content */}
        <main id="org-admin-content" className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
