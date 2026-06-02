-- Migration 013: Enable RLS and create tenant isolation policies
-- Reference: saas/multi_tenancy_architecture.md Section 4
-- Rule R-DB-03: RLS MUST be enabled on every tenant-scoped table
-- Rule R-SAAS-01: EVERY query MUST include org_id = jwt org_id

-- Enable RLS on all tenant-scoped tables
ALTER TABLE actions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards            ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites            ENABLE ROW LEVEL SECURITY;

-- ── Tenant Isolation Policies ───────────────────────────────────────

-- actions: members see only their org's data
CREATE POLICY "org_scope_actions" ON actions FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- token_balances
CREATE POLICY "org_scope_token_balances" ON token_balances FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- redemption_logs
CREATE POLICY "org_scope_redemption_logs" ON redemption_logs FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- rewards
CREATE POLICY "org_scope_rewards" ON rewards FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- leaderboard_rankings
CREATE POLICY "org_scope_leaderboard" ON leaderboard_rankings FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- analytics_metrics
CREATE POLICY "org_scope_analytics" ON analytics_metrics FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- donation_records
CREATE POLICY "org_scope_donations" ON donation_records FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- invites: only org admins/owners can see their org's invites
CREATE POLICY "org_scope_invites" ON invites FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::UUID);

-- ── Super Admin Bypass Policies ─────────────────────────────────────
-- Rule R-SAAS-04: Super admin MUST bypass RLS for platform operations

CREATE POLICY "superadmin_bypass_actions" ON actions FOR ALL
  USING ((auth.jwt() ->> 'role') = 'superadmin');

CREATE POLICY "superadmin_bypass_token_balances" ON token_balances FOR ALL
  USING ((auth.jwt() ->> 'role') = 'superadmin');

CREATE POLICY "superadmin_bypass_analytics" ON analytics_metrics FOR ALL
  USING ((auth.jwt() ->> 'role') = 'superadmin');
