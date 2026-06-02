# Community GreenToken — Strict Development Rules

**Status:** FINAL — These rules govern ALL development.  
**Authority:** No exceptions without team lead approval.  
**Scope:** Frontend, Backend, Database, Smart Contracts, Assets.

> ⚠️ These rules are extracted from:
> - `ux_ui/features_specs/DESIGN_SPEC.md` — visual design rules
> - `ux_ui/features_specs/design_system.md` — design system tokens
> - `saas/multi_tenancy_architecture.md` — SaaS isolation rules
> - `implementation/professional_implementation_and_rules.md` — coding standards
> - `architecture/security_checklist.md` — security requirements
>
> 📌 **Folder structure rules are PENDING** — the project folder organization is still being finalized. Folder-path rules in Section 7 will be locked once structure is confirmed.

---

## Table of Contents

1. [Rule Language](#0-rule-language)
2. [Design Token Rules](#1-design-token-rules-color--typography--spacing)
3. [Component Rules](#2-component-rules)
4. [Image and Asset Rules](#3-image-and-asset-rules)
5. [File and Naming Rules](#4-file-and-naming-rules)
6. [Frontend Coding Rules](#5-frontend-coding-rules)
7. [Backend and API Rules](#6-backend-and-api-rules)
8. [SaaS Multi-Tenant Rules](#7-saas-multi-tenant-rules)
9. [Database Rules](#8-database-rules)
10. [Smart Contract Rules](#9-smart-contract-rules)
11. [Security Rules](#10-security-rules)
12. [Accessibility Rules](#11-accessibility-rules)
13. [Folder Structure Rules](#12-folder-structure-rules-pending-confirmation)

---

## 0. Rule Language

| Word | Meaning |
|---|---|
| **MUST** | Mandatory. No exceptions. |
| **MUST NOT** | Forbidden. Never do this. |
| **SHOULD** | Strongly recommended. Deviate only with documented reason. |
| **SHOULD NOT** | Strongly discouraged. |
| **MAY** | Optional. Use when appropriate. |

---

## 1. Design Token Rules (Color / Typography / Spacing)

### 1.1 Color Rules

**R-COLOR-01** — MUST use Tailwind design token classes. MUST NOT hardcode hex values in JSX or CSS.
```jsx
// ✅ CORRECT
<button className="bg-primary-500 hover:bg-primary-600 text-white">

// ❌ WRONG — never hardcode hex
<button style={{ backgroundColor: '#22c55e' }}>
<button className="bg-[#22c55e]">
```

**R-COLOR-02** — MUST use `primary-600` (not `primary-500`) for white text on green backgrounds to meet WCAG AA contrast.
```jsx
// ✅ CORRECT — #16a34a passes 4.6:1 contrast with white
<button className="bg-primary-600 text-white">

// ❌ WRONG — #22c55e fails WCAG AA (2.9:1 only)
<button className="bg-primary-500 text-white">
```

**R-COLOR-03** — MUST use the semantic color map for all status indicators:

| State | Background | Text | MUST use |
|---|---|---|---|
| Available / Success | `bg-green-100` | `text-green-700` | ✅ Always |
| Ongoing / Info | `bg-blue-100` | `text-blue-700` | ✅ Always |
| Trial / Warning | `bg-amber-100` | `text-amber-700` | ✅ Always |
| Past Due / Error | `bg-red-100` | `text-red-600` | ✅ Always |
| Inactive / Neutral | `bg-gray-100` | `text-gray-600` | ✅ Always |

**R-COLOR-04** — MUST NOT introduce new brand colors without updating `tailwind.config.js` and `DESIGN_SPEC.md` first.

**R-COLOR-05** — MUST use `text-gray-900` for headings, `text-gray-700` for body text, `text-gray-500` for secondary/captions.

---

### 1.2 Typography Rules

**R-TYPE-01** — MUST use Poppins font loaded via Google Fonts. MUST NOT use system fonts or any other Google Font.
```css
/* globals.css — MUST be present */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
```

**R-TYPE-02** — MUST follow the type scale. MUST NOT use arbitrary font sizes (`text-[17px]`).

| Element | Required classes |
|---|---|
| Page hero H1 | `text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight` |
| Dashboard H1 | `text-2xl md:text-3xl font-bold text-gray-900` |
| Section H2 | `text-2xl font-bold text-gray-900` |
| Card H3 | `text-lg font-semibold text-gray-900` |
| Body paragraph | `text-sm text-gray-600 leading-relaxed` |
| Caption / label | `text-xs text-gray-500` |
| Stat number | `text-3xl font-bold text-gray-900` |
| Nav link | `text-sm font-medium text-gray-700` |

**R-TYPE-03** — MUST NOT embed text directly inside image files. All text must be added as HTML/JSX overlay on top of images.

**R-TYPE-04** — MUST use `font-medium` (500) for button text, `font-semibold` (600) for labels and headings, `font-bold` (700) for stat numbers and H1/H2.

---

### 1.3 Spacing Rules

**R-SPACE-01** — MUST use Tailwind spacing units only (`p-4`, `gap-6`). MUST NOT use arbitrary values (`p-[18px]`) unless absolutely necessary and documented.

**R-SPACE-02** — MUST follow the spacing hierarchy:

| Context | Tailwind class |
|---|---|
| Page horizontal padding | `px-6` |
| Page vertical padding | `py-8` |
| Card internal padding | `p-5` or `p-6` |
| Compact card padding | `p-4` |
| Gap between stat cards | `gap-4` |
| Gap between content cards | `gap-6` |
| Gap between page sections | `gap-8` or `space-y-8` |
| Sidebar width | `w-60` (240px) |
| Top bar height | `h-16` (64px) |

**R-SPACE-03** — MUST NOT mix margin and padding arbitrarily. Use `gap-*` for flex/grid spacing. Use padding (`p-*`) inside components. Use margin only for page-level layout separation.

---

### 1.4 Border and Shadow Rules

**R-SHADOW-01** — MUST use `shadow-sm` for resting cards, `hover:shadow-md` for hover state. MUST NOT use `shadow-xl` except on modals and dropdowns.

**R-SHADOW-02** — MUST use `rounded-xl` for cards, `rounded-lg` for buttons and inputs, `rounded-full` for badges and avatars, `rounded-2xl` for modals.

**R-SHADOW-03** — MUST use `border border-gray-100` or `border border-gray-200` on cards. MUST NOT use `border-gray-300` or darker for standard cards.

---

## 2. Component Rules

**R-COMP-01** — MUST use the shared component library. MUST NOT write inline one-off implementations of existing components.

The following components are shared and MUST be used:

| Component | Location | Used on |
|---|---|---|
| `Navbar` | `components/Navbar.jsx` | All public pages |
| `Sidebar` | `components/Sidebar.jsx` | All dashboard/app pages |
| `AppTopBar` | `components/AppTopBar.jsx` | All dashboard/app pages |
| `AppLayout` | `components/AppLayout.jsx` | All dashboard pages |
| `PublicLayout` | `components/PublicLayout.jsx` | All public pages |
| `AuthLayout` | `components/AuthLayout.jsx` | Sign In, Sign Up |
| `StatCard` | `components/StatCard.jsx` | Dashboard, org admin |
| `Button` | `components/Button.jsx` | All pages |
| `Badge` | `components/Badge.jsx` | All status indicators |
| `Input` | `components/Input.jsx` | All forms |
| `Modal` | `components/Modal.jsx` | All modal dialogs |
| `ProgressBar` | `components/ProgressBar.jsx` | Donations, usage bars |
| `SidebarBottomImage` | `components/SidebarBottomImage.jsx` | All app sidebars |
| `SharedBanner` | `components/SharedBanner.jsx` | All pages with banners |

**R-COMP-02** — MUST NOT create a new `<button>` element directly in page code. MUST use the `<Button>` component.
```jsx
// ✅ CORRECT
<Button variant="primary" size="md">Submit</Button>

// ❌ WRONG
<button className="bg-green-500 text-white px-4 py-2 rounded-lg">Submit</button>
```

**R-COMP-03** — MUST pass all required props to shared components. MUST NOT leave required props undefined.

**R-COMP-04** — MUST keep business logic OUT of UI components. Components MUST only receive data via props and call callbacks. API calls go in page-level hooks or service files.

**R-COMP-05** — Every component MUST handle these four states (if applicable): `default`, `loading` (skeleton), `empty`, `error`.

**R-COMP-06** — MUST use `motion-reduce:transition-none` alongside every animation/transition class to respect user accessibility preferences.

**R-COMP-07** — The `SidebarBottomImage` component MUST be the LAST item in every app sidebar, always pinned to the bottom using `mt-auto`.

**R-COMP-08** — The `SharedBanner` component MUST use `banner/banner.png` as its image source. MUST NOT embed text inside the banner image file.

---

## 3. Image and Asset Rules

**R-IMG-01** — ALL images MUST be sourced from the organized `assets/image/` directory. MUST NOT reference images from the scattered page-specific root folders (`about page /`, `howitworks /`, etc.) — those are source originals only.

**R-IMG-02** — Page-specific hero images MUST be sourced from `assets/image/pages/{page-name}/`. The canonical paths are:

| Page | Hero Image Path |
|---|---|
| Landing | `assets/image/herosection/hero_eco_illustration.png` |
| About Us | `assets/image/pages/about-us/about_us_hero.png` |
| About Us CTA | `assets/image/pages/about-us/about_us_cta_banner.png` |
| Sign In | `assets/image/pages/auth/signin_hero.png` |
| Sign Up | `assets/image/pages/auth/signup_hero.png` |
| How It Works | `assets/image/pages/how-it-works/how_it_works_hero.png` |
| How It Works banner | `assets/image/pages/how-it-works/how_it_works_banner.png` |
| Impact | `assets/image/pages/impact/impact_hero.png` |
| Pricing | `assets/image/pages/pricing/pricing_hero.png` |
| Org Admin | `assets/image/pages/org-admin/org_admin_hero.png` |
| Org Onboarding | `assets/image/pages/org-onboarding/org_onboarding_hero.png` |
| Org Settings | `assets/image/pages/org-settings/org_settings_hero.png` |
| Org Members | `assets/image/pages/org-members/org_members_hero.png` |
| Super Admin | `assets/image/pages/super-admin/super_admin_dashboard_mockup.png` |

**R-IMG-03** — The shared banner MUST always use `assets/image/banner.png`. See `banner/banner_guide.md`.

**R-IMG-04** — The sidebar bottom image MUST always use `assets/image/sidebar/sidebar_bottom_all_pages.png`. See `assets/image/sidebar/sidebar_all_pages_guide.md`.

**R-IMG-05** — ALL `<img>` elements MUST have a descriptive `alt` attribute. MUST NOT use `alt=""` except for purely decorative images, and those MUST also have `role="presentation"`.

**R-IMG-06** — ALL hero, banner, and below-the-fold images MUST use `loading="lazy"`. Above-the-fold images (hero) MAY use `loading="eager"` or omit.

**R-IMG-07** — MUST use `object-cover` on hero/banner images to maintain correct proportions at all screen sizes.

**R-IMG-08** — MUST NOT embed text, buttons, or any UI elements inside image files. All overlaid content MUST be React components positioned with `absolute` over the image.

**R-IMG-09** — MUST NOT commit new images with spaces in filenames. All image filenames MUST be lowercase, underscore or hyphen-separated.

**R-IMG-10** — Branding logos MUST be sourced from `branding/` only:
- `branding/community-greentoken-logo.png` — square logo
- `branding/community-greentoken-web-logo.png` — horizontal web logo
- `branding/community-greentoken-brand-identity-board.png` — brand board

---

## 4. File and Naming Rules

**R-NAME-01** — File naming MUST follow these conventions:

| Type | Convention | Example |
|---|---|---|
| React page | `kebab-case.jsx` | `dashboard.jsx` |
| React component | `PascalCase.jsx` | `StatCard.jsx` |
| React hook | `camelCase.js` | `useTokenBalance.js` |
| Utility function | `camelCase.js` | `planGate.ts` |
| API route | `camelCase.js` | `actions.js` |
| Style file | `kebab-case.css` | `dashboard.css` |
| Test file | same as source + `.test` | `StatCard.test.jsx` |
| MD document | `snake_case.md` | `database_design_plan.md` |
| Image file | `snake_case.png/webp` | `org_admin_hero.png` |

**R-NAME-02** — MUST NOT use spaces in any filename or folder name. (Existing legacy folders with spaces in root are source-only; do not reference in code.)

**R-NAME-03** — MUST NOT use double extensions (`file.png.png`). If a file has a double extension, fix it before importing into code.

**R-NAME-04** — MUST NOT name a component `index.jsx` unless it is the barrel export for a component folder. Page files MUST use descriptive names.

**R-NAME-05** — TypeScript types/interfaces MUST use `PascalCase` and end in `Type` or `Props` where appropriate:
```ts
type UserProps = { name: string; role: 'admin' | 'member' }
interface OrgConfig { orgId: string; tokenName: string; plan: PlanType }
```

---

## 5. Frontend Coding Rules

**R-FE-01** — MUST use TypeScript (`.tsx`/`.ts`) for all new components and pages. MUST NOT write plain JavaScript (`.js`/`.jsx`) for production code.
> Exception: The existing starter code templates in `ux_ui/feature_specv2/*.js` are reference blueprints only — they are NOT production files.

**R-FE-02** — MUST define props using TypeScript interfaces or type aliases. MUST NOT use implicit `any`.
```tsx
// ✅ CORRECT
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
}
export default function StatCard({ label, value, change, changeType }: StatCardProps) {}

// ❌ WRONG
export default function StatCard(props: any) {}
```

**R-FE-03** — MUST use the `useOrg()` hook inside all app pages to access org-scoped data. MUST NOT hardcode org IDs.

**R-FE-04** — MUST use the `usePlan()` hook to gate plan-restricted features. MUST NOT show plan-restricted UI to users on lower plans without the gate.
```tsx
// ✅ CORRECT
const { canAccess } = usePlan('analytics');
if (!canAccess) return <UpgradeModal feature="Analytics" requiredPlan="starter" />;
```

**R-FE-05** — MUST handle all four API states in every data-fetching component: `loading`, `error`, `empty`, `data`. MUST NOT render partial UI or crash on undefined data.

**R-FE-06** — MUST use SWR or React Query for all API data fetching. MUST NOT use `useEffect` + `fetch` directly in components for repeated data.

**R-FE-07** — MUST use Next.js `<Image>` component (not `<img>`) for all images in the actual Next.js `pages/` or `app/` directory to get automatic optimization.
> Exception: Images inside stylesheets or inline `style` attributes may use regular paths.

**R-FE-08** — MUST use `clsx` or `cn()` utility for conditional class names. MUST NOT use string template literals for class concatenation.
```tsx
// ✅ CORRECT
import { cn } from '@/utils/cn';
className={cn('rounded-lg px-4', active && 'bg-primary-50', disabled && 'opacity-50')}

// ❌ WRONG
className={`rounded-lg px-4 ${active ? 'bg-primary-50' : ''} ${disabled ? 'opacity-50' : ''}`}
```

**R-FE-09** — MUST keep all mock/demo data in `frontend/data/` files. MUST NOT define mock data inside component files.

**R-FE-10** — MUST NOT use inline `style={{}}` for values that have a Tailwind equivalent. Inline styles are only permitted for dynamic values that cannot be expressed with Tailwind (e.g., `style={{ width: `${pct}%` }}`).

**R-FE-11** — Every interactive element MUST have visible focus styles. MUST apply `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2` to all buttons, links, and inputs.

**R-FE-12** — All animations MUST include `motion-reduce:transition-none` or `motion-reduce:animate-none` alongside them.

---

## 6. Backend and API Rules

**R-API-01** — EVERY API route MUST extract `org_id` from the JWT and scope all database queries to it. No query may run without `org_id` on tenant-scoped tables.
```typescript
// ✅ CORRECT — MUST do this at the start of every org-scoped route
const orgId = req.jwt?.org_id;
if (!orgId) return res.status(401).json({ error: 'Missing org context' });
```

**R-API-02** — ALL API responses MUST use this standard format:
```typescript
// Success
{ "data": {...}, "meta": { "org_id": "uuid", "plan": "pro" } }

// Error
{ "error": { "code": "ERROR_CODE", "message": "Human-readable message" } }

// List with pagination
{ "data": [...], "pagination": { "page": 1, "per_page": 20, "total": 143 } }
```

**R-API-03** — MUST validate all request inputs with Zod schemas before processing. MUST NOT access `req.body` fields directly without validation.

**R-API-04** — MUST return these HTTP status codes correctly:
- `200` — OK
- `201` — Created
- `400` — Bad request / validation error
- `401` — Unauthenticated
- `403` — Unauthorized (authenticated but wrong permissions)
- `404` — Resource not found
- `409` — Conflict (e.g. slug already taken)
- `422` — Plan limit exceeded
- `429` — Rate limit exceeded
- `500` — Internal server error (never expose stack traces to client)

**R-API-05** — Plan-gated endpoints MUST check the org's plan before processing. Return `422` with `code: "PLAN_LIMIT_EXCEEDED"` and `upgrade_url: "/pricing"` when blocked.

**R-API-06** — MUST log every API error with `org_id`, `user_id`, `route`, `error.message` using structured logging. MUST NOT `console.log` raw error objects in production.

**R-API-07** — Rate limiting MUST be applied per `org_id`, not per IP address. Limits: Free=30/min, Starter=120/min, Pro=600/min.

---

## 7. SaaS Multi-Tenant Rules

**R-SAAS-01** — EVERY database query on a tenant-scoped table MUST include `.eq('org_id', orgId)`. No exceptions.

**R-SAAS-02** — MUST NOT rely solely on application-layer org_id filtering. Supabase RLS policies MUST be the final enforcement layer. Both must be present.

**R-SAAS-03** — JWT MUST contain `org_id` and `role` claims. These MUST be injected by the Supabase custom JWT hook on every sign-in, never set by the frontend.

**R-SAAS-04** — Super admin routes (`/api/admin/*`) MUST check `jwt.role === 'superadmin'` server-side on EVERY request. MUST NOT rely on client-side role checks for these routes.

**R-SAAS-05** — MUST NOT allow an org `admin` role to read, write, or modify data from a different `org_id`. Cross-tenant access of any kind is forbidden.

**R-SAAS-06** — Stripe webhook handler MUST verify the Stripe signature using `stripe.webhooks.constructEvent()` before processing any event. MUST reject unsigned events with `400`.

**R-SAAS-07** — Every org operation that changes plan, billing status, or member count MUST also update the `organizations` table atomically in the same transaction.

**R-SAAS-08** — Invite tokens MUST expire. Default expiry: 7 days. MUST return `410 Gone` for expired tokens, NOT `404`.

**R-SAAS-09** — The `OrgProvider` context wrapper MUST be the outermost wrapper on all app pages. Every child component accesses org data ONLY through `useOrg()`.

**R-SAAS-10** — Org slugs are permanent after creation. MUST NOT allow slug changes after onboarding step 1 is completed.

---

## 8. Database Rules

**R-DB-01** — ALL new tables MUST include `org_id UUID NOT NULL REFERENCES organizations(id)` unless they are platform-level tables (e.g., `organizations`, `plan_limits`).

**R-DB-02** — ALL tables MUST have `created_at TIMESTAMPTZ DEFAULT now()` at minimum. Tables with mutable data MUST also have `updated_at`.

**R-DB-03** — RLS MUST be enabled on every tenant-scoped table. No table may be created or altered without RLS verification.

**R-DB-04** — Database migrations MUST be numbered sequentially in `database/migrations/` (e.g., `001_`, `002_`). MUST NOT modify a migration file after it has been applied to any environment.

**R-DB-05** — MUST create indexes on all `org_id` columns and any columns used in `WHERE` clauses of high-traffic queries. Composite index format: `(org_id, <secondary_column>)`.

**R-DB-06** — MUST NOT store plaintext secrets, tokens, or passwords in any database column. Use Supabase Vault or hashed storage.

**R-DB-07** — The `organizations` table MUST be created FIRST in all migration runs because all other tables have a foreign key dependency on it.

---

## 9. Smart Contract Rules

**R-SC-01** — MUST deploy to testnet and run all tests before any mainnet deployment. MUST NOT skip the testnet verification step.

**R-SC-02** — `GreenTokenFactory.deployForOrg()` MUST be `onlyOwner`. MUST NOT allow any external account to deploy org contracts.

**R-SC-03** — All minting and burning functions MUST check the caller's role before executing. MUST NOT allow arbitrary addresses to mint tokens.

**R-SC-04** — Contract addresses MUST be stored in the `organizations.contract_address` database column. MUST NOT hardcode contract addresses in frontend or backend code.

**R-SC-05** — MUST emit events for every state-changing operation (mint, burn, transfer, verify). These events are required for the analytics pipeline.

**R-SC-06** — MUST NOT deploy a new mainnet contract without completing the security audit checklist in `implementation/qa_security_audit_check.md`.

---

## 10. Security Rules

**R-SEC-01** — MUST NEVER expose secret keys, wallet private keys, or API keys in frontend code, git commits, or log files.

**R-SEC-02** — ALL environment variables MUST be stored in `.env.local` (never committed to git). The `.gitignore` MUST include `.env.local`.

**R-SEC-03** — MUST sanitize and validate all user inputs on both frontend (Zod) and backend before processing.

**R-SEC-04** — MUST NOT expose raw error stack traces to API consumers. Backend errors MUST return a sanitized `message` string only.

**R-SEC-05** — Authentication tokens MUST expire. Access tokens: 1 hour. Refresh tokens: follow Supabase defaults.

**R-SEC-06** — MUST use HTTPS for all API calls. MUST NOT make API calls over HTTP in any environment.

**R-SEC-07** — Super admin sessions MUST timeout after 1 hour of inactivity.

---

## 11. Accessibility Rules

**R-A11Y-01** — ALL interactive elements (buttons, links, inputs, selects) MUST be keyboard-navigable and MUST have visible focus styles.

**R-A11Y-02** — ALL images MUST have `alt` text that describes their content or purpose. Decorative images MUST use `alt=""` AND `role="presentation"`.

**R-A11Y-03** — ALL form inputs MUST have an associated `<label>` element using `htmlFor` and matching `id`. MUST NOT use `placeholder` as the only label.

**R-A11Y-04** — Color MUST NOT be the only means of conveying information (e.g., red border alone for errors — MUST also show an icon and text message).

**R-A11Y-05** — WCAG AA contrast ratios MUST be met for all text:
- Normal text: 4.5:1 minimum
- Large text (18px+ bold or 24px+): 3:1 minimum
- **MUST use `text-white` on `bg-primary-600` or darker only — never on `bg-primary-500`**

**R-A11Y-06** — Modals MUST trap focus when open. MUST return focus to the trigger element when closed.

**R-A11Y-07** — Dynamic content updates MUST use `role="alert"` (for errors/urgent notices) or `role="status"` (for non-urgent updates) for screen reader announcements.

**R-A11Y-08** — Data tables MUST use `<th scope="col">` for column headers and `<caption>` for screen-reader-only table descriptions.

**R-A11Y-09** — Touch targets MUST be at minimum 44×44px on mobile. Use `min-w-[44px] min-h-[44px]` where needed.

**R-A11Y-10** — All FAQ accordions and expandable sections MUST use `<details>/<summary>` native elements OR implement full ARIA `role="region"` + `aria-expanded` patterns.

---

## 12. Folder Structure Rules *(PENDING CONFIRMATION)*

> ⚠️ **These rules are PROVISIONAL.** The full folder structure is still being confirmed by the project owner. Do not start creating files until structure is locked.

**R-FS-01 (PROVISIONAL)** — All production source code MUST live inside a `frontend/` or `src/` directory. MUST NOT place page or component files at the project root.

**R-FS-02 (PROVISIONAL)** — All project images MUST be organized under `assets/image/` with the sub-folder structure defined in `assets/image/sidebar/sidebar_all_pages_guide.md` and `banner/banner_guide.md`.

**R-FS-03 (PROVISIONAL)** — Page-specific hero and banner images MUST live under `assets/image/pages/{page-name}/`. MUST NOT be placed in root-level page folders.

**R-FS-04 (PROVISIONAL)** — Documentation files MUST remain in their current organized folders (`architecture/`, `saas/`, `implementation/`, `foundation/`, `ux_ui/`). MUST NOT be mixed with source code.

**R-FS-05 (PROVISIONAL)** — The `mockup/` folder is read-only reference. MUST NOT be imported or referenced in production code.

**R-FS-06** — *(Will be finalized when folder structure confirmation is complete.)*

---

## Rule Enforcement Summary

| Category | Rules | Enforced By |
|---|---|---|
| Design tokens | R-COLOR-01 to R-SHADOW-03 | ESLint + Code review |
| Components | R-COMP-01 to R-COMP-08 | Code review |
| Images | R-IMG-01 to R-IMG-10 | Code review + asset audit |
| File naming | R-NAME-01 to R-NAME-05 | ESLint + Code review |
| Frontend code | R-FE-01 to R-FE-12 | ESLint + TypeScript compiler |
| API | R-API-01 to R-API-07 | Backend tests + Code review |
| SaaS / Multi-tenant | R-SAAS-01 to R-SAAS-10 | Integration tests + RLS audit |
| Database | R-DB-01 to R-DB-07 | Migration review |
| Smart contracts | R-SC-01 to R-SC-06 | Audit checklist |
| Security | R-SEC-01 to R-SEC-07 | Security audit |
| Accessibility | R-A11Y-01 to R-A11Y-10 | Accessibility checklist |
| Folder structure | R-FS-01 to R-FS-06 | **PENDING CONFIRMATION** |

---

*Last updated: 2026-06-03*  
*Folder structure rules will be locked in a separate update once confirmed by project owner.*
