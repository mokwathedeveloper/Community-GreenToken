-- ============================================================
-- Migration 016: Set superadmin role + seed initial test users
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── How to make yourself Super Admin ────────────────────────
-- Replace 'your@email.com' with your actual email address.
-- This sets app_metadata.role = 'superadmin' on the auth.users row.
-- The JWT claim is read by proxy.ts and useUser.ts.

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "superadmin"}'::jsonb
WHERE email = 'mokwaohuru@gmail.com';

-- ── View: user roles across all orgs ─────────────────────────
-- Run this to see all users and their roles:
--
-- SELECT
--   u.email,
--   p.display_name,
--   om.role,
--   o.name AS org_name,
--   o.plan
-- FROM auth.users u
-- LEFT JOIN public.users p         ON p.id = u.id
-- LEFT JOIN public.org_members om  ON om.user_id = u.id
-- LEFT JOIN public.organizations o ON o.id = om.org_id
-- ORDER BY o.name, om.role;


-- ── Role reference ────────────────────────────────────────────
-- ROLE          | WHERE STORED          | ACCESS
-- ──────────────┼───────────────────────┼──────────────────────
-- superadmin    | auth.users.app_meta   | /admin/*
-- owner         | org_members.role      | /org/admin/* + billing
-- admin         | org_members.role      | /org/admin/* no billing
-- member        | org_members.role      | /dashboard, /feature, etc.


-- ── Promote a user to org admin ───────────────────────────────
-- UPDATE public.org_members
-- SET role = 'admin'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
--   AND org_id  = (SELECT id FROM public.organizations WHERE slug = 'your-org-slug');


-- ── Demote back to member ─────────────────────────────────────
-- UPDATE public.org_members
-- SET role = 'member'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
