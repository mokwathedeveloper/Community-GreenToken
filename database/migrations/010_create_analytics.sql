-- Migration 010: Create analytics_metrics table
-- Reference: saas/saas_database_schema.md
-- Rule: Starter+ plan only. Free plan blocked at API layer.

CREATE TABLE IF NOT EXISTS analytics_metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  total_actions  INTEGER DEFAULT 0,
  tokens_minted  INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  co2_offset_kg  NUMERIC(10,2) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_org_date ON analytics_metrics(org_id, metric_date DESC);
