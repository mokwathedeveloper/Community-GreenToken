-- Migration 022: Create withdrawal_requests table
-- Members can convert GTK tokens → KSH or USD and withdraw to M-Pesa or bank account.
-- RBAC: only members can create withdrawal requests; admins/owners can view and approve.

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),

  -- Token side
  tokens_amount   INTEGER NOT NULL CHECK (tokens_amount > 0),

  -- Cash side
  currency        TEXT NOT NULL DEFAULT 'KES'    -- KES (KSH) | USD
                    CHECK (currency IN ('KES','USD')),
  cash_amount     NUMERIC(10,2) NOT NULL,         -- computed: tokens × rate at submission time
  exchange_rate   NUMERIC(10,6) NOT NULL,         -- e.g. 0.50 means 1 GTK = 0.50 KES

  -- Payout method
  method          TEXT NOT NULL
                    CHECK (method IN ('mpesa','bank_transfer')),
  account_name    TEXT NOT NULL,                  -- beneficiary name
  account_number  TEXT NOT NULL,                  -- M-Pesa number or bank account number
  bank_name       TEXT,                           -- required for bank_transfer

  -- Status lifecycle
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','completed','failed','canceled')),
  failure_reason  TEXT,
  processed_at    TIMESTAMPTZ,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user    ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_org     ON withdrawal_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status  ON withdrawal_requests(status);

-- RLS: users can only see their own withdrawal requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_own_withdrawals" ON withdrawal_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "org_admin_view_withdrawals" ON withdrawal_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = withdrawal_requests.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('owner','admin')
    )
  );
