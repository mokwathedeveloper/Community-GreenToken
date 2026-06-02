-- Migration 011: Create donation_records table
-- Reference: saas/saas_database_schema.md

CREATE TABLE IF NOT EXISTS donation_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  project_name   TEXT NOT NULL,
  tokens_donated INTEGER NOT NULL,
  tx_hash        TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_org  ON donation_records(org_id);
CREATE INDEX IF NOT EXISTS idx_donations_user ON donation_records(user_id);
