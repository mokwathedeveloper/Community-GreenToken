"use client";

import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import AppTopBar from "@/components/AppTopBar";

interface AppLayoutProps {
  children:      ReactNode;
  title:         string;
  tokenBalance?: bigint | null;
}

export default function AppLayout({ children, title, tokenBalance }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Skip link for keyboard/screen reader users */}
      <a
        href="#page-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-primary-600 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to content
      </a>

      <Sidebar drawerOpen={drawerOpen} onDrawerClose={closeDrawer} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AppTopBar
          title={title}
          tokenBalance={tokenBalance}
          onMenuOpen={openDrawer}
          menuOpen={drawerOpen}
        />

        <main
          id="page-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus:outline-none"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
