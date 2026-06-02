-- Migration 006: Create token_balances table
-- Reference: saas/saas_database_schema.md

CREATE TABLE IF NOT EXISTS token_balances (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  balance      INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent  INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_token_balances_org  ON token_balances(org_id);
CREATE INDEX IF NOT EXISTS idx_token_balances_user ON token_balances(org_id, user_id);
