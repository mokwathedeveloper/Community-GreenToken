-- ============================================================
-- Migration 017: Fix recursive RLS on org_members
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- PROBLEM:
-- The org_members_select policy from migration 015 causes
-- a PostgreSQL infinite recursion (500 error):
--
--   USING (org_id IN (
--     SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
--   ))
--
-- PostgREST evaluates this by running an inner SELECT on org_members,
-- which triggers the policy again → infinite loop → 500.
--
-- FIX:
-- Replace with a non-recursive policy: users can only see their OWN row.
-- Admin pages that need to see all org members use the service role
-- (admin client) which bypasses RLS entirely.

-- Drop the recursive policy
DROP POLICY IF EXISTS "org_members_select"        ON public.org_members;
DROP POLICY IF EXISTS "org_members_select_member" ON public.org_members;

-- Simple non-recursive: each user can see their own membership row(s)
CREATE POLICY "org_members_own_rows" ON public.org_members
  FOR SELECT
  USING (user_id = auth.uid());

-- ── Also fix the organizations select policy (same recursion risk) ──
-- The previous policy checked org_members inside organizations select,
-- which could also recurse. Replace with a direct auth check.

DROP POLICY IF EXISTS "orgs_select_member" ON public.organizations;

-- Users can read orgs they belong to (checked via a security-definer function
-- to avoid recursion — or simply allow authenticated users to read org by ID
-- if they have the org_id, which is safe since org slugs are public anyway).
-- For now: any authenticated user can read any org (org names are not secret).
-- RLS on the tenant data tables (actions, tokens, etc.) enforces isolation.
CREATE POLICY "orgs_select_authenticated" ON public.organizations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── Verify: run this to check for remaining recursive policies ──────
-- SELECT schemaname, tablename, policyname, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
