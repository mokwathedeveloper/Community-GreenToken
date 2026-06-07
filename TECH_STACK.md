# Community GreenToken — Technical Stack Reference

Full technical architecture, dependencies, and design rationale for the Community GreenToken platform.

---

## Architecture Overview

Community GreenToken is a four-layer platform:

```
Layer 4 — Presentation      Next.js 16 App Router · React 19 · Tailwind CSS 4
Layer 3 — Application       Next.js API Routes (38 endpoints) · Zod · Middleware chain
Layer 2 — Persistence       Supabase (PostgreSQL + Auth + Realtime) · Stripe
Layer 1 — Blockchain        Stellar Soroban · 3 Rust contracts · SEP-41 · Freighter
```

---

## Layer 1 — Blockchain

### Stellar Network

| Component | Detail |
|---|---|
| Network | Stellar Testnet (Mainnet: Phase 4) |
| Consensus | Stellar Consensus Protocol (SCP) — federated Byzantine agreement |
| Finality | ~5 seconds |
| Tx Fee | $0.000001 (100 stroops) |
| Carbon Status | Carbon-neutral — no mining |

### Soroban Smart Contracts (Rust)

| Contract | Language | SDK Version | Contract ID (Testnet) |
|---|---|---|---|
| GreenToken (GTK) | Rust | soroban-sdk 22 | `CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH` |
| ActionRegistry | Rust | soroban-sdk 22 | `CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO` |
| RewardManager | Rust | soroban-sdk 22 | `CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR` |

**Toolchain:**
```bash
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli --features opt
```

**Build:**
```bash
cd contracts
stellar contract build
# Output: target/wasm32-unknown-unknown/release/*.wasm
```

### Stellar JavaScript SDK

| Package | Version | Usage |
|---|---|---|
| `@stellar/stellar-sdk` | 13.1.0 | Soroban RPC client, transaction building, XDR encoding |
| `@stellar/freighter-api` | 3.0.0 | Browser wallet integration, transaction signing |

**Key patterns:**
```typescript
// lib/stellar/client.ts — Soroban RPC
const server = new SorobanRpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!);

// lib/stellar/contracts/green-token.ts — contract call
const result = await server.simulateTransaction(txBuilder.build());
if (SorobanRpc.Api.isSimulationSuccess(result)) {
  const assembled = StellarSdk.assembleTransaction(txBuilder.build(), result);
  assembled.sign(adminKeypair);
  await server.sendTransaction(assembled.build());
}
```

### Token Standard

| Standard | SEP-41 |
|---|---|
| Full name | Stellar Ecosystem Proposal 41 — Fungible Token Interface |
| Specification | [SEP-0041](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md) |
| Decimals | 7 (Stellar standard) |
| Compatibility | Any Stellar wallet, DEX, or integration that supports SEP-41 |

---

## Layer 2 — Persistence

### Supabase

| Component | Usage |
|---|---|
| **PostgreSQL** | Primary relational database — 13 tables |
| **Auth** | User registration, JWT sessions, OAuth providers |
| **Row-Level Security** | Per-user, per-org data isolation |
| **Realtime** | Dashboard live updates (token balance, action status) |
| **Storage** | Eco-action photo evidence |

**Client setup:**
```typescript
// lib/supabase/client.ts — browser (uses anon key)
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// lib/supabase/server.ts — server (uses service role key)
import { createServerClient } from "@supabase/ssr";
```

**Packages:**
- `@supabase/supabase-js` — 2.x
- `@supabase/ssr` — Latest
- `@supabase/auth-helpers-nextjs` — Latest

### Stripe

| Component | Usage |
|---|---|
| **Stripe Checkout** | SaaS plan purchase |
| **Customer Portal** | Plan changes, cancellation |
| **Webhooks** | `customer.subscription.created/updated/deleted` |
| **Price IDs** | Starter (free), Pro ($49/mo), Enterprise (custom) |

```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });
```

**Package:** `stripe` 17.7.0

---

## Layer 3 — Application

### Next.js API Routes

38 server-side API endpoints using Next.js Route Handlers.

**Middleware chain** (applied in order):
1. `proxy.ts` — Edge middleware: auth check, public route allowlist, org slug from subdomain
2. `lib/middleware/auth.ts` — JWT validation, user resolution
3. `lib/middleware/adminGuard.ts` — Role check (admin/owner/superadmin)
4. `lib/middleware/planGate.ts` — Subscription tier enforcement
5. `lib/middleware/rateLimiter.ts` — Per-endpoint rate limits

**Validation:** All inputs validated with Zod:
```typescript
// lib/validation/schemas.ts
export const submitActionSchema = z.object({
  action_type: z.number().int().min(0).max(9),
  description: z.string().min(10).max(500),
  org_id: z.string().uuid(),
});
```

**Key packages:**
- `zod` 3.24.4 — Schema validation
- `date-fns` 4.1.0 — Date formatting
- `@supabase/auth-helpers-nextjs` — Middleware session refresh

---

## Layer 4 — Presentation

### Framework

| Package | Version | Role |
|---|---|---|
| `next` | 16.2.7 | App Router, SSR, API Routes, Image optimization |
| `react` | 19.2.4 | UI rendering |
| `react-dom` | 19.2.4 | DOM renderer |
| `typescript` | 5.x | Type safety |

### Styling

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | 4.x | Utility-first CSS |
| `tailwindcss-animate` | Latest | CSS animations |
| `@tailwindcss/postcss` | 4.x | PostCSS integration |

**Design tokens** (`tailwind.config.ts`):
```typescript
primary: {
  50:  "#f0fdf4",
  100: "#dcfce7",
  500: "#22c55e",
  600: "#16a34a",  // primary brand green
  700: "#15803d",
}
```

**Typography:** Google Poppins (self-hosted via `next/font/google`)

### Icons

All icons are custom Material Design filled SVGs, implemented via a factory pattern — no external icon library dependency:

```typescript
// components/icons/index.tsx
function icon(paths: string) {
  return function Icon({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
        <path d={paths} />
      </svg>
    );
  };
}

export const MLeaf = icon("M17 8C8 10 5.9 16.17 3.82...");
// 40+ icons exported
```

**Why custom SVGs over Lucide/HeroIcons:** Zero bundle cost for unused icons; consistent Material Design aesthetic; no dependency version conflicts.

### Data Visualization

| Package | Version | Usage |
|---|---|---|
| `recharts` | 2.x | Analytics charts, token history, member growth |

### Utilities

| Package | Version | Usage |
|---|---|---|
| `clsx` | Latest | Conditional class names |
| `tailwind-merge` | Latest | Tailwind class merging |
| `zod` | 3.24.4 | Shared schema types |

---

## Testing

| Package | Version | Role |
|---|---|---|
| `jest` | 29.7.0 | Test runner |
| `jest-environment-jsdom` | Latest | Browser environment simulation |
| `ts-jest` | Latest | TypeScript Jest transform |
| `@testing-library/react` | Latest | React component testing |
| `@testing-library/jest-dom` | Latest | DOM matchers |

```bash
npm run test           # run all tests
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

---

## Development Tools

| Tool | Version | Purpose |
|---|---|---|
| `eslint` | 9.x | Code quality |
| `@typescript-eslint/*` | Latest | TypeScript ESLint rules |
| `prettier` | Latest | Code formatting |
| TypeScript strict mode | Enabled | Zero `any` types |

---

## Infrastructure

| Service | Tier | Purpose |
|---|---|---|
| **Vercel** | Hobby/Pro | Frontend hosting + Edge Functions |
| **Supabase** | Free/Pro | Database + Auth + Storage |
| **Stellar Testnet** | Free | Soroban contract hosting |
| **Stripe** | Pay-as-you-go | SaaS billing |

---

## Build & Deploy

```bash
# Development
npm run dev           # Next.js dev server → http://localhost:3000

# Production build
npm run build         # Type-check + compile
npm run start         # Start production server

# Type checking
npx tsc --noEmit      # Zero-error requirement

# Linting
npm run lint          # ESLint

# Smart contracts
cd contracts
stellar contract build
stellar contract deploy --network testnet --source $STELLAR_ADMIN_SECRET_KEY \
  --wasm target/wasm32-unknown-unknown/release/green_token.wasm
```

---

## Language Breakdown

| Language | Lines | % | Files |
|---|---|---|---|
| TypeScript | ~12,000 | 78% | 80+ .tsx/.ts files |
| Rust | ~1,500 | 10% | 3 Soroban contracts |
| SQL | ~800 | 5% | 23 migration files |
| CSS (Tailwind) | ~400 | 3% | globals.css + config |
| JSON/Config | ~400 | 3% | package.json, tsconfig, etc. |
| Shell | ~100 | 1% | Deploy scripts |

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| **Next.js App Router over Pages Router** | React Server Components reduce client bundle; native streaming |
| **Supabase over Firebase** | PostgreSQL relationships essential for multi-tenant RLS |
| **Stellar over EVM chains** | $0.000001 fees are a hard requirement for micro-reward economics |
| **Soroban (Rust) contracts** | Type safety and WASM performance over Solidity; Stellar-native |
| **Custom Material icons** | Zero bundle overhead; no external icon dependency |
| **Single UserProvider** | One Supabase auth subscription for the whole app — prevents 13x listener cascade |
| **Zod throughout** | Shared type safety between frontend forms and API validation |
| **Edge middleware auth** | Public routes served without auth overhead |

---

*Community GreenToken · Tech Stack Reference v1.0 · June 2026*
