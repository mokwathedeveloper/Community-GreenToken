# 🌿 Community GreenToken — Judge Demo Guide

**Live URL:** https://community-greentoken.vercel.app  
**GitHub:** https://github.com/mokwathedeveloper/Community-GreenToken  
**Stellar Testnet Contracts:** See [README.md](README.md#deployed-contracts)

---

## 🔑 Demo Credentials

> **Setup required once:** Run `database/seed-demo.sql` in your Supabase SQL editor after creating the two auth accounts below.

| Role | Email | Password | What you'll see |
|---|---|---|---|
| **Org Admin** | `demo-admin@greentoken.app` | `DemoGTK2026!` | Full admin dashboard — action verification queue, analytics, billing |
| **Member** | `demo-member@greentoken.app` | `DemoGTK2026!` | Member dashboard — 225 GTK balance, pending actions, M-Pesa withdrawal |

### One-time setup (5 minutes)

1. Go to your **Supabase Dashboard → Authentication → Users**
2. Click **"Add user"** → create `demo-admin@greentoken.app` / `DemoGTK2026!`
3. Click **"Add user"** → create `demo-member@greentoken.app` / `DemoGTK2026!`
4. In **SQL Editor**, run this to get the UUIDs:
   ```sql
   SELECT id, email FROM auth.users WHERE email LIKE '%greentoken.app%';
   ```
5. Open `database/seed-demo.sql`, replace `REPLACE-ADMIN-UUID` and `REPLACE-MEMBER-UUID` with the real UUIDs from step 4
6. Run the full `database/seed-demo.sql` script in the SQL Editor
7. Done — both accounts are now live with a pre-seeded org, 3 verified actions, and 225 GTK balance

---

## 🎯 Core User Journey (for judges)

### Journey A — Org Admin

1. Visit https://community-greentoken.vercel.app/signin
2. Sign in as `demo-admin@greentoken.app`
3. Lands on **/org/admin** dashboard
4. Click **"Action Verification"** in sidebar
5. See **"1 action awaiting review"** (Grace Wanjiku's recycling e-waste submission)
6. Set token reward (default 80 GTK) → click **"✓ Approve"**
7. Watch **"Minting on Stellar…"** pulse indicator appear on the row
8. Within ~5 seconds the pulse becomes: **"Stellar: abc123ef…"** — click it
9. Opens **https://stellar.expert/explorer/testnet/tx/[hash]** — live on-chain proof

### Journey B — Community Member (Grace Wanjiku)

1. Sign in as `demo-member@greentoken.app`
2. Lands on **/dashboard** — see **225 GTK** balance
3. Click **"Submit Action"** → fill a new eco-action form, submit
4. Go to **/redeem** → rewards catalog with three items
5. Go to **/withdraw** → enter a Safaricom number → request 100 KES for 200 GTK

---

## 🎬 2-Minute Video Script

> Record as a screen recording with voiceover. Keep each section tight.

---

### ⏱️ 0:00–0:20 — The Problem (no screen needed, or show the landing page)

> *"Every year, communities across Africa take eco-actions — recycling, clean-ups, tree planting — but there is no reliable, transparent way to reward them. Existing platforms either use unverified self-reporting or run on blockchains with fees so high that micro-rewards are economically impossible."*

---

### ⏱️ 0:20–0:40 — The Solution (show landing page)

> *"Community GreenToken is a multi-tenant SaaS platform where schools, NGOs, and companies can launch verified eco-reward programs. Every action is reviewed by an org admin. Every approved reward mints a GTK token on the Stellar blockchain — transparently, immutably, at \$0.000001 per transaction. And community members in Kenya can cash out their earned tokens in KES via M-Pesa."*

*[Scroll landing page slowly — show M-Pesa pill, trust badges, hero]*

---

### ⏱️ 0:40–1:10 — Live Demo: Submit → Verify → Mint

*[Sign in as demo-admin@greentoken.app]*

> *"Here's the admin dashboard for the Nairobi Green Schools Initiative."*

*[Click Action Verification in sidebar]*

> *"Grace Wanjiku submitted a recycling action. As admin, I can see her evidence hash — a SHA-256 fingerprint stored on the Stellar blockchain to prevent duplicate submissions."*

*[Click "✓ Approve"]*

> *"I approve the action. Watch this — in real time, the system calls `ActionRegistry.verify_action()` on Stellar, which triggers a cross-contract call to `GreenToken.mint()`. Grace's wallet receives 80 GTK."*

*[Watch "Minting on Stellar…" pulse → link appears]*

> *"There it is — a live Stellar testnet transaction. I'll click to open Stellar Expert."*

*[Click Stellar Expert link — show the transaction in browser]*

---

### ⏱️ 1:10–1:40 — M-Pesa Cash Out

*[Sign in as demo-member@greentoken.app]*

> *"Now from Grace's perspective — she sees 225 GTK in her dashboard. She goes to the withdrawal page."*

*[Navigate to /withdraw]*

> *"She selects M-Pesa, enters her Safaricom number, and requests 100 KES for 200 GTK. The conversion rate is live. The request goes to the org admin for processing — or in production, directly to the M-Pesa API."*

*[Fill the form and show the confirmation]*

---

### ⏱️ 1:40–2:00 — Close

*[Show Stellar Expert with the live transaction still open]*

> *"Three Soroban contracts deployed on Stellar Testnet. A verified token that can only be minted after a real, human-reviewed eco-action. And a direct M-Pesa off-ramp for communities in Kenya.*  
> *Community GreenToken — making sustainability real, verifiable, and rewarding."*

---

## 📋 Submission Checklist

| Item | Status | Link |
|---|---|---|
| 2-minute video | Record using script above | Upload to YouTube/Loom |
| Live project URL | ✅ Ready | https://community-greentoken.vercel.app |
| GitHub repository | ✅ Public | https://github.com/mokwathedeveloper/Community-GreenToken |
| Demo credentials | Setup guide above | `demo-admin@greentoken.app` |
| Contract addresses | ✅ In README | See README.md #deployed-contracts |
| Team member on Friday Q&A | Confirm attendance | — |

---

## ⭐ Stellar Contract Addresses

| Contract | ID | Explorer |
|---|---|---|
| GreenToken (GTK) | `CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH` | [View ↗](https://stellar.expert/explorer/testnet/contract/CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH) |
| ActionRegistry | `CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO` | [View ↗](https://stellar.expert/explorer/testnet/contract/CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO) |
| RewardManager | `CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR` | [View ↗](https://stellar.expert/explorer/testnet/contract/CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR) |

**Network:** Stellar Testnet · `https://soroban-testnet.stellar.org`

---

*Community GreenToken · WebBridge Hackathon 2026 · Stellar Track*
