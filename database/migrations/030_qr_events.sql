-- ============================================================
-- Migration 030: QR Code Action Verification (Phase 3)
-- Admins create time-bounded QR events; members scan at the
-- location and auto-earn GTK tokens — verified on Stellar.
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. qr_events table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qr_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by   UUID        NOT NULL REFERENCES auth.users(id),
  action_type  TEXT        NOT NULL,
  label        TEXT        NOT NULL,           -- e.g. "Saturday Park Cleanup"
  description  TEXT,
  lat          DOUBLE PRECISION,               -- event GPS centre (optional)
  lng          DOUBLE PRECISION,               -- event GPS centre (optional)
  radius_m     INTEGER     NOT NULL DEFAULT 200,   -- acceptance radius in metres
  tokens_award INTEGER     NOT NULL DEFAULT 10,
  valid_from   TIMESTAMPTZ NOT NULL,
  valid_until  TIMESTAMPTZ NOT NULL,
  token        TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  scan_count   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Constraints (DO block — ADD CONSTRAINT IF NOT EXISTS is unsupported) ─
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_qr_valid_window' AND conrelid = 'public.qr_events'::regclass) THEN
    ALTER TABLE public.qr_events ADD CONSTRAINT chk_qr_valid_window CHECK (valid_until > valid_from);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_qr_lat' AND conrelid = 'public.qr_events'::regclass) THEN
    ALTER TABLE public.qr_events ADD CONSTRAINT chk_qr_lat CHECK (lat IS NULL OR lat BETWEEN -90 AND 90);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_qr_lng' AND conrelid = 'public.qr_events'::regclass) THEN
    ALTER TABLE public.qr_events ADD CONSTRAINT chk_qr_lng CHECK (lng IS NULL OR lng BETWEEN -180 AND 180);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_qr_radius' AND conrelid = 'public.qr_events'::regclass) THEN
    ALTER TABLE public.qr_events ADD CONSTRAINT chk_qr_radius CHECK (radius_m BETWEEN 50 AND 50000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_qr_tokens' AND conrelid = 'public.qr_events'::regclass) THEN
    ALTER TABLE public.qr_events ADD CONSTRAINT chk_qr_tokens CHECK (tokens_award BETWEEN 1 AND 10000);
  END IF;
END $$;

-- ── 3. Indexes ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_qr_events_org
  ON public.qr_events(org_id);

CREATE INDEX IF NOT EXISTS idx_qr_events_token
  ON public.qr_events(token);

CREATE INDEX IF NOT EXISTS idx_qr_events_active
  ON public.qr_events(org_id, is_active, valid_until DESC)
  WHERE is_active = true;

-- ── 4. Link actions → QR events ────────────────────────────────────────────
ALTER TABLE public.actions
  ADD COLUMN IF NOT EXISTS qr_event_id UUID REFERENCES public.qr_events(id) ON DELETE SET NULL;

-- Fast reverse-lookup: which actions came from a QR event
CREATE INDEX IF NOT EXISTS idx_actions_qr_event
  ON public.actions(qr_event_id)
  WHERE qr_event_id IS NOT NULL;

-- One scan per user per QR event (rejected scans exempt — allows re-scan after admin rejection)
CREATE UNIQUE INDEX IF NOT EXISTS uq_actions_user_qr_event
  ON public.actions(user_id, qr_event_id)
  WHERE qr_event_id IS NOT NULL AND status != 'rejected';

-- ── 5. Atomic scan_count increment RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_qr_scan_count(p_qr_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.qr_events
  SET scan_count = scan_count + 1
  WHERE id = p_qr_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_qr_scan_count(UUID) TO service_role;

-- ── 6. Row-level security ───────────────────────────────────────────────────
ALTER TABLE public.qr_events ENABLE ROW LEVEL SECURITY;

-- Org members can read their org's QR events
DROP POLICY IF EXISTS "qr_events_select_org" ON public.qr_events;
CREATE POLICY "qr_events_select_org" ON public.qr_events
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid())
  );

-- Org admins and owners can create/update QR events
DROP POLICY IF EXISTS "qr_events_admin_write" ON public.qr_events;
CREATE POLICY "qr_events_admin_write" ON public.qr_events
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- ── 7. Verify ───────────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'qr_events'
-- ORDER BY ordinal_position;
