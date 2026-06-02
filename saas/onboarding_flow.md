# Community GreenToken — Organization Onboarding Flow

## 5-Step Setup Wizard

New organizations go through a guided wizard at `/org/setup`. Each step is saved progressively so the org owner can return and resume if they leave.

---

## Step 1: Organization Profile

**Route:** `/org/setup?step=1`

```
┌─────────────────────────────────────────┐
│  🌿 Set Up Your GreenToken Program      │
│  Step 1 of 5 — Organization Profile    │
│                                         │
│  Organization Name *                    │
│  [Cape Town City Council          ]     │
│                                         │
│  Subdomain (your unique URL) *          │
│  [capetown          ].greentoken.app    │
│  ✅ Available                           │
│                                         │
│  Organization Type                      │
│  ○ Municipality   ● School   ○ NGO      │
│  ○ Corporate      ○ Other               │
│                                         │
│  Logo (optional)                        │
│  [ Upload Logo ]                        │
│                                         │
│            [ Continue → ]               │
└─────────────────────────────────────────┘
```

**Saved to:** `organizations.name`, `organizations.slug`, `organizations.type`

---

## Step 2: Token Configuration

**Route:** `/org/setup?step=2`

```
┌─────────────────────────────────────────┐
│  Step 2 of 5 — Your Token              │
│                                         │
│  Token Name *                           │
│  [CapeTownGreen                   ]     │
│  Members will earn "CapeTownGreen"      │
│                                         │
│  Token Symbol *  (3–5 characters)       │
│  [CTG  ]                                │
│                                         │
│  Brand Color                            │
│  [#2ECC71 ████]                         │
│                                         │
│  Action Types (choose up to 10 on Pro) │
│  ☑ Recycling    ☑ Tree Planting        │
│  ☑ Carpooling   ☑ Energy Saving        │
│  ☐ Water Saving ☐ Public Transport     │
│  ☐ Composting   ☑ Community Clean-up   │
│                                         │
│  Tokens per verified action: [ 10 ]     │
│                                         │
│      [ ← Back ]  [ Continue → ]        │
└─────────────────────────────────────────┘
```

**Saved to:** `organizations.token_name`, `organizations.token_symbol`, `organizations.primary_color`, `action_types` config

---

## Step 3: Choose Plan

**Route:** `/org/setup?step=3`

```
┌────────────────────────────────────────────────────────────────┐
│  Step 3 of 5 — Choose Your Plan                               │
│                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  FREE    │  │  STARTER     │  │  PRO         │            │
│  │  $0/mo   │  │  $49/mo      │  │  $199/mo     │            │
│  │          │  │              │  │              │            │
│  │ 50 mem   │  │ 500 members  │  │ 5,000 members│            │
│  │ Basic    │  │ Analytics ✅  │  │ White-label ✅│            │
│  │ 3 actions│  │ Custom token ✅│  │ API access ✅ │            │
│  │          │  │ 10 actions ✅ │  │ Priority ✅   │            │
│  │  SELECT  │  │   SELECT     │  │  SELECT ★    │            │
│  └──────────┘  └──────────────┘  └──────────────┘            │
│                                                                │
│  🎁 All plans include a 14-day Pro trial — no credit card     │
│                                                                │
│              [ ← Back ]  [ Continue → ]                       │
└────────────────────────────────────────────────────────────────┘
```

**Action:** Creates Stripe checkout session if paid plan selected, or proceeds free.

---

## Step 4: Deploy Smart Contract

**Route:** `/org/setup?step=4`

```
┌─────────────────────────────────────────┐
│  Step 4 of 5 — Your Token Contract     │
│                                         │
│  We're deploying your CapeTownGreen     │
│  token smart contract to the blockchain │
│                                         │
│  Network: Stellar Testnet               │
│  Token: CTG                             │
│  Initial Supply: 0                      │
│  Minting: Auto on action verification  │
│                                         │
│  [ 🚀 Deploy Contract ]                 │
│                                         │
│  — or —                                 │
│                                         │
│  [ Use Shared Contract (faster) ]       │
│  Shared contracts are partitioned by   │
│  org_id. Suitable for Free/Starter.    │
│                                         │
│      [ ← Back ]  [ Continue → ]        │
└─────────────────────────────────────────┘
```

**API call:** `POST /api/contracts/deploy` → stores `contract_address` in org record.

---

## Step 5: Invite Your Team

**Route:** `/org/setup?step=5`

```
┌─────────────────────────────────────────┐
│  Step 5 of 5 — Invite Members          │
│                                         │
│  Share this link with your members:    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ capetown.greentoken.app/join/     │  │
│  │ abc123def456                      │  │
│  └───────────────────────────────────┘  │
│  [ 📋 Copy Link ]  [ Share via Email ]  │
│                                         │
│  Or invite by email:                    │
│  [email@example.com         ] [+ Add]   │
│                                         │
│  Pending invites (0/50 members used):  │
│  (no invites yet)                       │
│                                         │
│  [ Skip for Now ]  [ 🎉 Go Live! ]      │
└─────────────────────────────────────────┘
```

**API calls:** `POST /api/invites/create` → stores invite token in `invites` table.

---

## Post-Onboarding: Org Admin Dashboard

After completing the wizard, the org owner lands on their admin dashboard at `/{slug}.greentoken.app/org/admin`. From here they can:
- Monitor member count and token activity
- Verify or configure action auto-approval
- Manage reward catalog
- View billing and usage stats
- Send mass invites or manage member roles

---

## Onboarding API Routes

| Method | Route | Action |
|---|---|---|
| `POST` | `/api/orgs/create` | Create org + owner membership |
| `GET` | `/api/orgs/check-slug` | Check slug availability |
| `PUT` | `/api/orgs/:id/config` | Save token config + action types |
| `POST` | `/api/billing/create-checkout` | Start Stripe session |
| `POST` | `/api/contracts/deploy` | Deploy or assign smart contract |
| `POST` | `/api/invites/create` | Generate invite link |
| `POST` | `/api/invites/accept` | Accept invite + create membership |

---

## Validation Rules

- `slug`: lowercase letters + hyphens only, 3–30 chars, unique across platform
- `token_name`: 3–30 chars
- `token_symbol`: 3–5 uppercase letters
- `primary_color`: valid hex color
- Invite tokens: expire after 7 days, optional use-count limit
