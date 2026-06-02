# Community GreenToken — Billing Page MD

**Route:** `/org/admin/billing` | **Access:** `owner` role only

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Shared banner | `assets/image/banner.png` | 1916×821 | Optional top section banner |
| Sidebar bottom | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left |

> See `billing page /CommunityGreenToken_BillingPage_Starter.md` for full component starter code.  
> See `assets/image/sidebar/sidebar_all_pages_guide.md` for sidebar image guide.

## 1. Components
- `CurrentPlanCard` – Active plan name, price, renewal date, status badge.
- `PlanUsageSummary` – Members used vs limit, features available vs locked.
- `UpgradeDowngradeButtons` – CTAs for plan changes.
- `TrialCountdown` – If in trial, shows days remaining + upgrade prompt.
- `InvoiceList` – Recent invoices with download links (via Stripe Customer Portal).
- `BillingAlertBanner` – Full-width warning if subscription is past due.
- `PaymentMethodCard` – Shows masked card + "Manage Payment" button (Stripe Portal).

## 2. States
- **Active:** Normal billing view — plan card, usage, invoices.
- **Trialing:** `TrialCountdown` prominent; invoices section hidden.
- **Past Due:** `BillingAlertBanner` at top; "Update Payment Method" CTA.
- **Canceled:** Org downgraded to Free; banner explains what was lost.
- **Loading:** Skeleton while fetching Stripe data.

## 3. Props / Data
- `GET /api/billing/status` — plan, status, trial_ends_at, renewal_date
- `GET /api/orgs/:id/usage` — current member count vs limit
- Invoices loaded via Stripe Customer Portal redirect (no direct API needed)

## 4. Primary Route
- `/org/admin/billing`
- Accessible from org admin nav tabs and from `TrialBanner` CTA

## 5. Key Interactions
1. **Upgrade:** Click "Upgrade to Pro" → `POST /api/billing/create-checkout` → Stripe Checkout.
2. **Downgrade:** Click "Downgrade to Starter" → confirmation modal (warns about lost features) → Stripe portal.
3. **Manage payment:** Click "Update Payment Method" → `POST /api/billing/portal` → Stripe Customer Portal.
4. **Download invoice:** Click invoice row → Stripe-hosted PDF link.
5. **Cancel subscription:** Available in Stripe Customer Portal (not directly in app UI).

## 6. Folder Structure
```
frontend/
├── components/
│   ├── CurrentPlanCard.jsx
│   ├── PlanUsageSummary.jsx
│   ├── TrialCountdown.jsx
│   ├── InvoiceList.jsx
│   ├── BillingAlertBanner.jsx
│   └── PaymentMethodCard.jsx
├── pages/
│   └── org/
│       └── admin/
│           └── billing.jsx
```

## 7. UX/UI Notes
- `BillingAlertBanner` is red/amber and sticks to the top of the page — hard to miss.
- `TrialCountdown` shows a progress bar (days remaining / 14) draining to red.
- `CurrentPlanCard` highlights the active plan in the brand primary color.
- Upgrade path: only show "Upgrade to X" for the next tier above current — never skip.
- Never show pricing details inside the app that contradict the public `/pricing` page.

## 8. Accessibility
- All status changes (past due, canceled) communicated via `role="alert"`.
- Invoice table has proper `<th>` scope and keyboard navigation.
- Stripe-hosted pages handle their own accessibility; no need to replicate.

## 9. Mandatory Enhancements
- Email notification 7 days before trial ends (Supabase Edge Function trigger).
- Email notification when payment fails (Stripe sends → handle in webhook).
- Show estimated next invoice amount based on current plan.
- "Compare plans" link opens `/pricing` in new tab.
