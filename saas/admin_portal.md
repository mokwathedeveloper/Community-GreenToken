# Community GreenToken — Admin Portal

Two levels of admin exist: **Super Admin** (platform owner) and **Org Admin** (per-organization).

---

## 1. Super Admin Dashboard — `/admin`

Access: Only users with `role = 'superadmin'` in `org_members`. Protected by middleware.

### Metrics Overview
```
┌──────────────────────────────────────────────────────────────┐
│  🌿 GreenToken Platform Admin                               │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 47 Orgs  │ │ $8,750   │ │ 23,400   │ │ 98.2%    │       │
│  │ Active   │ │  MRR     │ │ Members  │ │ Uptime   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─ Revenue by Plan ──────────────────────────────────────┐  │
│  │  Free: 30 orgs  |  Starter: 12 orgs  |  Pro: 5 orgs  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Recent Activity                              [ Export CSV ] │
│  ● Wits University upgraded to Pro           2 hours ago    │
│  ● CapeTown Council signed up                4 hours ago    │
│  ● PnP subscription past due                 1 day ago      │
└──────────────────────────────────────────────────────────────┘
```

### Organizations Table
```
| Org Name          | Plan     | Members | MRR    | Status  | Actions      |
|-------------------|----------|---------|--------|---------|--------------|
| Cape Town Council | Pro      | 4,823   | $199   | Active  | View | Edit  |
| Wits University   | Pro      | 812     | $199   | Active  | View | Edit  |
| Pick n Pay        | Starter  | 234     | $49    | Past Due| View | Alert |
| Demo School       | Free     | 47      | $0     | Trial   | View | Edit  |
```

### Super Admin Capabilities
- View all orgs, members, revenue, and platform-wide analytics
- Manually override org plan (e.g., for enterprise deals)
- Suspend or reactivate organizations
- View and re-process Stripe billing events
- Deploy emergency patches to smart contracts
- Send platform-wide announcements
- Export data (CSV) for reporting

---

## 2. Org Admin Dashboard — `/org/admin`

Access: Users with `role = 'admin'` or `role = 'owner'` in the org's `org_members`.

### Overview Panel
```
┌──────────────────────────────────────────────────────────────┐
│  🌿 Cape Town GreenToken Admin                              │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 4,823    │ │ 142,500  │ │ 1,205    │ │ 78%      │       │
│  │ Members  │ │  CTG     │ │ Actions  │ │ Verified │       │
│  │          │ │ Minted   │ │ (30 days)│ │  Rate    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  Plan: Pro ✅  │  4,823 / 5,000 members  │  [ Upgrade ]    │
└──────────────────────────────────────────────────────────────┘
```

### Org Admin Tabs

#### Tab 1: Members
- Table: display name, email, wallet, token balance, joined date, role
- Actions: change role (admin/member), remove, bulk invite
- Search + filter by role, join date, balance
- Show member limit usage bar (e.g., 4,823 / 5,000)

#### Tab 2: Action Verification Queue
- Pending actions submitted by members needing manual review
- Approve → triggers token mint, Reject → notifies member
- Auto-approve toggle (per action type, configurable)
- Filters: by type, date, member

#### Tab 3: Reward Catalog Management
- Add/edit/remove rewards (title, description, cost in tokens, stock)
- Toggle active/inactive without deleting
- View redemption history per reward

#### Tab 4: Token Configuration
- Token name, symbol, mint rate per action type
- Action types: add custom types (Pro feature)
- Smart contract info: address, network, explorer link

#### Tab 5: Analytics (Starter+ only)
- Member growth chart
- Token distribution chart
- Most popular action types
- Donation allocation summary
- Export analytics as PDF / CSV

#### Tab 6: Billing
- Current plan + usage
- Upgrade / downgrade / cancel
- Invoice history (opens Stripe Customer Portal)
- Trial countdown if in trial period

#### Tab 7: Settings
- Org name, logo, branding (primary color)
- Subdomain (slug) — read-only after setup
- Notification preferences
- Delete organization (with confirmation + data export)

---

## 3. Components

### Super Admin
| Component | Description |
|---|---|
| `OrgTable` | Sortable table of all organizations with quick-action buttons |
| `PlatformMetricCard` | MRR, total members, active orgs, uptime |
| `BillingEventLog` | Stripe event log with re-process button |
| `OrgStatusBadge` | Visual status: Active / Trial / Past Due / Suspended |

### Org Admin
| Component | Description |
|---|---|
| `AdminStatCard` | Member count, tokens minted, action rate, verify rate |
| `MemberTable` | Paginated, searchable member roster with role editor |
| `ActionVerificationQueue` | Pending actions with approve/reject buttons |
| `RewardEditor` | Form to create/edit rewards with live preview |
| `PlanUsageBar` | Visual progress: current members vs plan limit |
| `TrialBanner` | Countdown + CTA to upgrade before trial ends |
| `ContractInfoCard` | Contract address, network, token stats |

---

## 4. Routes

| Route | Access | Description |
|---|---|---|
| `/admin` | `superadmin` | Platform overview |
| `/admin/orgs` | `superadmin` | All organizations table |
| `/admin/orgs/:id` | `superadmin` | Individual org detail |
| `/admin/billing` | `superadmin` | Stripe event log + MRR |
| `/org/admin` | `owner\|admin` | Org admin home |
| `/org/admin/members` | `owner\|admin` | Member management |
| `/org/admin/actions` | `owner\|admin` | Action verification queue |
| `/org/admin/rewards` | `owner\|admin` | Reward catalog |
| `/org/admin/settings` | `owner` | Org configuration |
| `/org/admin/billing` | `owner` | Subscription management |
