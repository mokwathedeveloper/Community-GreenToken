-- Migration 003: Create invites table (org invite link tokens)
-- Reference: saas/saas_database_schema.md
-- Rule R-SAAS-08: Invite tokens MUST expire after 7 days

CREATE TABLE IF NOT EXISTS invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  token      TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  uses_left  INTEGER DEFAULT NULL,  -- NULL = unlimited
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_org   ON invites(org_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
