# Community GreenToken UI/UX Implementation Blueprint

This document provides a **professional implementation blueprint** for the frontend and AI/Analytics integration of Community GreenToken, ensuring adherence to design guidelines and supporting the MVP.

---

## 1. Frontend Components Implementation
- **Reusable Components:** Buttons, cards, modals, forms, tables.
- **Pages:** Landing, Main Feature (Action Submission), Dashboard, Token Redemption, Donations, Leaderboard, Analytics.
- **Props Definition:** Clearly define all component props with types and default values.
- **State Management:**
  - Global state using React Context or Zustand for user session, token balances, and dashboard metrics.
  - Local component state for forms, modals, loading/error states.
- **Routing:** Next.js pages directory structure with dynamic routing for dashboards and reports.
- **Styling:** Tailwind CSS with design tokens from the design system.
- **Accessibility:** Ensure keyboard navigation, focus management, aria-labels, and color contrast adherence.

## 2. AI/Analytics API Interaction Design
- **Data Flow:**
  1. User submits action or donation → Next.js API route validates → Data sent to AI/Analytics API.
  2. AI/Analytics API returns processed metrics → Backend updates Supabase → Dashboard refreshed.
- **Frontend Integration:**
  - Analytics charts and tables use fetched metrics.
  - Leaderboard updates reflect real-time AI/Analytics calculations.
- **Error Handling:** Display friendly errors for API failures, fallback to cached data if necessary.
- **Real-time Updates:** Optional WebSocket or polling to keep dashboards and analytics metrics current.

## 3. Adherence to Design Guidelines
- Use color palette, typography, spacing, and component styling as defined in `design_system.md`.
- Ensure all mockups from `features_to_mockup_map.md` are faithfully represented.
- Maintain consistent UI patterns and interaction flows across all pages.
- Implement micro-interactions and animations per `interaction_guidelines.md`.
- Mobile-first design with responsive adjustments for tablets and desktops.

## 4. Reusable Modules and Blueprint
- **API Service Module:** Centralized module for all API calls, authentication, and error handling.
- **Smart Contract Service Module:** Handles calls to GreenToken, ActionRegistry, and RewardManager.
- **Dashboard Module:** Aggregates token balances, leaderboard, analytics, and donation tracking.
- **Form Validation Module:** Reusable validation rules for action submission and redemption forms.
- **Props and Component Blueprint:** Each component should document props, expected data structure, and optional/required values.

This blueprint ensures that the Community GreenToken frontend and AI/Analytics integration are **modular, maintainable, and strictly aligned with UX/UI design standards**, providing a polished MVP ready for hackathon demonstration.

---

## SaaS Extension — Multi-Tenant UI Blueprint

### 5. Tenant Context (OrgProvider)

All pages are wrapped in `OrgProvider` which supplies org-specific values to every component:

```jsx
// _app.jsx
import { OrgProvider } from '../components/org/OrgProvider';

export default function App({ Component, pageProps, orgConfig }) {
  return (
    <OrgProvider config={orgConfig}>
      <Component {...pageProps} />
    </OrgProvider>
  );
}
```

`OrgProvider` exposes: `orgId`, `orgSlug`, `tokenName`, `tokenSymbol`, `primaryColor`, `plan`, `memberLimit`.

### 6. Plan Gate Hook

Components that require a paid plan use the `usePlan` hook to conditionally render upgrade prompts:

```jsx
import { usePlan } from '../hooks/usePlan';

export default function AnalyticsPage() {
  const { canAccess, requiredPlan } = usePlan('analytics');
  if (!canAccess) return <UpgradeModal feature="Analytics" requiredPlan={requiredPlan} />;
  return <AnalyticsContent />;
}
```

### 7. Dynamic Branding

The org's `primaryColor` is applied as a CSS custom property at root level, so all Tailwind `text-primary`, `bg-primary` classes automatically use the org's brand color:

```tsx
// OrgProvider.tsx
useEffect(() => {
  document.documentElement.style.setProperty('--color-primary', org.primaryColor);
}, [org.primaryColor]);
```

### 8. New SaaS Pages — Component Summary

| Page | Route | Key Components | Access |
|---|---|---|---|
| Pricing | `/pricing` | `PricingTable`, `FeatureRow`, `FAQAccordion` | Public |
| Sign Up | `/signup` | `SignUpForm`, `InviteTokenInput`, `TermsCheckbox` | Public |
| Org Onboarding | `/org/setup` | `OnboardingProgressBar`, 5 step components | Auth |
| Org Admin | `/org/admin` | `AdminStatCard`, `ActionVerificationQueue`, `PlanUsageBar` | owner/admin |
| Super Admin | `/admin` | `OrgTable`, `PlatformMetricCard`, `RevenueChart` | superadmin |
| Billing | `/org/admin/billing` | `CurrentPlanCard`, `TrialCountdown`, `BillingAlertBanner` | owner |
| Members | `/org/admin/members` | `MemberTable`, `InviteModal`, `BulkActionBar` | owner/admin |
| Settings | `/org/admin/settings` | `TokenConfigForm`, `ActionTypesEditor`, `DangerZone` | owner |

### 9. Tenant Middleware

Every server-side request resolves the org from the subdomain before rendering:

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const host  = req.headers.get('host') || '';
  const slug  = host.split('.')[0];  // capetown from capetown.greentoken.app
  const res   = NextResponse.next();
  res.headers.set('x-org-slug', slug);
  return res;
}
```

### 10. Admin Route Protection

Super admin pages check role server-side — never trust client-side guards alone:

```typescript
// pages/admin/index.jsx
export async function getServerSideProps({ req }) {
  const jwt = await verifyJWT(req.cookies.token);
  if (jwt?.role !== 'superadmin') return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
}
```