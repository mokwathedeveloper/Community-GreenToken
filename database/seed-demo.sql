-- ============================================================
-- Community GreenToken — Demo Seed Data
-- ============================================================
-- Run this in your Supabase SQL editor AFTER applying all migrations.
--
-- Creates two demo accounts visible to hackathon judges:
--   Admin : demo-admin@greentoken.app  /  DemoGTK2026!
--   Member: demo-member@greentoken.app /  DemoGTK2026!
--
-- STEP 1: Create both accounts in Supabase Auth dashboard first.
-- STEP 2: Run the query below to get their UUIDs:
--   SELECT id, email FROM auth.users WHERE email LIKE '%greentoken.app%';
-- STEP 3: Replace REPLACE-ADMIN-UUID and REPLACE-MEMBER-UUID below.
-- STEP 4: Run this full script.
-- ============================================================

DO $$
DECLARE
  v_admin_user_id  UUID := 'REPLACE-ADMIN-UUID';   -- paste from step 2
  v_member_user_id UUID := 'REPLACE-MEMBER-UUID';  -- paste from step 2
  v_org_id         UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- ── 1. Organisation ─────────────────────────────────────────
INSERT INTO organizations (
  id, name, slug, plan, token_symbol, token_name,
  is_active, created_at, updated_at
)
VALUES (
  v_org_id,
  'Nairobi Green Schools Initiative',
  'nairobi-green-schools',
  'pro',
  'GTK',
  'GreenToken',
  true,
  NOW() - INTERVAL '30 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, plan = EXCLUDED.plan;

-- ── 2. Org members ────────────────────────────────────────────
-- Admin
INSERT INTO org_members (org_id, user_id, role, joined_at)
VALUES (v_org_id, v_admin_user_id, 'admin', NOW() - INTERVAL '30 days')
ON CONFLICT (org_id, user_id) DO NOTHING;

-- Member — Grace Wanjiku
INSERT INTO org_members (org_id, user_id, role, joined_at)
VALUES (v_org_id, v_member_user_id, 'member', NOW() - INTERVAL '25 days')
ON CONFLICT (org_id, user_id) DO NOTHING;

-- ── 3. Pre-verified actions + 1 pending ──────────────────────
INSERT INTO actions (
  id, org_id, user_id, action_type, description,
  evidence_hash, status, tokens_awarded,
  submitted_at, verified_at, stellar_tx_hash
)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    v_org_id, v_member_user_id,
    'Recycling',
    'Collected and sorted 5 kg of plastic bottles at Westlands School.',
    'a3f2c1b4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef01',
    'verified', 50,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NULL
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    v_org_id, v_member_user_id,
    'TreePlanting',
    'Planted 3 indigenous trees at Karura Forest with the school Scouts chapter.',
    'b4e3d2c1f0e9d8c7b6a594837261504938275647382910475683920184756123',
    'verified', 75,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NULL
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    v_org_id, v_member_user_id,
    'CommunityCleanup',
    'Organised 12-person clean-up along Ngong Road — 15 bags of litter collected.',
    'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
    'verified', 100,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NULL
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    v_org_id, v_member_user_id,
    'Recycling',
    'Monthly e-waste recycling drive — 8 kg collected and taken to certified recycler.',
    'd6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5',
    'pending', 0,
    NOW() - INTERVAL '1 day', NULL, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ── 4. Token balance — 225 GTK earned (50+75+100) ────────────
INSERT INTO token_balances (org_id, user_id, balance, total_earned, total_spent, updated_at)
VALUES (v_org_id, v_member_user_id, 225, 225, 0, NOW())
ON CONFLICT (org_id, user_id) DO UPDATE
  SET balance = EXCLUDED.balance,
      total_earned = EXCLUDED.total_earned,
      updated_at = NOW();

-- ── 5. Rewards catalog ───────────────────────────────────────
INSERT INTO rewards (id, org_id, title, description, token_cost, stock, is_active, created_at)
VALUES
  (
    '00000000-0000-0000-0003-000000000001',
    v_org_id,
    'M-Pesa Cash Out — 100 KES',
    'Redeem 200 GTK for 100 KES sent to your Safaricom M-Pesa number. Processed within 24 hours.',
    200, 100, true, NOW() - INTERVAL '28 days'
  ),
  (
    '00000000-0000-0000-0003-000000000002',
    v_org_id,
    'Eco Tote Bag',
    'Premium recycled cotton tote bag — collect from the school front office.',
    150, 25, true, NOW() - INTERVAL '28 days'
  ),
  (
    '00000000-0000-0000-0003-000000000003',
    v_org_id,
    'Tree Certificate',
    'Official certificate naming a tree in Karura Forest after you. Framed copy available.',
    75, 50, true, NOW() - INTERVAL '28 days'
  )
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE 'Demo seed complete. Org: %, Admin: %, Member: %', v_org_id, v_admin_user_id, v_member_user_id;
END $$;

-- ── Post-seed checks ─────────────────────────────────────────
-- SELECT id, name, plan FROM organizations WHERE slug = 'nairobi-green-schools';
-- SELECT user_id, role FROM org_members WHERE org_id = '00000000-0000-0000-0000-000000000001';
-- SELECT id, action_type, status, tokens_awarded FROM actions WHERE org_id = '00000000-0000-0000-0000-000000000001';
-- SELECT user_id, balance FROM token_balances WHERE org_id = '00000000-0000-0000-0000-000000000001';
