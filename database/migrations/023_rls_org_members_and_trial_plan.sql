-- Migration 023: Enable RLS on org_members + fix trial plan for existing orgs
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- ── 1. Enable RLS on org_members (was missing — migration 002 skipped it) ──────
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Drop any old recursive policies that caused 500 errors
DROP POLICY IF EXISTS "org_members_select"        ON public.org_members;
DROP POLICY IF EXISTS "org_members_select_member" ON public.org_members;
DROP POLICY IF EXISTS "org_members_own_rows"      ON public.org_members;

-- SELECT: each user can read their own membership rows (non-recursive)
CREATE POLICY "org_members_read_own" ON public.org_members
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT/UPDATE/DELETE: admin routes use service_role key (bypasses RLS)
-- Regular members do not insert/update/delete org_members directly

-- ── 2. Upgrade existing trialing orgs from free → pro plan ───────────────────
-- New orgs created after migration 022 already start as "pro" trialing.
-- Orgs created before that fix still have plan="free" + status="trialing".
-- Fix: promote all active trials to pro so analytics/features work.

UPDATE public.organizations
SET
  plan         = 'pro',
  member_limit = 5000
WHERE
  subscription_status = 'trialing'
  AND plan            = 'free'
  AND trial_ends_at   > NOW();  -- only upgrade if trial is still active

-- ── Verification queries ─────────────────────────────────────────────────────
-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'org_members';
--
-- Check policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'org_members';
--
-- Check upgraded orgs:
-- SELECT name, plan, subscription_status, trial_ends_at FROM organizations
-- WHERE subscription_status = 'trialing' ORDER BY created_at DESC;
