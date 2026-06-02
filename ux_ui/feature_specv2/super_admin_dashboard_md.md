# Community GreenToken — Super Admin Dashboard Page MD

**Route:** `/admin` | **Access:** `superadmin` role only (platform owner)

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Dashboard mockup | `assets/image/pages/super-admin/super_admin_dashboard_mockup.png` | (varies) | Reference mockup |
| Sidebar bottom | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left (if sidebar exists) |

> Super Admin uses a dark sidebar — apply `mix-blend-mode: multiply` on sidebar image if bg is dark.  
> See `assets/image/sidebar/sidebar_all_pages_guide.md` for sidebar image guide.

## 1. Components
- `PlatformMetricCard` – MRR, total orgs, total members, platform uptime.
- `OrgTable` – All organizations with plan, status, member count, MRR contribution.
- `RevenueChart` – Monthly MRR trend line chart.
- `PlanDistributionChart` – Pie chart: Free / Starter / Pro / Enterprise split.
- `BillingEventLog` – Recent Stripe events with reprocess button.
- `OrgStatusBadge` – Visual: Active / Trial / Past Due / Suspended.
- `SuperAdminNavTabs` – Tabs: Overview / Organizations / Billing / Contracts / Settings.

## 2. States
- **Loading:** Skeleton cards and table rows.
- **Empty:** No orgs yet (first deployment) — shows "Create demo org" prompt.
- **Alert:** Past-due orgs highlighted in red in `OrgTable`.
- **Drill-down:** Click org row → navigate to `/admin/orgs/:id` for detail view.

## 3. Data
- `GET /api/admin/metrics` — platform MRR, org counts by plan, total members
- `GET /api/admin/orgs` — full org list with status
- `GET /api/admin/billing-events` — last 50 Stripe events

## 4. Primary Route
- `/admin`
- Accessible only to `superadmin` users; all other roles get 403 redirect
- Typically accessed at `admin.greentoken.app` (separate subdomain)

## 5. Key Interactions
1. **Org drill-down:** Click org row → `/admin/orgs/:id` shows full org detail.
2. **Override plan:** Click org's plan badge → dropdown to manually set plan.
3. **Suspend org:** Red "Suspend" button → confirmation modal → marks org inactive.
4. **Reprocess event:** Click "Retry" on failed billing event → re-fires webhook.
5. **Export report:** "Export CSV" button → downloads all orgs + MRR data.
6. **Impersonate admin:** "View as Admin" link → opens org's admin dashboard in read-only mode.

## 6. Folder Structure
```
frontend/
├── components/
│   ├── PlatformMetricCard.jsx
│   ├── OrgTable.jsx
│   ├── RevenueChart.jsx
│   ├── PlanDistributionChart.jsx
│   ├── BillingEventLog.jsx
│   └── OrgStatusBadge.jsx
├── pages/
│   └── admin/
│       ├── index.jsx        Platform overview
│       ├── orgs.jsx         All orgs table
│       ├── orgs/[id].jsx    Individual org detail
│       └── billing.jsx      Stripe event log
└── data/
    └── mockSuperAdminData.js
```

## 7. UX/UI Notes
- Use a dark sidebar layout to visually distinguish super admin from org admin.
- `OrgStatusBadge` color coding: Active=green, Trial=blue, Past Due=amber, Suspended=red.
- `RevenueChart` shows MRR by month for the last 12 months.
- `PlanDistributionChart` uses the design system's color tokens per plan tier.
- `OrgTable` is sortable by plan, MRR, member count, created date.

## 8. Accessibility
- Super admin panel has `role="main"` landmark with `aria-label="Platform Administration"`.
- `OrgTable` uses `<caption>` to describe the table for screen readers.
- Suspend / Override actions require a confirmation step with clear consequence text.
- All charts have text-based data table fallbacks.

## 9. Security Requirements
- Route protected by server-side role check on every request (not just client-side).
- All super admin API routes validate `role = 'superadmin'` from JWT — never trust client.
- Audit log: every super admin action is logged in a `superadmin_audit_log` table.
- Session timeout: 1-hour inactivity timeout for super admin sessions.
- Consider requiring 2FA for super admin login.
