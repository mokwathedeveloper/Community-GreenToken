-- ============================================================
-- Migration 018: Register JWT Custom Claims Auth Hook
-- ============================================================
-- The custom_jwt_claims function already exists (created in 014).
-- It adds org_id and role to every JWT when a user logs in.
--
-- HOW TO REGISTER (Supabase Dashboard — cannot be done via SQL):
-- ─────────────────────────────────────────────────────────────
-- 1. Go to: https://supabase.com/dashboard/project/thjqzzsoptsdocnyoxcu
-- 2. Click "Authentication" in the left sidebar
-- 3. Click "Hooks" tab
-- 4. Click "Add hook"
-- 5. Choose hook type: "Customize Access Token (JWT) claims"
-- 6. Choose function: "public.custom_jwt_claims"
-- 7. Click "Save"
--
-- WHAT THE HOOK DOES:
-- When a user signs in, Supabase calls custom_jwt_claims(event).
-- The function looks up their org_id and role from org_members,
-- then injects them as custom JWT claims.
--
-- RESULT — the JWT will contain:
--   {
--     "sub": "user-uuid",
--     "email": "user@example.com",
--     "org_id": "org-uuid",       ← added by hook
--     "role": "admin",             ← added by hook
--     "aud": "authenticated"
--   }
--
-- This lets API routes read org_id + role from the token
-- without hitting the database on every request.
--
-- ─────────────────────────────────────────────────────────────
-- VERIFY the hook works (run AFTER registering in dashboard):
-- ─────────────────────────────────────────────────────────────
-- SELECT auth.jwt() -> 'org_id';   -- should return your org UUID
-- SELECT auth.jwt() -> 'role';     -- should return 'owner'/'admin'/'member'
-- ─────────────────────────────────────────────────────────────

-- Also configure Supabase Auth redirect URLs (Phase 2.16):
-- Go to: Authentication → URL Configuration
-- Add to "Redirect URLs":
--   http://localhost:3000/**
--   https://your-vercel-domain.vercel.app/**
--   https://*.greentoken.app/**
-- ─────────────────────────────────────────────────────────────

-- Ensure function is SECURITY DEFINER so it can query org_members
ALTER FUNCTION public.custom_jwt_claims(event JSONB) SECURITY DEFINER;

-- ── FIXED FUNCTION (replaces original in 014) ────────────────
-- Root cause of 500 on signin: original used 'user_id' key but
-- Supabase hook passes 'sub' (standard JWT subject claim).
-- Also added EXCEPTION safety net so hook NEVER breaks auth.

CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  uid           UUID;
BEGIN
  BEGIN
    uid := COALESCE(
      NULLIF(event->>'sub',     '')::UUID,
      NULLIF(event->>'user_id', '')::UUID
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN event;
  END;

  IF uid IS NULL THEN RETURN event; END IF;

  SELECT om.org_id, om.role
  INTO  member_record
  FROM  public.org_members om
  WHERE om.user_id = uid
  ORDER BY om.joined_at DESC
  LIMIT 1;

  IF FOUND AND member_record.org_id IS NOT NULL THEN
    RETURN jsonb_set(
      event, '{claims}',
      COALESCE(event->'claims', '{}'::jsonb) ||
      jsonb_build_object('org_id', member_record.org_id, 'role', member_record.role)
    );
  END IF;

  RETURN event;
EXCEPTION WHEN OTHERS THEN
  RETURN event;  -- Never let hook crash login
END;
$$;
