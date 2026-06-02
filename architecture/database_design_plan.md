# Community GreenToken Database Design Plan

This document provides a professional **database design plan** for the Community GreenToken web application, including schema, tables, relationships, Supabase setup, and security rules.

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

This design ensures **secure, scalable, and hackathon-ready data management** for the Community GreenToken application, fully compatible with Supabase and serverless Next.js architecture.

---

## SaaS Extension — Multi-Tenant Schema

> **See also:** `saas/saas_database_schema.md` for the full SaaS schema with all SQL.

### New Tables Added for SaaS

| Table | Purpose |
|---|---|
| `organizations` | Tenant root — each org is one tenant |
| `org_members` | User ↔ Org relationship with role (owner/admin/member) |
| `invites` | Invite tokens for joining an org |
| `rewards` | Per-org redeemable reward catalog |
| `billing_events` | Stripe webhook audit log |
| `plan_limits` | Feature limits per subscription plan |

### org_id Added to All Existing Tables

Every existing table receives an `org_id UUID NOT NULL REFERENCES organizations(id)` column:

```
Users          → + org_id
Actions        → + org_id
TokenBalances  → + org_id
RedemptionLogs → + org_id
Leaderboard    → + org_id
AnalyticsMetrics → + org_id
Donations      → + org_id
```

### Updated RLS Policies

All RLS policies now scope data by `org_id` extracted from the JWT:

```sql
-- Pattern applied to every table
CREATE POLICY "org_isolation" ON <table> FOR ALL
USING (org_id = (auth.jwt() ->> 'org_id')::UUID);
```

Super admin bypass:
```sql
CREATE POLICY "superadmin_bypass" ON <table> FOR ALL
USING ((auth.jwt() ->> 'role') = 'superadmin');
```

### JWT Custom Claims (auth hook)

On every sign-in, Supabase injects `org_id` and `role` into the JWT so all RLS policies can use them without extra queries:

```sql
-- Returns JWT + org_id + role claims
SELECT custom_jwt_claims(event) FROM auth.users;
```


