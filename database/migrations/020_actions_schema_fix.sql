-- ============================================================
-- Migration 020: Fix actions table — add missing columns
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Add action_type column (alias for type, used by API routes)
-- The original schema used 'type' but the API uses 'action_type'
-- Rather than rename (breaking), we add action_type as the working column
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS action_type TEXT;

-- Backfill action_type from type for existing rows
UPDATE public.actions SET action_type = type WHERE action_type IS NULL;

-- Add submitted_at (the type column: created_at is auto, submitted_at tracks when submitted)
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now();

-- Backfill submitted_at from created_at for existing rows
UPDATE public.actions SET submitted_at = created_at WHERE submitted_at IS NULL;

-- Add stellar_tx_hash (separate from tx_hash for clarity)
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS stellar_tx_hash TEXT;

-- Add blockchain_action_id (on-chain action ID from ActionRegistry contract)
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS blockchain_action_id INTEGER;

-- Add verified_at timestamp
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- ── Verify the final schema ───────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'actions'
-- ORDER BY ordinal_position;
