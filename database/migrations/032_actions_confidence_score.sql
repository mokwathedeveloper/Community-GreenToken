-- Migration 032: Add AI confidence scoring to actions
-- confidence_score: 0-100 computed server-side from EXIF + file + description heuristics
-- auto_verified:    TRUE when confidence_score >= 85 caused instant token mint (no admin needed)

ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS confidence_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Fast lookup for admin queue: surface high-confidence pending items first
CREATE INDEX IF NOT EXISTS idx_actions_confidence
  ON actions (org_id, confidence_score DESC)
  WHERE status = 'pending';
