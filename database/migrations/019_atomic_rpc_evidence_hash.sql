-- ============================================================
-- Migration 019: Atomic token increment RPC + evidence_hash column
-- Fixes: Race condition in /api/actions/verify
--        Evidence hash stored as text prefix (workaround)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Add dedicated evidence_hash column to actions table ───
-- Previously hashed was embedded in description as "[hash:xxx]"
-- Now properly stored in its own indexed column.
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS evidence_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_actions_evidence_hash
  ON public.actions(evidence_hash)
  WHERE evidence_hash IS NOT NULL;

-- Unique constraint per org prevents duplicate evidence
CREATE UNIQUE INDEX IF NOT EXISTS uq_actions_evidence_org
  ON public.actions(org_id, evidence_hash)
  WHERE evidence_hash IS NOT NULL AND status != 'rejected';


-- ── 2. Atomic token balance increment RPC ────────────────────
-- Fixes race condition: replaces SELECT + UPDATE with a single
-- atomic UPDATE that cannot be interleaved with concurrent calls.
-- Called from /api/actions/verify route.

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
  -- Upsert: insert if not exists, otherwise add to existing balance
  INSERT INTO public.token_balances (user_id, org_id, balance, updated_at)
  VALUES (p_user_id, p_org_id, p_amount, now())
  ON CONFLICT (user_id, org_id)
  DO UPDATE SET
    balance    = token_balances.balance + EXCLUDED.balance,
    updated_at = now();
END;
$$;

-- Grant execute to authenticated role (called from API layer)
GRANT EXECUTE ON FUNCTION public.increment_token_balance(UUID, UUID, BIGINT)
  TO authenticated;


-- ── 3. Atomic token balance decrement RPC (for redemptions) ──
CREATE OR REPLACE FUNCTION public.decrement_token_balance(
  p_user_id  UUID,
  p_org_id   UUID,
  p_amount   BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current BIGINT;
BEGIN
  SELECT balance INTO v_current
  FROM public.token_balances
  WHERE user_id = p_user_id AND org_id = p_org_id
  FOR UPDATE;  -- row-level lock prevents concurrent decrements

  IF v_current IS NULL THEN
    RAISE EXCEPTION 'no token balance found for user';
  END IF;

  IF v_current < p_amount THEN
    RAISE EXCEPTION 'insufficient balance: have %, need %', v_current, p_amount;
  END IF;

  UPDATE public.token_balances
  SET balance    = balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id AND org_id = p_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_token_balance(UUID, UUID, BIGINT)
  TO authenticated;


-- ── 4. Verify the functions exist ────────────────────────────
-- SELECT proname FROM pg_proc
-- WHERE proname IN ('increment_token_balance', 'decrement_token_balance')
-- AND pronamespace = 'public'::regnamespace;
