-- Migration 001: Create organizations table (tenant root)
-- Reference: saas/saas_database_schema.md
-- Rule: MUST be run FIRST — all other tables depend on it

CREATE TABLE IF NOT EXISTS organizations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,
  token_name             TEXT NOT NULL DEFAULT 'GreenToken',
  token_symbol           TEXT NOT NULL DEFAULT 'GTK',
  logo_url               TEXT,
  primary_color          TEXT DEFAULT '#22c55e',
  plan                   TEXT NOT NULL DEFAULT 'free'
                           CHECK (plan IN ('free','starter','pro','enterprise')),
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status    TEXT DEFAULT 'trialing'
                           CHECK (subscription_status IN
                             ('trialing','active','past_due','canceled','unpaid')),
  trial_ends_at          TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  contract_address       TEXT,
  contract_network       TEXT DEFAULT 'testnet',
  member_limit           INTEGER DEFAULT 50,
  is_active              BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(plan);
