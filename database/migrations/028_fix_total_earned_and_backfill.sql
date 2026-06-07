-- Migration 028: Fix increment_token_balance RPC + backfill total_earned
--
-- Root cause: increment_token_balance only updated `balance`, never `total_earned`.
-- All rows have total_earned = 0 even for members with verified actions.
-- This broke the leaderboard sort and analytics.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- ── 1. Fix the RPC to also increment total_earned ────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_token_balance(
  p_user_id  UUID,
  p_org_id   UUID,
  p_amount   BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.token_balances (user_id, org_id, balance, total_earned, updated_at)
  VALUES (p_user_id, p_org_id, p_amount, p_amount, now())
  ON CONFLICT (user_id, org_id)
  DO UPDATE SET
    balance      = token_balances.balance      + EXCLUDED.balance,
    total_earned = token_balances.total_earned  + EXCLUDED.total_earned,
    updated_at   = now();
END;
$$;

-- ── 2. Backfill total_earned from verified actions ────────────────────────────
-- For any row where total_earned = 0 but verified actions exist,
-- recalculate from the source of truth (actions table).
UPDATE public.token_balances tb
SET
  total_earned = sub.earned,
  updated_at   = now()
FROM (
  SELECT
    user_id,
    org_id,
    COALESCE(SUM(tokens_awarded), 0) AS earned
  FROM   public.actions
  WHERE  status = 'verified'
  GROUP  BY user_id, org_id
) sub
WHERE  tb.user_id = sub.user_id
  AND  tb.org_id  = sub.org_id
  AND  sub.earned > 0;

-- Verify (uncomment to check after running):
-- SELECT user_id, balance, total_earned FROM token_balances ORDER BY total_earned DESC LIMIT 10;
