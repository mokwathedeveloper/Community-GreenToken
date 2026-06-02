# Community GreenToken — Org Onboarding Wizard Page MD

**Route:** `/org/setup?step=1–5` | **Access:** Authenticated (new org owner)

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/org-onboarding/org_onboarding_hero.png` | 1402×1122 | Wizard hero section |
| Shared banner (fallback) | `assets/image/banner.png` | 1916×821 | Optional section banner |
| Sidebar bottom | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left (if wizard has sidebar) |

> See `org_onboarding_page/org_onboarding_hero.md` for hero implementation.

## 1. Components
- `OnboardingProgressBar` – 5-step progress indicator at the top.
- `StepOrgProfile` – Step 1: name, slug, type, logo.
- `StepTokenConfig` – Step 2: token name, symbol, brand color, action types.
- `StepPlanSelection` – Step 3: plan picker with Stripe checkout.
- `StepContractDeploy` – Step 4: deploy or assign smart contract.
- `StepInviteMembers` – Step 5: generate invite link + email invites.
- `StepNavButtons` – Back / Continue buttons with validation.
- `SlugAvailabilityCheck` – Real-time slug availability indicator.

## 2. States
- **Default:** Current step form fields empty/pre-filled.
- **Saving:** Auto-save on each step completion (progress persists on reload).
- **Error:** Inline validation messages per field.
- **Loading:** Contract deployment step shows progress animation.
- **Complete:** Step 5 "Go Live" triggers confetti + redirect to org admin.

## 3. Data Flow
```
Step 1 complete → POST /api/orgs/create (creates org + membership)
Step 2 complete → PUT /api/orgs/:id/config
Step 3 complete → POST /api/billing/create-checkout (if paid)
Step 4 complete → POST /api/contracts/deploy
Step 5 complete → POST /api/invites/create
```

## 4. Primary Route
- `/org/setup` — redirects to `?step=1` for new orgs
- Accessible from pricing page CTA and sign-in flow for new users

## 5. Key Interactions
1. Slug field auto-formats: lowercase + hyphens, checks availability in real-time.
2. Color picker in step 2 updates a live brand preview panel on the right.
3. Plan selection in step 3 opens Stripe Checkout in a new tab; returns to step 4 on success.
4. Contract deploy button shows a blockchain animation while the transaction processes.
5. Invite link has a one-click copy button; email invites are sent via Supabase Edge Function.
6. "Skip for Now" on step 5 allows the owner to proceed without inviting members immediately.

## 6. Folder Structure
```
frontend/
├── components/
│   ├── OnboardingProgressBar.jsx
│   ├── StepOrgProfile.jsx
│   ├── StepTokenConfig.jsx
│   ├── StepPlanSelection.jsx
│   ├── StepContractDeploy.jsx
│   ├── StepInviteMembers.jsx
│   ├── StepNavButtons.jsx
│   └── SlugAvailabilityCheck.jsx
├── pages/
│   └── org/
│       └── setup.jsx
└── data/
    └── onboardingSteps.js
```

## 7. UX/UI Notes
- Progress bar uses 5 numbered circles; completed steps show green checkmark.
- Right panel shows a live preview of how the org's dashboard will look (logo, color, token name).
- Keep form fields minimal per step — max 4 fields per screen.
- Mobile layout: full-width single column, progress bar collapses to "Step X of 5".
- Error states appear inline below the field (never in a modal).

## 8. Accessibility
- Each step is a `<form>` with correct `<label>` associations.
- `SlugAvailabilityCheck` uses `role="status"` aria-live for screen reader updates.
- Contract deploy animation includes a text fallback: "Deploying your contract…".
- Keyboard: Tab through fields, Enter to submit, Escape to go back.

## 9. Mandatory Enhancements
- Resume onboarding: if user leaves mid-wizard, on next login show "Continue Setup" banner.
- Confetti animation on step 5 completion (use `canvas-confetti`).
- Send welcome email after org is created (Supabase Edge Function trigger).
