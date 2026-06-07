-- Migration 027: Tighten withdrawal_requests RLS
-- The original FOR ALL policy allowed members to UPDATE/DELETE their own rows.
-- Members should only SELECT (read history) and INSERT (create new requests).
-- Admin updates happen via createAdminClient() (service role, bypasses RLS).

-- Drop the too-permissive policy
DROP POLICY IF EXISTS "member_own_withdrawals" ON withdrawal_requests;

-- Read: member sees only their own rows
CREATE POLICY "member_select_own_withdrawals" ON withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Insert: member can submit new withdrawal requests
CREATE POLICY "member_insert_withdrawals" ON withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE are handled by the service-role admin client — no member policy needed.
