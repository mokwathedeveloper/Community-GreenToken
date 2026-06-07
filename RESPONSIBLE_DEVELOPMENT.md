# Responsible Development — Community GreenToken

Community GreenToken is built with security, privacy, sustainability, and ethical development as first-class concerns — not afterthoughts.

---

## 1. Security by Design

We follow OWASP Top 10 guidelines throughout the codebase:

- **Parameterized queries** — all Supabase operations use the type-safe query builder; no raw SQL strings
- **JWT validation on every protected route** — no endpoint trusts client-provided identity claims
- **Row-Level Security at the database level** — even if application code had a bug, RLS prevents cross-org data access
- **Rate limiting** — write-heavy and sensitive endpoints are rate-limited to prevent abuse
- **Admin keypair isolation** — the Stellar admin secret key never leaves the server; it is never included in client bundles, never logged, and never returned in API responses

Detailed controls: [`SECURITY.md`](SECURITY.md)

---

## 2. Data Privacy by Architecture

User data is controlled by users, not the platform:

- **Org-scoped isolation** — every piece of data is tied to an `org_id`. Members of Org A cannot see Org B's data, even with a valid session token.
- **Minimal collection** — we store display name, email (via Supabase Auth), action descriptions, and photo hashes. We do not collect IP addresses, device fingerprints, or behavioral tracking data.
- **Evidence hashing, not storage** — action photos are stored by their SHA-256 hash on-chain. The actual photo is not published to blockchain — only its fingerprint.
- **User-owned redemptions** — when users connect Freighter, redemption transactions are signed by their key. The platform cannot burn user GTK without user consent.
- **No advertising** — user data is never sold or shared with advertisers. Revenue comes from org subscriptions only.

---

## 3. Honest Metrics

All statistics displayed in the platform are derived from real Supabase data:

- Dashboard GTK balances come from `token_balances` table, synced from on-chain via Stellar RPC
- Leaderboard rankings are computed from actual verified actions
- Analytics charts show real action counts, not estimates or projections
- No hardcoded numbers, no fake activity, no placeholder data in production

When projections appear (roadmap, investor materials), they are explicitly labeled as estimates.

---

## 4. Environmental Alignment

We built on Stellar specifically because it is carbon-neutral:

- **Stellar Consensus Protocol (SCP)** uses federated Byzantine agreement — no proof-of-work mining
- **Zero energy waste** — no computational competition; validators reach consensus through cryptographic signatures
- **Verified carbon neutrality** — Stellar Development Foundation has disclosed network energy usage

It would be hypocritical to build a sustainability reward platform on an energy-intensive blockchain. Stellar aligns the technology with the mission.

---

## 5. Accessibility

All pages are built with web accessibility in mind:

- **Semantic HTML** — proper heading hierarchy, landmark regions (`<nav>`, `<main>`, `<section>`)
- **ARIA labels** — all icon-only buttons have `aria-label`; decorative images have `aria-hidden="true"`
- **Focus management** — `focus-visible:ring-2` on all interactive elements; visible keyboard focus indicators
- **Colour contrast** — primary green `#16a34a` on white meets WCAG AA (4.5:1) for body text
- **Alt text** — all images have descriptive alt text
- **Screen reader announcements** — `aria-live` regions for password strength and loading states

---

## 6. Anti-Greenwashing Design

The token economics are explicitly designed to prevent greenwashing:

- **GTK minted only for verified actions** — self-reporting is impossible; admin review is required
- **SHA-256 replay prevention** — the same photo cannot earn GTK twice; the contract rejects duplicate evidence hashes
- **Transparent on-chain history** — every mint, burn, and transfer is permanently visible on Stellar Expert
- **No speculative minting** — there is no ICO, no pre-sale, no airdrop. GTK only enters circulation through verified environmental work.
- **Deflationary redemption** — tokens are destroyed on use, meaning held tokens represent unredeemed verified actions — not speculation

---

## 7. AI and Automation Considerations

Community GreenToken does not currently use AI for action verification. Human admin review is required for every action. This is a deliberate choice:

- **Why no AI auto-approval:** AI image classification can be fooled by synthetic images, stock photos, or adversarial inputs. Human review adds friction that protects token integrity.
- **Future AI roadmap:** AI-assisted pre-screening (flagging obvious fakes before admin review) is planned for Phase 3. This would be a filter, not a replacement for human verification.
- **IoT integration (Phase 3):** Sensor-verified actions (smart recycling bins, energy meters) would bypass manual review — but only because the sensor itself is the trusted authority, not an AI inference.

---

## 8. Open Source Commitment

The full codebase is public on GitHub. We believe in:

- **Transparency** — anyone can audit what we've built
- **Reproducibility** — the `.env.example` documents every variable needed to run the full platform
- **Community contribution** — `CONTRIBUTORS.md` describes how to contribute
- **No vendor lock-in** — all infrastructure components (Supabase, Stripe, Stellar) can be swapped with alternatives that share the same interfaces

---

## 9. Right-Sized Infrastructure

We chose infrastructure tiers that match actual usage:

- **Vercel Hobby** — sufficient for hackathon and early-stage usage
- **Supabase Free** — covers the database needs for demo and initial users
- **Stellar Testnet** — zero-cost blockchain deployment for development
- **Stripe test mode** — billing flows work without real transactions

This prevents wasteful over-provisioning and keeps the cost of running the platform accessible to new contributors.

---

*Community GreenToken · Responsible Development Policy · June 2026*
