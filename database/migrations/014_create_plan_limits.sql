-- Migration 014: Create plan_limits table and seed initial data
-- Reference: saas/saas_database_schema.md
-- This table drives plan enforcement at the API layer

CREATE TABLE IF NOT EXISTS plan_limits (
  plan          TEXT PRIMARY KEY,
  member_limit  INTEGER,        -- NULL = unlimited
  analytics     BOOLEAN DEFAULT FALSE,
  custom_token  BOOLEAN DEFAULT FALSE,
  white_label   BOOLEAN DEFAULT FALSE,
  api_access    BOOLEAN DEFAULT FALSE,
  price_monthly INTEGER        -- cents (0 = free, NULL = custom)
);

-- Seed plan data
INSERT INTO plan_limits VALUES
  ('free',       50,    FALSE, FALSE, FALSE, FALSE, 0),
  ('starter',    500,   TRUE,  TRUE,  FALSE, FALSE, 4900),
  ('pro',        5000,  TRUE,  TRUE,  TRUE,  TRUE,  19900),
  ('enterprise', NULL,  TRUE,  TRUE,  TRUE,  TRUE,  NULL)
ON CONFLICT (plan) DO NOTHING;

-- ── JWT Custom Claims Hook ────────────────────────────────────────
-- Reference: saas/multi_tenancy_architecture.md Section 5
-- Run this in Supabase Dashboard → Database → Functions

CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  member_record RECORD;
BEGIN
  SELECT om.org_id, om.role
  INTO member_record
  FROM org_members om
  WHERE om.user_id = (event ->> 'user_id')::UUID
  LIMIT 1;

  IF member_record IS NOT NULL THEN
    RETURN jsonb_set(
      event,
      '{claims}',
      COALESCE(event->'claims', '{}'::jsonb) || jsonb_build_object(
        'org_id', member_record.org_id,
        'role',   member_record.role
      )
    );
  END IF;

  RETURN event;
END;
$$;
