# Community GreenToken — Org Admin Dashboard Page MD

**Route:** `/org/admin` | **Access:** `owner` or `admin` role only

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero / top banner | `assets/image/pages/org-admin/org_admin_hero.png` | 2172×724 | Top of dashboard behind stats cards |
| Shared banner | `assets/image/banner.png` | 1916×821 | Optional secondary banner |
| Sidebar bottom | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left |

> See `Admin Dashboard Page /org_admin_hero_guide.md` for hero implementation.  
> See `assets/image/sidebar/sidebar_all_pages_guide.md` for sidebar image guide.

## 1. Components
- `AdminStatCard` – Key metrics: members, tokens minted, actions (30 days), verify rate.
- `PlanUsageBar` – Current members vs plan limit with upgrade CTA.
- `TrialBanner` – Shown if org is in trial; countdown + upgrade button.
- `ActionVerificationQueue` – Pending action submissions awaiting admin review.
- `MemberTable` – Paginated member list with role + status.
- `RecentActivityFeed` – Last 10 platform events (new members, actions, redemptions).
- `AdminNavTabs` – Tabs: Overview / Members / Actions / Rewards / Analytics / Billing / Settings.

## 2. States
- **Loading:** Skeleton cards while API data loads.
- **Empty:** First-time org with no members yet — shows "Invite your first member" CTA.
- **Trial:** `TrialBanner` visible at top; plan-gated features show lock icons.
- **Past Due:** Full-page warning banner prompting billing update.
- **Hover:** Table rows highlight; action cards show approve/reject buttons.

## 3. Data
- `GET /api/orgs/:id/usage` — member count, plan limit, trial status
- `GET /api/analytics/overview` — stat card metrics
- `GET /api/actions/pending` — verification queue
- `GET /api/orgs/:id/members?limit=10` — recent members
- `GET /api/tokens/supply` — total tokens minted

## 4. Primary Route
- `/org/admin`
- Accessible from the main org navbar (admin users only)
- Redirect here after completing the onboarding wizard

## 5. Key Interactions
1. **Verify action:** Click ✅ → `PUT /api/actions/:id/verify` → tokens minted, table updates.
2. **Reject action:** Click ❌ → optional rejection reason modal → `PUT /api/actions/:id/reject`.
3. **Invite members:** Click "Invite" → opens invite modal with copyable link.
4. **Upgrade plan:** Click `PlanUsageBar` CTA → redirects to `/org/admin/billing`.
5. **Tab navigation:** Tabs switch between dashboard sections without full page reload.

## 6. Folder Structure
```
frontend/
├── components/
│   ├── AdminStatCard.jsx
│   ├── PlanUsageBar.jsx
│   ├── TrialBanner.jsx
│   ├── ActionVerificationQueue.jsx
│   ├── MemberTable.jsx
│   ├── RecentActivityFeed.jsx
│   └── AdminNavTabs.jsx
├── pages/
│   └── org/
│       └── admin.jsx
└── data/
    └── mockAdminData.js   (demo data)
```

## 7. UX/UI Notes
- `AdminStatCard` uses a 4-column grid on desktop, 2-column on tablet, 1-column on mobile.
- `PlanUsageBar` turns yellow at 80% capacity, red at 95% — clear visual warning.
- `TrialBanner` is dismissible but reappears on each login during trial.
- `ActionVerificationQueue` is the primary action for new orgs — give it prominent placement.
- Follow `design_system.md` color tokens for all status indicators.

## 8. Accessibility
- Table rows have `role="row"` with keyboard navigation (arrow keys).
- Approve/Reject buttons include descriptive `aria-label` (e.g., "Approve action: Recycling by Alice").
- `TrialBanner` uses `role="alert"` so screen readers announce it on page load.
- All tab panels implement `role="tabpanel"` with correct `aria-labelledby`.

## 9. Mandatory Enhancements
- Real-time updates to the verification queue via Supabase Realtime subscriptions.
- Bulk verify/reject: checkbox select multiple actions → apply to all.
- Export member list as CSV from the Members tab.
- Email notification to admin when pending queue exceeds 10 items.
