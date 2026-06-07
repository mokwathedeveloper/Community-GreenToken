-- Migration 025: Add foreign keys to redemption_logs
-- redemption_logs.reward_id had no FK to public.rewards, causing PostgREST
-- to reject implicit join queries (rewards(title, image_url)).
-- Run in: Supabase Dashboard → SQL Editor → New Query

ALTER TABLE public.redemption_logs
  ADD CONSTRAINT IF NOT EXISTS fk_redemption_reward
  FOREIGN KEY (reward_id)
  REFERENCES public.rewards(id)
  ON DELETE SET NULL;

-- Verify
-- SELECT conname FROM pg_constraint
-- WHERE conrelid = 'public.redemption_logs'::regclass;
