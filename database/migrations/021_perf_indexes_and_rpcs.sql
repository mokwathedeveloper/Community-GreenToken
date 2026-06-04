-- Migration 021: Performance indexes and aggregate RPCs
-- Owner: mokwathedeveloper
-- Fixes: N+1 auth lookup, leaderboard scan, token history, analytics unbounded fetches, atomic donation

-- ── Composite indexes ─────────────────────────────────────────────────────────

-- auth.ts getAuthContext: filters user_id, orders by joined_at → avoid sort-on-scan
CREATE INDEX IF NOT EXISTS idx_org_members_user_joined
  ON org_members(user_id, joined_at DESC);

-- leaderboard + token history: filters org+status, optionally ranges on created_at
CREATE INDEX IF NOT EXISTS idx_actions_org_status_date
  ON actions(org_id, status, created_at DESC);

-- token history earn query: filters org + user + status together
CREATE INDEX IF NOT EXISTS idx_actions_org_user_status
  ON actions(org_id, user_id, status);

-- donation history: filters org + user together
CREATE INDEX IF NOT EXISTS idx_donations_org_user
  ON donation_records(org_id, user_id);

-- redemption history: filters org + user together
CREATE INDEX IF NOT EXISTS idx_redemptions_org_user
  ON redemption_logs(org_id, user_id);


-- ── get_analytics_overview(p_org_id) ─────────────────────────────────────────
-- Replaces fetching all rows from 3 tables for JS aggregation.
-- Returns a single JSON row with all counts and sums computed in Postgres.

CREATE OR REPLACE FUNCTION get_analytics_overview(p_org_id UUID)
RETURNS JSON LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT json_build_object(
    'total_actions',    (SELECT COUNT(*)         FROM actions         WHERE org_id = p_org_id),
    'verified_actions', (SELECT COUNT(*)         FROM actions         WHERE org_id = p_org_id AND status = 'verified'),
    'pending_actions',  (SELECT COUNT(*)         FROM actions         WHERE org_id = p_org_id AND status = 'pending'),
    'tokens_minted',    COALESCE((SELECT SUM(total_earned) FROM token_balances  WHERE org_id = p_org_id), 0),
    'active_members',   COALESCE((SELECT COUNT(*) FROM token_balances WHERE org_id = p_org_id AND balance > 0), 0),
    'tokens_donated',   COALESCE((SELECT SUM(tokens_donated) FROM donation_records WHERE org_id = p_org_id), 0)
  );
$$;


-- ── get_member_analytics(p_org_id) ───────────────────────────────────────────
-- Replaces fetching all org_members rows for JS grouping/counting.
-- Returns role distribution, last-6-month growth, and active-this-month count.

CREATE OR REPLACE FUNCTION get_member_analytics(p_org_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_total       BIGINT;
  v_by_role     JSON;
  v_growth      JSON;
  v_active_cnt  BIGINT;
  v_month_start TIMESTAMPTZ := date_trunc('month', now());
BEGIN
  SELECT COUNT(*) INTO v_total FROM org_members WHERE org_id = p_org_id;

  SELECT json_object_agg(role, cnt) INTO v_by_role
  FROM (
    SELECT role, COUNT(*) AS cnt
    FROM org_members
    WHERE org_id = p_org_id
    GROUP BY role
  ) t;

  SELECT json_agg(json_build_object('month', month, 'count', cnt) ORDER BY month)
  INTO v_growth
  FROM (
    SELECT to_char(date_trunc('month', joined_at), 'YYYY-MM') AS month,
           COUNT(*) AS cnt
    FROM org_members
    WHERE org_id = p_org_id
      AND joined_at >= (now() - INTERVAL '6 months')
    GROUP BY 1
  ) t;

  SELECT COUNT(DISTINCT user_id) INTO v_active_cnt
  FROM actions
  WHERE org_id = p_org_id
    AND submitted_at >= v_month_start;

  RETURN json_build_object(
    'total_members',      v_total,
    'by_role',            COALESCE(v_by_role, '{}'::json),
    'monthly_growth',     COALESCE(v_growth, '[]'::json),
    'active_this_month',  v_active_cnt,
    'activity_rate_pct',  CASE WHEN v_total > 0
                               THEN ROUND((v_active_cnt::NUMERIC / v_total) * 100)
                               ELSE 0 END
  );
END;
$$;


-- ── process_donation(p_org_id, p_user_id, p_project, p_tokens) ───────────────
-- Atomic deduct-and-insert inside one transaction — eliminates the two-step
-- compensating-transaction pattern in the API route (the TODO in donations/route.ts).

CREATE OR REPLACE FUNCTION process_donation(
  p_org_id  UUID,
  p_user_id UUID,
  p_project TEXT,
  p_tokens  INTEGER
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_bal_id     UUID;
  v_balance    INTEGER;
  v_spent      INTEGER;
  v_donate_id  UUID;
  v_now        TIMESTAMPTZ := now();
BEGIN
  -- Lock balance row for this transaction
  SELECT id, balance, total_spent
  INTO   v_bal_id, v_balance, v_spent
  FROM   token_balances
  WHERE  org_id = p_org_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'NO_BALANCE');
  END IF;

  IF v_balance < p_tokens THEN
    RETURN json_build_object('error', 'INSUFFICIENT_BALANCE');
  END IF;

  UPDATE token_balances
  SET    balance     = v_balance  - p_tokens,
         total_spent = v_spent    + p_tokens
  WHERE  id = v_bal_id;

  INSERT INTO donation_records (org_id, user_id, project_name, tokens_donated, created_at)
  VALUES (p_org_id, p_user_id, p_project, p_tokens, v_now)
  RETURNING id INTO v_donate_id;

  RETURN json_build_object(
    'id',            v_donate_id,
    'project_name',  p_project,
    'tokens_donated', p_tokens,
    'created_at',    v_now
  );
END;
$$;
