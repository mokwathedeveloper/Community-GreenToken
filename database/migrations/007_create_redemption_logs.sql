-- Migration 007: Create redemption_logs table
-- Reference: saas/saas_database_schema.md

CREATE TABLE IF NOT EXISTS redemption_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  reward_id    UUID,
  tokens_spent INTEGER NOT NULL,
  tx_hash      TEXT,
  status       TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','failed')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemption_org  ON redemption_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_redemption_user ON redemption_logs(user_id);
