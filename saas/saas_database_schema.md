# Community GreenToken — SaaS Database Schema

Full Supabase schema extended for multi-tenancy. All existing tables gain `org_id`. Three new tables are added: `organizations`, `org_members`, `invites`.

---

## Complete Schema

```sql
-- ============================================================
-- ORGANIZATIONS (Tenant Root)
-- ============================================================
CREATE TABLE organizations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,
  token_name             TEXT NOT NULL DEFAULT 'GreenToken',
  token_symbol           TEXT NOT NULL DEFAULT 'GTK',
  logo_url               TEXT,
  primary_color          TEXT DEFAULT '#2ECC71',
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

-- ============================================================
-- ORG MEMBERS (User ↔ Org relationship + role)
-- ============================================================
CREATE TABLE org_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member'
              CHECK (role IN ('owner','admin','member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- ============================================================
-- INVITES (Org invite links)
-- ============================================================
CREATE TABLE invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  token      TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  uses_left  INTEGER DEFAULT NULL,           -- NULL = unlimited
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USERS (Extended with org_id for primary org)
-- ============================================================
CREATE TABLE users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id       UUID NOT NULL REFERENCES organizations(id),
  email        TEXT,
  display_name TEXT,
  wallet_address TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ACTIONS (Org-scoped sustainable action submissions)
-- ============================================================
CREATE TABLE actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL,                 -- recycling, tree_planting, carpooling, etc.
  description TEXT,
  evidence_url TEXT,
  status      TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','verified','rejected')),
  verified_by UUID REFERENCES users(id),
  tx_hash     TEXT,                          -- blockchain transaction hash
  tokens_awarded INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TOKEN BALANCES (Per user per org)
-- ============================================================
CREATE TABLE token_balances (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id),
  user_id    UUID NOT NULL REFERENCES users(id),
  balance    INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent  INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- ============================================================
-- REDEMPTION LOGS (Token spend history)
-- ============================================================
CREATE TABLE redemption_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  reward_id   UUID,
  tokens_spent INTEGER NOT NULL,
  tx_hash     TEXT,
  status      TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','failed')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REWARDS CATALOG (Per-org redeemable rewards)
-- ============================================================
CREATE TABLE rewards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id),
  title        TEXT NOT NULL,
  description  TEXT,
  token_cost   INTEGER NOT NULL,
  image_url    TEXT,
  stock        INTEGER DEFAULT NULL,         -- NULL = unlimited
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LEADERBOARD RANKINGS (Per org, computed/cached)
-- ============================================================
CREATE TABLE leaderboard_rankings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  rank         INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  period       TEXT DEFAULT 'all_time'
                 CHECK (period IN ('weekly','monthly','all_time')),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id, period)
);

-- ============================================================
-- ANALYTICS METRICS (Aggregated per org)
-- ============================================================
CREATE TABLE analytics_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  metric_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  total_actions   INTEGER DEFAULT 0,
  tokens_minted   INTEGER DEFAULT 0,
  active_members  INTEGER DEFAULT 0,
  co2_offset_kg   NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, metric_date)
);

-- ============================================================
-- DONATION RECORDS (Per org community projects)
-- ============================================================
CREATE TABLE donation_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  project_name  TEXT NOT NULL,
  tokens_donated INTEGER NOT NULL,
  tx_hash       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BILLING EVENTS (Stripe webhook log)
-- ============================================================
CREATE TABLE billing_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type  TEXT NOT NULL,              -- invoice.paid, customer.subscription.deleted, etc.
  payload     JSONB,
  processed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_org_members_org     ON org_members(org_id);
CREATE INDEX idx_org_members_user    ON org_members(user_id);
CREATE INDEX idx_actions_org         ON actions(org_id);
CREATE INDEX idx_actions_user        ON actions(user_id);
CREATE INDEX idx_token_balances_org  ON token_balances(org_id);
CREATE INDEX idx_redemption_org      ON redemption_logs(org_id);
CREATE INDEX idx_rewards_org         ON rewards(org_id);
CREATE INDEX idx_leaderboard_org     ON leaderboard_rankings(org_id);
CREATE INDEX idx_analytics_org_date  ON analytics_metrics(org_id, metric_date);
CREATE INDEX idx_donations_org       ON donation_records(org_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE actions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances    ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites           ENABLE ROW LEVEL SECURITY;

-- Member sees only own org
CREATE POLICY "org_isolation"
  ON actions FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- (Repeat same pattern for all other org-scoped tables)

-- Super admin bypass
CREATE POLICY "superadmin_bypass"
  ON actions FOR ALL
  USING ((auth.jwt() ->> 'role') = 'superadmin');
```

---

## Plan Limits Table

```sql
CREATE TABLE plan_limits (
  plan          TEXT PRIMARY KEY,
  member_limit  INTEGER,          -- NULL = unlimited
  analytics     BOOLEAN,
  custom_token  BOOLEAN,
  white_label   BOOLEAN,
  api_access    BOOLEAN,
  price_monthly INTEGER           -- cents: 0 = free
);

INSERT INTO plan_limits VALUES
  ('free',       50,    FALSE, FALSE, FALSE, FALSE, 0),
  ('starter',    500,   TRUE,  TRUE,  FALSE, FALSE, 4900),
  ('pro',        5000,  TRUE,  TRUE,  TRUE,  TRUE,  19900),
  ('enterprise', NULL,  TRUE,  TRUE,  TRUE,  TRUE,  NULL);
```

---

## Migration Order

1. `001_create_organizations.sql`
2. `002_create_org_members.sql`
3. `003_create_invites.sql`
4. `004_add_org_id_to_users.sql`
5. `005_add_org_id_to_actions.sql`
6. `006_add_org_id_to_token_balances.sql`
7. `007_add_org_id_to_redemption_logs.sql`
8. `008_create_rewards.sql`
9. `009_add_org_id_to_leaderboard.sql`
10. `010_add_org_id_to_analytics.sql`
11. `011_add_org_id_to_donations.sql`
12. `012_create_billing_events.sql`
13. `013_enable_rls_policies.sql`
14. `014_create_plan_limits.sql`
