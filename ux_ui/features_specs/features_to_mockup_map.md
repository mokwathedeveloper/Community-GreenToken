# Community GreenToken Features to Mockup Map

This document maps each core feature of Community GreenToken to wireframes or mockups, describing user flows, interaction points, and screens. It is designed using professional UX/UI standards and aligned with AI/analytics integration for MVP delivery.

---

## 1. Purpose
Define the UX/UI feature-to-mockup mapping to ensure consistency, usability, and alignment with design principles.

## 2. Feature Mapping

### 2.1 Landing Page
- **Features:** Navigation, Hero section, Problem description, CTA.
- **Mockups:** Wireframes for hero, CTA buttons, feature highlights.
- **User Flow:** User enters site → sees Hero → clicks primary CTA → navigates to Main Feature Page.
- **Interaction Points:** Hover effects on CTA, scroll-triggered animations.

### 2.2 Main Feature Page (Action Submission)
- **Features:** Action input form, submission button, confirmation modal.
- **Mockups:** Form layout, modal design, input validation states.
- **User Flow:** User selects action → fills form → submits → backend/API verifies → token minted → confirmation displayed.
- **Interaction Points:** Loading states, error messages, success notifications.

### 2.3 Dashboard
- **Features:** Token balances, leaderboard, analytics metrics.
- **Mockups:** Card layout, charts, tables.
- **User Flow:** Dashboard shows user token balance → leaderboard ranks users → analytics metrics displayed.
- **Interaction Points:** Real-time updates, hover for detailed metrics, filters and sorting.

### 2.4 Token Redemption Page
- **Features:** Rewards catalog, token deduction confirmation, donation allocation.
- **Mockups:** Reward cards, modal confirmation, donation form.
- **User Flow:** User selects reward → confirms redemption → token balance updated → backend logs transaction.
- **Interaction Points:** Hover states, error handling for insufficient tokens.

### 2.5 Leaderboard
- **Features:** Ranked list of participants, highlight top users.
- **Mockups:** Table or card layout with ranking badges.
- **User Flow:** Backend updates leaderboard → frontend displays top participants.
- **Interaction Points:** Pagination, filtering by action type or time period.

### 2.6 Donation Tracking
- **Features:** Donation logs, project allocation, confirmation status.
- **Mockups:** Card layout, progress indicators.
- **User Flow:** User allocates tokens → backend logs donation → frontend updates donation progress.
- **Interaction Points:** Visual feedback, hover details for each donation.

### 2.7 AI/Analytics Integration
- **Features:** Real-time metrics, impact visualization, trend analysis.
- **Mockups:** Charts, graphs, and dashboards.
- **User Flow:** Backend sends action and donation data to AI/Analytics API → metrics calculated → dashboard updated.
- **Interaction Points:** Dynamic charts, tooltips, drill-down capabilities.

### 2.8 Sign In Page
- **Features:** Email/password login, wallet connect, forgot password link.
- **Mockups:** `mockup/signin_page_mockup.png`
- **User Flow:** User enters credentials → Supabase Auth → JWT with org_id issued → redirect to `/dashboard`.
- **Interaction Points:** Loading spinner, inline error messages, wallet connect modal.

### 2.9 About Us Page
- **Features:** Mission statement, values grid, team cards, CTA banner.
- **Mockups:** `mockup/about_us_page_mockup.png`
- **User Flow:** User arrives via nav → reads mission → clicks CTA → goes to `/org/setup`.
- **Interaction Points:** Scroll-triggered value card animations, team card hover bio.

### 2.10 How It Works Page
- **Features:** 5-step cards, flow diagram, FAQ accordion, CTA.
- **Mockups:** `mockup/how_it_works_page_mockup.png`
- **User Flow:** User reads steps 1→5 → views diagram → reads FAQ → clicks CTA → `/feature`.
- **Interaction Points:** FAQ expand/collapse, diagram lazy load, CTA scroll-trigger.

### 2.11 Public Impact Page
- **Features:** Live stat count-up cards, project progress bars, ecosystem diagram.
- **Mockups:** `mockup/impact_page_mockup.png`
- **User Flow:** Public visitor → sees community stats → sees funded projects → shares on social.
- **Interaction Points:** Number count-up on viewport entry, progress bar fill animation.

### 2.12 Sign Up Page
- **Features:** Name/email/password form, wallet connect, invite token pre-fill, terms checkbox.
- **Mockups:** `mockup/signin_page_mockup.png` *(placeholder — create dedicated signup mockup)*
- **User Flow:** New user signs up → if invite token redirect to `/dashboard`, else → `/org/setup`.
- **Interaction Points:** Password strength meter, terms links open in new tab.

### 2.13 Pricing Page *(SaaS)*
- **Features:** Monthly/annual toggle, 4 plan cards, feature comparison table, FAQ.
- **Mockups:** `mockup/pricing_page_mockup.png`
- **User Flow:** Visitor sees plans → selects plan → Free goes to `/org/setup`, paid goes to Stripe.
- **Interaction Points:** Annual/monthly toggle, plan card hover lift, Stripe redirect.

### 2.14 Org Onboarding Wizard *(SaaS)*
- **Features:** 5-step wizard, slug availability check, brand color picker, contract deploy.
- **Mockups:** `assets/image/saas/org_onboarding_wizard.png`
- **User Flow:** New org owner → fills 5 steps → deploys contract → invites members → goes live.
- **Interaction Points:** Real-time slug check, live brand preview, confetti on step 5.

### 2.15 Org Admin Dashboard *(SaaS)*
- **Features:** Stat cards, plan usage bar, trial banner, verification queue, admin tabs.
- **Mockups:** `assets/image/saas/org_admin_dashboard.png`
- **User Flow:** Admin logs in → sees overview → approves/rejects actions → manages members.
- **Interaction Points:** Approve/reject actions, real-time queue updates, tab switching.

### 2.16 Super Admin Dashboard *(SaaS)*
- **Features:** Platform MRR, org table, revenue chart, plan distribution pie.
- **Mockups:** `assets/image/saas/super_admin_dashboard.png`
- **User Flow:** Platform owner → sees all orgs → drills into org → overrides plan or suspends.
- **Interaction Points:** Org table sorting, drill-down, plan override dropdown.

### 2.17 Billing Page *(SaaS)*
- **Features:** Current plan card, usage bar, trial countdown, upgrade buttons, Stripe portal.
- **Mockups:** `assets/image/saas/billing_page_mockup.png`
- **User Flow:** Org owner → sees plan → clicks upgrade → Stripe checkout → plan updated.
- **Interaction Points:** Trial countdown bar, upgrade/downgrade CTAs, Stripe portal link.

### 2.18 Member Management Page *(SaaS)*
- **Features:** Searchable member table, role badges, invite modal, bulk actions.
- **Mockups:** `assets/image/saas/member_management_page.png`
- **User Flow:** Admin → searches members → changes roles → invites new via link or email.
- **Interaction Points:** Live search, checkbox bulk select, invite modal copy link.

### 2.19 Org Settings Page *(SaaS)*
- **Features:** Profile form, token config, action types editor, contract info, danger zone.
- **Mockups:** `assets/image/saas/org_settings_page.png`
- **User Flow:** Owner → edits token name/symbol → updates action types → saves.
- **Interaction Points:** Color picker live preview, action type toggle, delete org confirmation.

## 3. Design Files and Prototypes
- **Figma/Adobe XD Links:** [Insert links to mockups and prototypes]
- Ensure all mockups follow design system guidelines.
- Maintain consistent spacing, color palette, typography, and interaction patterns.

## 4. Alignment with Design Principles
- Clear hierarchy and strong spacing.
- Simple navigation and obvious CTAs.
- Readable data and obvious feedback states.
- AI/Analytics visualizations maintain exact interaction per design guide.
- Mobile-first and responsive layouts.

This document ensures **all features are mapped to professional mockups**, user flows are clearly defined, and frontend/AI interactions follow UX/UI design rules for Community GreenToken MVP.

