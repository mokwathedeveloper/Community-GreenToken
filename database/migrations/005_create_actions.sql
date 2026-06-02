-- Migration 005: Create actions table (eco-action submissions)
-- Reference: saas/saas_database_schema.md
-- Rule R-DB-01: MUST include org_id NOT NULL

CREATE TABLE IF NOT EXISTS actions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  type           TEXT NOT NULL,
  description    TEXT,
  evidence_url   TEXT,
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','verified','rejected')),
  verified_by    UUID REFERENCES auth.users(id),
  tx_hash        TEXT,
  tokens_awarded INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actions_org      ON actions(org_id);
CREATE INDEX IF NOT EXISTS idx_actions_user     ON actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_org_date ON actions(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_status   ON actions(org_id, status);
