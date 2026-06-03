-- ============================================================
-- Migration 015: Auth fixes — trigger + RLS on missing tables
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Make users.org_id nullable ───────────────────────────
-- New users sign up BEFORE creating an org (via /org/setup).
-- The NOT NULL constraint blocks the auto-create trigger.
ALTER TABLE public.users
  ALTER COLUMN org_id DROP NOT NULL;


-- ── 2. Auto-create profile trigger ──────────────────────────
-- When someone signs up, Supabase creates a row in auth.users.
-- This trigger immediately creates the matching public.users row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── 3. Enable RLS on tables that were missing it ────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits    ENABLE ROW LEVEL SECURITY;


-- ── 4. RLS policies: users table ────────────────────────────
-- Users can read/update only their own profile
DROP POLICY IF EXISTS "users_select_own"  ON public.users;
DROP POLICY IF EXISTS "users_update_own"  ON public.users;
DROP POLICY IF EXISTS "users_insert_own"  ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Org admins can read members in their org
CREATE POLICY "users_select_org_members" ON public.users
  FOR SELECT
  USING (
    org_id IS NOT NULL AND
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin','owner')
    )
  );


-- ── 5. RLS policies: organizations table ─────────────────────
DROP POLICY IF EXISTS "orgs_select_member"   ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert_owner"    ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_admin"    ON public.organizations;

-- Any authenticated user can create an org (for /org/setup)
CREATE POLICY "orgs_insert_owner" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Members can read their own org
CREATE POLICY "orgs_select_member" ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Admins/owners can update their org
CREATE POLICY "orgs_update_admin" ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin','owner')
    )
  );


-- ── 6. RLS policies: org_members table ───────────────────────
DROP POLICY IF EXISTS "org_members_select"   ON public.org_members;
DROP POLICY IF EXISTS "org_members_insert"   ON public.org_members;
DROP POLICY IF EXISTS "org_members_delete"   ON public.org_members;

-- Members can see other members in the same org
CREATE POLICY "org_members_select" ON public.org_members
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Anyone authenticated can join an org (via invite)
CREATE POLICY "org_members_insert" ON public.org_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins/owners can remove members
CREATE POLICY "org_members_delete" ON public.org_members
  FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin','owner')
    )
  );


-- ── 7. RLS policies: billing_events ──────────────────────────
DROP POLICY IF EXISTS "billing_events_org_scope" ON public.billing_events;

CREATE POLICY "billing_events_org_scope" ON public.billing_events
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin','owner')
    )
  );


-- ── 8. RLS policies: plan_limits (read-only for all) ─────────
DROP POLICY IF EXISTS "plan_limits_read_all" ON public.plan_limits;

CREATE POLICY "plan_limits_read_all" ON public.plan_limits
  FOR SELECT USING (true);


-- ── 9. Verify — this query should show all tables with RLS on ─
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
