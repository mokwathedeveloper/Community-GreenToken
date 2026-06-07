-- Migration 026: Add payment tracking columns to withdrawal_requests
-- Run in: Supabase Dashboard → SQL Editor → New Query

ALTER TABLE public.withdrawal_requests
  ADD COLUMN IF NOT EXISTS payment_provider TEXT
    CHECK (payment_provider IN ('mpesa', 'stripe', 'manual')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,   -- M-Pesa ConversationID or Stripe payout ID
  ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS admin_note TEXT;          -- optional note from admin on reject/process

-- Allow admin update policy (needed for approve/reject)
-- DROP first so re-running this migration is safe
DROP POLICY IF EXISTS "org_admin_update_withdrawals" ON withdrawal_requests;

CREATE POLICY "org_admin_update_withdrawals" ON withdrawal_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = withdrawal_requests.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role IN ('owner','admin')
    )
  );
