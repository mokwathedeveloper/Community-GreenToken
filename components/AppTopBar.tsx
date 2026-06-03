"use client";

import { BellIcon, ChevronDownIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Coins } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatGTK } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.3

interface AppTopBarProps {
  title: string;
  tokenBalance?: bigint | null;
  userAvatarUrl?: string | null;
  userName?: string | null;
  notificationCount?: number;
}

export default function AppTopBar({
  title,
  tokenBalance,
  userAvatarUrl,
  userName,
  notificationCount = 0,
}: AppTopBarProps) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const shortName = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">

      {/* Page title / breadcrumb */}
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
        {tokenBalance !== undefined && tokenBalance !== null && (
          <div
            role="status"
            aria-label={`Token balance: ${formatGTK(tokenBalance)} GTK`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100"
          >
            <Coins className="w-4 h-4 text-primary-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-primary-700">
              {formatGTK(tokenBalance)}
            </span>
          </div>
        )}

        {/* Notifications */}
        <button
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          <BellIcon className="w-5 h-5" aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </button>

        {/* User avatar */}
        <button
          aria-label="Open user menu"
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          {userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt={userName ?? "User avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold ring-2 ring-white">
              {shortName}
            </div>
          )}
          <ChevronDownIcon className="w-4 h-4 text-gray-400 hidden sm:block" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
