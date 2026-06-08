"use client";

import { BellIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Coins } from "lucide-react";
import { formatGTK } from "@/lib/utils";
import UserMenu from "@/components/ui/UserMenu";
import { useUser } from "@/hooks/useUser";

interface AppTopBarProps {
  title: string;
  tokenBalance?: bigint | null;
}

export default function AppTopBar({ title, tokenBalance }: AppTopBarProps) {
  const { user, role, orgName, displayName, avatarUrl, isOrgAdmin, isSuperAdmin } = useUser();

  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-900 truncate max-w-xs">
        {title}
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-3">

        {/* Date */}
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <time dateTime={new Date().toISOString().split("T")[0]}>{today}</time>
        </span>

        {/* GTK Token chip */}
        {tokenBalance != null && (
          <div
            role="status"
            aria-label={`Token balance: ${formatGTK(tokenBalance)} GTK`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100"
          >
            <Coins className="w-4 h-4 text-primary-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-primary-700">{formatGTK(tokenBalance)}</span>
          </div>
        )}

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          <BellIcon className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* User menu — real data, working logout */}
        <UserMenu
          displayName={displayName}
          email={user?.email}
          avatarUrl={avatarUrl}
          role={role}
          orgName={orgName}
          isOrgAdmin={isOrgAdmin}
          isSuperAdmin={isSuperAdmin}
        />
      </div>
    </header>
  );
}
