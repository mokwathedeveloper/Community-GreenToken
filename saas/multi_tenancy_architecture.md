# Community GreenToken — Multi-Tenancy Architecture

## Tenancy Model: Organization-Based Row-Level Isolation

Each organization is a **tenant**. Every piece of data belongs to exactly one organization via an `org_id` foreign key. Supabase Row-Level Security (RLS) enforces this at the database layer so no API bug can ever leak cross-tenant data.

---

## 1. Core Tenant Entity

```sql
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,        -- used for subdomain: slug.greentoken.app
  token_name    TEXT NOT NULL DEFAULT 'GreenToken',
  token_symbol  TEXT NOT NULL DEFAULT 'GTK',
  logo_url      TEXT,
  primary_color TEXT DEFAULT '#2ECC71',
  plan          TEXT DEFAULT 'free',         -- free | starter | pro | enterprise
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active', -- active | past_due | canceled | trialing
  contract_address TEXT,                     -- deployed smart contract address
  contract_network TEXT DEFAULT 'testnet',
  member_limit  INTEGER DEFAULT 50,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. User-Organization Membership

Users can belong to multiple organizations with different roles:

```sql
CREATE TABLE org_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member',  -- owner | admin | member
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);
```

**Role permissions:**

| Role | Manage members | Configure tokens | Billing | View analytics | Super admin |
|---|---|---|---|---|---|
| `member` | ❌ | ❌ | ❌ | ✅ (own) | ❌ |
| `admin` | ✅ | ✅ | ❌ | ✅ (org) | ❌ |
| `owner` | ✅ | ✅ | ✅ | ✅ (org) | ❌ |
| `superadmin` | ✅ | ✅ | ✅ | ✅ (all) | ✅ |

---

## 3. All Tables Extended with org_id

Every existing MVP table gains an `org_id` column:

```sql
-- Users table extended
ALTER TABLE users ADD COLUMN org_id UUID REFERENCES organizations(id);

-- Actions scoped to org
ALTER TABLE actions ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);

-- Token balances scoped to org
ALTER TABLE token_balances ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);

-- Redemption logs scoped to org
ALTER TABLE redemption_logs ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);

-- Leaderboard rankings scoped to org
ALTER TABLE leaderboard_rankings ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);

-- Analytics metrics scoped to org
ALTER TABLE analytics_metrics ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);

-- Donation records scoped to org
ALTER TABLE donation_records ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
```

**Add indexes for performance:**
```sql
CREATE INDEX idx_actions_org ON actions(org_id);
CREATE INDEX idx_token_balances_org ON token_balances(org_id);
CREATE INDEX idx_leaderboard_org ON leaderboard_rankings(org_id);
CREATE INDEX idx_analytics_org ON analytics_metrics(org_id);
CREATE INDEX idx_donations_org ON donation_records(org_id);
```

---

## 4. Row-Level Security (RLS) Policies

RLS is the **last line of defense**. Even if the application has a bug, the database will not return another tenant's data.

### Enable RLS on all tables
```sql
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_records ENABLE ROW LEVEL SECURITY;
```

### Policy pattern — member can only see their org's data
```sql
-- Example: actions table
CREATE POLICY "members_see_own_org_actions"
  ON actions FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::UUID
  );

CREATE POLICY "members_insert_own_org_actions"
  ON actions FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() ->> 'org_id')::UUID
  );
```

### Super admin bypass policy
```sql
CREATE POLICY "superadmin_all_access"
  ON actions FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'superadmin'
  );
```

---

## 5. JWT Custom Claims — org_id Injection

When a user logs in, the JWT must include their `org_id` and `role`. Use a Supabase **Auth hook** (PostgreSQL function triggered on sign-in):

```sql
CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  member_record RECORD;
BEGIN
  SELECT om.org_id, om.role
  INTO member_record
  FROM org_members om
  WHERE om.user_id = (event ->> 'user_id')::UUID
  LIMIT 1;  -- use primary org if multi-org member

  RETURN jsonb_set(
    event,
    '{claims}',
    event->'claims' || jsonb_build_object(
      'org_id', member_record.org_id,
      'role',   member_record.role
    )
  );
END;
$$;
```

---

## 6. Tenant Resolution — Subdomain Routing

Each org gets a unique subdomain: `{slug}.greentoken.app`

### Next.js Middleware (`middleware.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const slug = host.split('.')[0];

  // Pass org slug to all pages via header
  const response = NextResponse.next();
  response.headers.set('x-org-slug', slug);
  return response;
}

export const config = { matcher: ['/((?!api|_next|favicon).*)'] };
```

### Org Context Provider (`OrgContext.tsx`)
```typescript
import { createContext, useContext } from 'react';

export const OrgContext = createContext<{
  orgId: string;
  orgSlug: string;
  tokenName: string;
  tokenSymbol: string;
  primaryColor: string;
  plan: string;
} | null>(null);

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used inside OrgProvider');
  return ctx;
};
```

---

## 7. Tenant Isolation Checklist

- [ ] All database queries include `WHERE org_id = :orgId`
- [ ] RLS policies enabled on every tenant-scoped table
- [ ] JWT includes `org_id` for every authenticated request
- [ ] API routes validate `org_id` matches JWT claim before every operation
- [ ] Smart contract calls scoped to org's contract address
- [ ] File uploads (logos, etc.) stored in org-specific storage buckets
- [ ] Leaderboard, analytics, and donation APIs never return cross-org data
- [ ] Super admin routes protected by `role = 'superadmin'` check
- [ ] Rate limiting per org (not just per IP) to prevent DoS by one tenant

---

## 8. Data Flow Summary

```
User visits slug.greentoken.app
         │
         ▼
Next.js middleware resolves org slug → fetches org config
         │
         ▼
User authenticates → Supabase injects org_id + role into JWT
         │
         ▼
Every API call includes Authorization header with JWT
         │
         ▼
API route extracts org_id from JWT → scopes all DB queries
         │
         ▼
Supabase RLS independently enforces org_id isolation
         │
         ▼
Smart contract calls use org's contract_address from organizations table
```
