-- Migration 008: Create rewards table (per-org redeemable catalog)
-- Reference: saas/saas_database_schema.md

CREATE TABLE IF NOT EXISTS rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  token_cost  INTEGER NOT NULL,
  image_url   TEXT,
  stock       INTEGER DEFAULT NULL,  -- NULL = unlimited
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rewards_org ON rewards(org_id);
