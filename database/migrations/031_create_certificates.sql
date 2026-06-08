-- Migration 031: Carbon credit certificate records
-- Each verified eco-action earns one non-fungible certificate anchored to a Stellar tx.
-- The SVG is generated on-demand from this row — nothing is stored in blob storage.

CREATE TABLE IF NOT EXISTS public.certificates (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id       UUID         NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  org_id          UUID         NOT NULL,
  user_id         UUID         NOT NULL,
  cert_number     TEXT         NOT NULL UNIQUE,           -- GTC-YYYY-XXXXXXXX
  action_type     TEXT         NOT NULL,
  tokens_earned   INT          NOT NULL DEFAULT 0,
  co2_kg_offset   NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  proof_hash      TEXT,
  stellar_tx_hash TEXT,
  issued_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_action_id ON public.certificates(action_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id   ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_org_id    ON public.certificates(org_id);

-- Prevent double-issuance for the same action
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_action
  ON public.certificates(action_id);

-- RLS: members see only their own certificates; admins see their org's
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_own_certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admins_read_org_certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members m
      WHERE m.user_id = auth.uid()
        AND m.org_id  = certificates.org_id
        AND m.role IN ('admin', 'owner')
    )
  );
