-- ============================================================
-- Migration 029: EXIF metadata + cross-org fraud detection
-- Adds GPS coordinates, capture timestamp, device, and proof
-- hash to action submissions for anti-fraud verification.
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. EXIF columns ──────────────────────────────────────────

ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS exif_lat          DOUBLE PRECISION,   -- GPS latitude  (-90 to 90)
  ADD COLUMN IF NOT EXISTS exif_lng          DOUBLE PRECISION,   -- GPS longitude (-180 to 180)
  ADD COLUMN IF NOT EXISTS exif_captured_at  TIMESTAMPTZ,        -- DateTimeOriginal from camera
  ADD COLUMN IF NOT EXISTS exif_device       TEXT,               -- "Make Model" e.g. "Apple iPhone 15 Pro"
  ADD COLUMN IF NOT EXISTS exif_present      BOOLEAN DEFAULT false, -- true = at least one EXIF field found
  ADD COLUMN IF NOT EXISTS is_cross_org_dup  BOOLEAN DEFAULT false, -- evidence_hash seen in another org
  ADD COLUMN IF NOT EXISTS proof_hash        TEXT;               -- SHA-256(evidenceHash|lat|lng|capturedAt)

-- Constraints: GPS range checks
ALTER TABLE public.actions
  ADD CONSTRAINT IF NOT EXISTS chk_exif_lat
    CHECK (exif_lat IS NULL OR exif_lat BETWEEN -90 AND 90),
  ADD CONSTRAINT IF NOT EXISTS chk_exif_lng
    CHECK (exif_lng IS NULL OR exif_lng BETWEEN -180 AND 180);

-- ── 2. Indexes for fraud and geospatial queries ───────────────

-- Fast cross-org duplicate lookup by evidence hash
CREATE INDEX IF NOT EXISTS idx_actions_evidence_global
  ON public.actions(evidence_hash)
  WHERE evidence_hash IS NOT NULL;

-- Admin fraud dashboard: quickly find flagged submissions
CREATE INDEX IF NOT EXISTS idx_actions_cross_org_dup
  ON public.actions(org_id, is_cross_org_dup)
  WHERE is_cross_org_dup = true;

-- Fast lookup of submissions without EXIF (suspicious batch)
CREATE INDEX IF NOT EXISTS idx_actions_no_exif
  ON public.actions(org_id, submitted_at DESC)
  WHERE exif_present = false AND status = 'pending';

-- Unique proof_hash per org (no two submissions can produce the same proof)
CREATE UNIQUE INDEX IF NOT EXISTS uq_actions_proof_hash_org
  ON public.actions(org_id, proof_hash)
  WHERE proof_hash IS NOT NULL AND status != 'rejected';

-- ── 3. RPC: detect cross-org evidence reuse ─────────────────
-- Called from API after insert to flag cross-org duplicates.

CREATE OR REPLACE FUNCTION public.flag_cross_org_duplicate(
  p_action_id    UUID,
  p_org_id       UUID,
  p_evidence_hash TEXT
)
RETURNS BOOLEAN   -- returns true if a cross-org duplicate was found and flagged
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_found BOOLEAN := false;
BEGIN
  -- Check if evidence_hash exists in a DIFFERENT org (non-rejected)
  SELECT EXISTS (
    SELECT 1 FROM public.actions
    WHERE evidence_hash = p_evidence_hash
      AND org_id       != p_org_id
      AND status       != 'rejected'
    LIMIT 1
  ) INTO v_found;

  IF v_found THEN
    UPDATE public.actions
    SET is_cross_org_dup = true
    WHERE id = p_action_id;
  END IF;

  RETURN v_found;
END;
$$;

GRANT EXECUTE ON FUNCTION public.flag_cross_org_duplicate(UUID, UUID, TEXT)
  TO service_role;

-- ── 4. Verify columns exist ──────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'actions'
--   AND column_name LIKE 'exif%' OR column_name IN ('is_cross_org_dup', 'proof_hash')
-- ORDER BY ordinal_position;
