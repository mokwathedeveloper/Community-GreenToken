# Community GreenToken Database Design Plan (Implementation Folder)

This document serves as a **reference/duplicate** of the existing `database_design_plan.md`, adapted for the Implementation folder to ensure consistency with backend and frontend state management.

---

## 1. Supabase Setup
- **Project URL:** [Insert Supabase Project URL]
- **Anonymous Key:** [Insert Supabase Anonymous Key]
- **Authentication:** Supabase Auth or wallet integration.
- **RLS (Row Level Security):** Enforced for sensitive tables (Users, Token Balances, Donations).

## 2. Database Schema
### Tables
1. **Users**
   - user_id (PK)
   - username
   - email
   - wallet_address
   - created_at
   - updated_at

2. **Actions**
   - action_id (PK)
   - user_id (FK → Users.user_id)
   - action_type
   - description
   - verified (boolean)
   - timestamp

3. **TokenBalances**
   - balance_id (PK)
   - user_id (FK → Users.user_id)
   - total_tokens
   - created_at
   - updated_at

4. **RedemptionLogs**
   - redemption_id (PK)
   - user_id (FK → Users.user_id)
   - reward_id
   - tokens_redeemed
   - timestamp

5. **Leaderboard**
   - leaderboard_id (PK)
   - user_id (FK → Users.user_id)
   - tokens_earned
   - rank
   - updated_at

6. **AnalyticsMetrics**
   - metric_id (PK)
   - total_actions
   - total_tokens_minted
   - total_donations
   - calculated_at

7. **Donations**
   - donation_id (PK)
   - user_id (FK → Users.user_id)
   - project_name
   - tokens_contributed
   - timestamp

## 3. Relationships and Indexes
- **Users → Actions:** One-to-Many (user_id)
- **Users → TokenBalances:** One-to-One
- **Users → RedemptionLogs:** One-to-Many
- **Users → Leaderboard:** One-to-One
- **Users → Donations:** One-to-Many
- **Indexes:**
   - user_id indexes on Actions, TokenBalances, RedemptionLogs, Donations, Leaderboard
   - timestamp indexes for Actions, Redemptions, Donations

## 4. Access Rules and RLS
- **Users Table:** Only authenticated users can read their own data.
- **Actions Table:** Users can create actions; only admin can verify.
- **TokenBalances:** Readable only by respective user; update via backend/API route.
- **RedemptionLogs:** Readable by users for their own logs.
- **Leaderboard:** Readable by all users; updated via backend.
- **Donations:** Users can read their own contributions; admin can read all.
- **AnalyticsMetrics:** Readable by admin only.

This implementation-specific database design plan ensures **alignment with backend logic and frontend state management**, maintaining consistency and security for the Community GreenToken MVP.

---

## SaaS Extension — Multi-Tenant Schema Updates

> **Full SQL:** See `saas/saas_database_schema.md`

### New Tables Required

```
organizations      ← tenant root (add FIRST before all others)
org_members        ← user ↔ org relationship + role
invites            ← invite link tokens
rewards            ← per-org redeemable reward catalog
billing_events     ← Stripe webhook audit log
plan_limits        ← feature limits per plan tier
```

### org_id Column — Add to All Existing Tables

```sql
ALTER TABLE users             ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE actions           ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE token_balances    ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE redemption_logs   ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE leaderboard       ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE analytics_metrics ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE donations         ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);
```

### Updated RLS Policy Pattern

```sql
-- Applied to EVERY table — scope all reads/writes to org
CREATE POLICY "org_scope" ON <table> FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- Super admin bypass
CREATE POLICY "superadmin_bypass" ON <table> FOR ALL
  USING ((auth.jwt() ->> 'role') = 'superadmin');
```

### JWT Custom Claims Hook

```sql
-- Supabase auth hook: injects org_id + role into every JWT
CREATE OR REPLACE FUNCTION public.custom_jwt_claims(event JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
  SELECT om.org_id, om.role INTO rec FROM org_members om
  WHERE om.user_id = (event ->> 'user_id')::UUID LIMIT 1;
  RETURN jsonb_set(event, '{claims}',
    event->'claims' || jsonb_build_object('org_id', rec.org_id, 'role', rec.role));
END; $$;
```

### Migration Execution Order

Run migrations in strict order to respect foreign key constraints:
1. `organizations` (no dependencies)
2. `org_members` (depends on organizations)
3. `invites` (depends on organizations)
4. Add `org_id` to all existing tables (depends on organizations)
5. `rewards`, `billing_events`, `plan_limits`
6. Enable RLS + create policies
7. Seed `plan_limits` table with plan data