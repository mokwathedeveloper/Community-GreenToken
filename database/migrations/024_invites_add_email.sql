-- Migration 024: Add invited_email to invites table
-- Security: email-specific invites prevent link hijacking.
-- When invited_email is set, only that email address may accept the invite.
-- Link-copy invites (no email) remain open for any authenticated user.

ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS invited_email TEXT;

-- Index for fast lookup when verifying accept requests
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(invited_email)
  WHERE invited_email IS NOT NULL;

COMMENT ON COLUMN invites.invited_email IS
  'If set, only this email address may accept the invite. NULL = open link (any authenticated user).';
