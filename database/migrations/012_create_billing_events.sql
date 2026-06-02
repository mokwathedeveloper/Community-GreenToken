-- Migration 012: Create billing_events table (Stripe webhook audit log)
-- Reference: saas/saas_database_schema.md
-- Rule R-SAAS-06: MUST store all Stripe events for audit

CREATE TABLE IF NOT EXISTS billing_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB,
  processed       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_org  ON billing_events(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
