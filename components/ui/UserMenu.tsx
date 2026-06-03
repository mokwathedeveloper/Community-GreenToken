"use client";

/**
 * UserMenu — profile dropdown with logout
 * Shows: user name, email, role badge, nav links, logout button
 *
 * ROLE BADGES:
 *   superadmin → purple  "Super Admin"
 *   owner      → amber   "Org Owner"
 *   admin      → blue    "Org Admin"
 *   member     → green   "Member"
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/hooks/useUser";

interface UserMenuProps {
  displayName:  string | null;
  email?:       string | null;
  avatarUrl?:   string | null;
  role:         AppRole;
  orgName?:     string | null;
  isOrgAdmin?:  boolean;
  isSuperAdmin?: boolean;
}

const ROLE_META: Record<NonNullable<AppRole>, { label: string; classes: string }> = {
  superadmin: { label: "Super Admin", classes: "bg-purple-100 text-purple-700 border-purple-200" },
  owner:      { label: "Org Owner",   classes: "bg-amber-100  text-amber-700  border-amber-200"  },
  admin:      { label: "Org Admin",   classes: "bg-blue-100   text-blue-700   border-blue-200"   },
  member:     { label: "Member",      classes: "bg-green-100  text-green-700  border-green-200"  },
};

export default function UserMenu({
  displayName,
  email,
  avatarUrl,
  role,
  orgName,
  isOrgAdmin,
  isSuperAdmin,
}: UserMenuProps) {
  const router    = useRouter();
  const menuRef   = useRef<HTMLDivElement>(null);
  const [open, setOpen]         = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const roleMeta = role ? ROLE_META[role] : null;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/signin");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open user menu"
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded-full transition-colors duration-150",
          "hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
          open && "bg-gray-100"
        )}
      >
        {/* Avatar */}
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName ?? "User"} width={32} height={32}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold ring-2 ring-white">
            {initials}
          </div>
        )}
        {/* Name (hidden on mobile) */}
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {displayName ?? "User"}
        </span>
        <ChevronDownIcon
          className={cn("w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className={cn(
            "absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50",
            "animate-in fade-in slide-in-from-top-2 duration-150"
          )}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-2">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName ?? "User"}</p>
                {email && <p className="text-xs text-gray-400 truncate">{email}</p>}
              </div>
            </div>
            {/* Role badge */}
            {roleMeta && (
              <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border", roleMeta.classes)}>
                <span aria-hidden="true">
                  {role === "superadmin" ? "👑" :
                   role === "owner"      ? "🏢" :
                   role === "admin"      ? "🛡️" : "🌿"}
                </span>
                {roleMeta.label}
              </span>
            )}
            {orgName && (
              <p className="text-xs text-gray-400 mt-1 truncate">📍 {orgName}</p>
            )}
          </div>

          {/* Nav links */}
          <div className="py-1">
            <MenuItem icon={<UserCircleIcon className="w-4 h-4" />} label="My Profile"
              href="/profile" onClick={() => setOpen(false)} />
            <MenuItem icon={<Cog6ToothIcon className="w-4 h-4" />} label="Settings"
              href="/org/admin/settings" onClick={() => setOpen(false)} />

            {/* Org admin link */}
            {isOrgAdmin && (
              <MenuItem icon={<BuildingOfficeIcon className="w-4 h-4" />} label="Admin Dashboard"
                href="/org/admin" onClick={() => setOpen(false)} />
            )}

            {/* Super admin link */}
            {isSuperAdmin && (
              <MenuItem icon={<ShieldCheckIcon className="w-4 h-4" />} label="Platform Admin"
                href="/admin" onClick={() => setOpen(false)}
                className="text-purple-700" />
            )}
          </div>

          {/* Role info hint */}
          <div className="px-4 py-2 border-t border-gray-50 border-b border-gray-50">
            <p className="text-xs text-gray-400 leading-snug">
              {role === "superadmin" && "You have full platform access. Use responsibly."}
              {role === "owner"      && "You own this organization. You can manage billing and settings."}
              {role === "admin"      && "You can verify actions, manage members, and view analytics."}
              {role === "member"     && "You can submit actions, earn GTK tokens, and redeem rewards."}
              {!role                 && "Sign in to see your role and permissions."}
            </p>
          </div>

          {/* Logout */}
          <div className="py-1">
            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors",
                "focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none",
                "disabled:opacity-60 disabled:cursor-wait"
              )}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper for menu items
function MenuItem({
  icon, label, href, onClick, className,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none",
        className
      )}
    >
      <span className="text-gray-400" aria-hidden="true">{icon}</span>
      {label}
    </Link>
  );
}
