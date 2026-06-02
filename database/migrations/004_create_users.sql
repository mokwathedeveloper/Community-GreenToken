-- Migration 004: Create users table (profile + org reference)
-- Reference: saas/saas_database_schema.md

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email          TEXT,
  display_name   TEXT,
  wallet_address TEXT,
  avatar_url     TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
