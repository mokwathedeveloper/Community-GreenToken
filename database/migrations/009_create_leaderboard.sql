-- Migration 009: Create leaderboard_rankings table
-- Reference: saas/saas_database_schema.md

CREATE TABLE IF NOT EXISTS leaderboard_rankings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  rank          INTEGER NOT NULL,
  total_tokens  INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  period        TEXT DEFAULT 'all_time'
                  CHECK (period IN ('weekly','monthly','all_time')),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_org    ON leaderboard_rankings(org_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_rankings(org_id, period);
