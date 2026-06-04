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
  ChartBarIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import NetworkBadge from "@/components/stellar/NetworkBadge";

// Admin-only navigation — NO member pages (submit action, rewards, withdraw, donate, leaderboard)
// Those live in the member Sidebar (Sidebar.tsx).
// ownerOnly: true → only org owner and superadmin can see
const ORG_NAV = [
  { label: "Overview",              href: "/org/admin",          Icon: Squares2X2Icon,    ownerOnly: false },
  { label: "Members",               href: "/org/admin/members",  Icon: UsersIcon,         ownerOnly: false },
  { label: "Verify Actions",        href: "/org/admin/actions",  Icon: BoltIcon,          ownerOnly: false },
  { label: "Analytics",             href: "/analytics",          Icon: ChartBarIcon,      ownerOnly: false },
  { label: "Billing",               href: "/org/admin/billing",  Icon: CreditCardIcon,    ownerOnly: true  },
  { label: "Organization Settings", href: "/org/admin/settings", Icon: BuildingOfficeIcon,ownerOnly: false },
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

        {/* Nav — Billing hidden from admin role (owner-only per RBAC) */}
        <nav aria-label="Organization admin menu" className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {ORG_NAV.filter(item => !item.ownerOnly || role === "owner" || role === "superadmin").map(({ label, href, Icon }) => {
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

        {/* Persistent + Invite Member CTA — always visible for admin/owner */}
        <div className="px-3 py-3 border-t border-gray-100">
          <Link
            href="/org/admin/members"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <UserPlusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            + Invite Member
          </Link>
        </div>

        {/* Plan indicator */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
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
