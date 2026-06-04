"use client";

/**
 * UserProvider — single Supabase auth subscription for the entire app.
 *
 * WHY: useUser() was being called in 13+ components. Each instance
 * created its own onAuthStateChange listener. One refreshSession() call
 * fired all 13 listeners simultaneously → 13 concurrent Supabase queries
 * → 401 cascade / infinite loop.
 *
 * FIX: One provider at the root of the app. All components read from
 * context — zero duplicate subscriptions.
 */

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "superadmin" | "owner" | "admin" | "member" | null;

export interface AppUser {
  user:         User | null;
  role:         AppRole;
  orgId:        string | null;
  orgName:      string | null;
  orgSlug:      string | null;
  displayName:  string | null;
  avatarUrl:    string | null;
  isLoading:    boolean;
  isSuperAdmin: boolean;
  isOrgAdmin:   boolean;
  isMember:     boolean;
}

const INITIAL: AppUser = {
  user: null, role: null, orgId: null, orgName: null, orgSlug: null,
  displayName: null, avatarUrl: null, isLoading: true,
  isSuperAdmin: false, isOrgAdmin: false, isMember: false,
};

const UserContext = createContext<AppUser>(INITIAL);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppUser>(INITIAL);

  // Prevent concurrent loadUser() calls — only one in-flight at a time
  const isLoadingRef   = useRef(false);
  const mountedRef     = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();

    async function loadUser() {
      // Skip if already loading — prevents cascade from multiple rapid auth events
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mountedRef.current) setState({ ...INITIAL, isLoading: false });
          return;
        }

        const user = session.user;

        // Check superadmin via app_metadata (set by Supabase admin API)
        const jwtRole = user.app_metadata?.role as string | undefined;
        if (jwtRole === "superadmin") {
          if (mountedRef.current) setState({
            user, role: "superadmin", orgId: null, orgName: null, orgSlug: null,
            displayName: user.user_metadata?.display_name ?? user.email ?? "Super Admin",
            avatarUrl: user.user_metadata?.avatar_url ?? null,
            isLoading: false, isSuperAdmin: true, isOrgAdmin: false, isMember: false,
          });
          return;
        }

        // Fetch org + role via our own API (admin key server-side — no RLS issues)
        // Previously queried org_members directly from client → RLS blocked it → 401 spam
        let role: AppRole = "member";
        let orgId: string | null = null;
        let orgName: string | null = null;
        let orgSlug: string | null = null;

        try {
          const meRes = await fetch("/api/auth/me");
          if (meRes.ok) {
            const me = await meRes.json();
            role    = (me.data?.role as AppRole) ?? "member";
            orgId   = me.data?.org?.id   ?? null;
            orgName = me.data?.org?.name ?? null;
            orgSlug = me.data?.org?.slug ?? null;
          }
        } catch {
          // Network error — use defaults, do not retry
        }

        if (mountedRef.current) setState({
          user,
          role,
          orgId,
          orgName,
          orgSlug,
          displayName: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "User",
          avatarUrl:   user.user_metadata?.avatar_url   ?? null,
          isLoading:   false,
          isSuperAdmin: false,
          isOrgAdmin:   role === "owner" || role === "admin",
          isMember:     role === "member",
        });
      } catch {
        if (mountedRef.current) setState({ ...INITIAL, isLoading: false });
      } finally {
        isLoadingRef.current = false;
      }
    }

    loadUser();

    // Single subscription — shared across all consumers via context
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser();
      } else {
        setState({ ...INITIAL, isLoading: false });
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // ← runs ONCE for the whole app

  return <UserContext.Provider value={state}>{children}</UserContext.Provider>;
}

/** Read user state anywhere in the tree — no extra subscriptions */
export function useUser(): AppUser {
  return useContext(UserContext);
}
