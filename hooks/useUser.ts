"use client";

/**
 * COMMUNITY GREENTOKEN — USER ROLES & ACCESS CONTROL
 * ====================================================
 *
 * ROLE HIERARCHY (Separation of Duties / RBAC)
 * ─────────────────────────────────────────────
 *
 * 1. SUPER ADMIN  (role: "superadmin")
 *    ├─ Set via Supabase custom JWT claim  (not in org_members)
 *    ├─ Access: /admin/* (platform overview, all orgs, MRR, contracts)
 *    ├─ Can: suspend orgs, view all billing, manage contracts
 *    └─ Cannot: act as a regular org user (separate concern)
 *
 * 2. ORG OWNER  (org_members.role = "owner")
 *    ├─ The user who created the org (set during /org/setup)
 *    ├─ Access: /org/admin/* including billing
 *    ├─ Can: manage billing, transfer ownership, delete org, all admin actions
 *    └─ Cannot: access other orgs or /admin platform pages
 *
 * 3. ORG ADMIN  (org_members.role = "admin")
 *    ├─ Invited or promoted by owner
 *    ├─ Access: /org/admin/* EXCEPT billing
 *    ├─ Can: verify actions, invite members, manage rewards, view analytics
 *    └─ Cannot: access billing, change org plan, transfer ownership
 *
 * 4. MEMBER  (org_members.role = "member")
 *    ├─ Regular end-user, invited via link
 *    ├─ Access: /dashboard, /feature, /redeem, /donations, /leaderboard, /analytics
 *    ├─ Can: submit actions, earn GTK tokens, donate, redeem rewards
 *    └─ Cannot: access /org/admin/* or /admin/*
 *
 * SEPARATION OF DUTIES:
 * ─────────────────────
 * • Action submission  ← Member only
 * • Action approval    ← Admin/Owner only  (SoD: cannot self-approve)
 * • Token minting      ← Soroban contract  (automated, not manual)
 * • Billing changes    ← Owner only
 * • Member removal     ← Admin/Owner only
 * • Org suspension     ← Super Admin only
 */

import { useEffect, useState } from "react";
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
  isOrgAdmin:   boolean;  // owner OR admin
  isMember:     boolean;
}

const INITIAL: AppUser = {
  user: null, role: null, orgId: null, orgName: null, orgSlug: null,
  displayName: null, avatarUrl: null, isLoading: true,
  isSuperAdmin: false, isOrgAdmin: false, isMember: false,
};

export function useUser(): AppUser {
  const [state, setState] = useState<AppUser>(INITIAL);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mounted) setState({ ...INITIAL, isLoading: false });
          return;
        }

        const user = session.user;

        // Check for superadmin in JWT app_metadata (set by Supabase service role)
        const jwtRole = user.app_metadata?.role as string | undefined;
        if (jwtRole === "superadmin") {
          if (mounted) setState({
            user, role: "superadmin", orgId: null, orgName: null, orgSlug: null,
            displayName: user.user_metadata?.display_name ?? user.email ?? "Super Admin",
            avatarUrl: user.user_metadata?.avatar_url ?? null,
            isLoading: false, isSuperAdmin: true, isOrgAdmin: false, isMember: false,
          });
          return;
        }

        // Fetch org membership + org details
        const { data: membershipRaw } = await supabase
          .from("org_members")
          .select("role, org_id, organizations(id, name, slug)")
          .eq("user_id", user.id)
          .order("joined_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const membership = membershipRaw as {
          role: string;
          org_id: string;
          organizations: { id: string; name: string; slug: string } | null;
        } | null;

        const role: AppRole = (membership?.role as AppRole) ?? "member";
        const org = membership?.organizations ?? null;

        if (mounted) setState({
          user,
          role,
          orgId:       org?.id   ?? null,
          orgName:     org?.name ?? null,
          orgSlug:     org?.slug ?? null,
          displayName: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "User",
          avatarUrl:   user.user_metadata?.avatar_url   ?? null,
          isLoading:   false,
          isSuperAdmin: false,
          isOrgAdmin:   role === "owner" || role === "admin",
          isMember:     role === "member",
        });
      } catch {
        if (mounted) setState({ ...INITIAL, isLoading: false });
      }
    }

    loadUser();

    // Re-load on auth state change (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
