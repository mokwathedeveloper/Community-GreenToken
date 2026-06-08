<div align="center">

# Community GreenToken — Investor Brief

*The only production-ready SaaS platform that tokenizes verified eco-actions on Stellar*

**WebBridge Hackathon 2026 · Stellar Track**

</div>

---

## One-Sentence Pitch

Community GreenToken is a multi-tenant SaaS platform that lets any organisation launch a blockchain-verified sustainability reward program — where every token is minted only for a verified real-world eco-action, and every redemption burns the token on-chain.

---

## The Problem

**$8.9 trillion** is the estimated annual economic cost of climate inaction (Swiss Re, 2021). Yet the platforms that claim to incentivize sustainable behaviour share three fatal flaws:

1. **No verification** — tokens are minted for pledges and self-reports, not verified actions
2. **Wrong blockchain** — BSC and Ethereum fees ($0.10–$50 per tx) make micro-rewards economically unviable
3. **No infrastructure** — organisations that want to run sustainability programs have no out-of-the-box tooling; they must build everything from scratch

The result: existing "green token" projects either never shipped real contracts (EcoLedger), collapsed under fee economics (ZeLoop -99.8% token value), or serve an entirely different use case (TikCoin — creator economy).

---

## The Solution

Community GreenToken solves all three problems simultaneously:

| Problem | Solution |
|---|---|
| Unverified actions | Admin verification required; SHA-256 evidence hash stored on Stellar |
| Uneconomic fees | Stellar: $0.000001 per transaction — 10,000 actions cost $0.01 |
| No org infrastructure | Full SaaS: setup wizard, invites, action queue, rewards, analytics |

---

## Traction

Built for the WebBridge Hackathon Stellar Track:

| Metric | Value |
|---|---|
| Smart contracts deployed | 3 (live on Stellar Testnet) |
| App pages | 19 production-ready pages |
| API routes | 38 endpoints |
| Database tables | 13 (RLS-enabled) |
| Git commits | 60+ |
| TypeScript errors (strict mode) | 0 |
| Live demo | Available at deployment URL |

---

## Market Opportunity

| Segment | Size | GreenToken Angle |
|---|---|---|
| **Corporate ESG spend** | $35B globally (2025) | Companies need verifiable sustainability metrics for ESG reporting |
| **EdTech sustainability** | $4.5B globally | Schools want gamified eco programs for students |
| **Municipal rewards** | $2B+ in pilot programs | Cities want citizen engagement on recycling, transit, energy |
| **NGO donor reporting** | $500B NGO sector | Verifiable impact reporting for donors |

**TAM:** Any organisation that wants to incentivize and verify sustainable behaviour among its community — globally.

**Initial beachhead:** East African NGOs, schools, and municipalities (low existing infrastructure, high mobile wallet penetration, strong community culture around shared goals).

---

## Business Model

**B2B2C SaaS — Organisations pay, members earn free.**

| Plan | Price | Members | Target Customer |
|---|---|---|---|
| Starter | Free | 25 | Pilot programs, small NGOs |
| Pro | $49/month | 500 | Mid-size schools, companies |
| Enterprise | Custom | Unlimited | Municipalities, large corporations |

**Unit Economics (Pro plan):**
- Monthly revenue per org: $49
- Infrastructure cost per org: ~$3–$5/month (Supabase + Vercel)
- Gross margin: ~90%

**No token tax.** Revenue comes from SaaS subscriptions, not speculation on GTK price. This means our incentives are aligned with building real value — not inflating a token.

---

## Competitive Moat

| Advantage | Description |
|---|---|
| **First-mover on Stellar SaaS** | No competitor has built a full SaaS layer on Stellar for sustainability |
| **Verification integrity** | On-chain SHA-256 evidence hashing is technically superior to any competitor |
| **Fee impossibility** | At $0.000001 per tx, we can offer micro-rewards competitors literally cannot afford |
| **Full stack product** | 19 pages, 38 APIs, 3 contracts, billing — a working product, not a whitepaper |
| **Mission alignment** | Carbon-neutral blockchain + eco mission = authentic brand in a greenwashing-sceptical market |

---

## Technology

- **Blockchain:** Stellar Soroban (Rust smart contracts) — 3 contracts live on Testnet
- **Token:** GTK (SEP-41) — standard compatible with all Stellar wallets
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS — production-grade
- **Database:** Supabase (PostgreSQL, Auth, RLS) — enterprise-ready
- **Billing:** Stripe — proven SaaS payment infrastructure
- **Wallet:** Freighter — Stellar's native browser wallet

**Full architecture documentation:** [`architecture/`](architecture/) folder — 16 technical reference documents.

---

## Team

| Name | Role |
|---|---|
| RockieRaheem (Mokwa Moffat) | Full-stack + Blockchain + Product |

*Built solo during the WebBridge Hackathon. Seeking co-founders and collaborators post-hackathon.*

---

## Ask

**Immediate:** Hackathon prize recognition → accelerator acceptance → seed funding

**Seed round target:** To be determined post-hackathon

**Shipped (no additional capital required):**
- QR code event check-in, M-Pesa / bank withdrawal off-ramp, multi-currency (KES / USD) redemption, carbon credit NFT certificates on Stellar

**Use of funds:**
- 40% Engineering — mobile app (React Native), IoT integration, Stellar Mainnet deployment
- 25% Protocol — external smart contract audit, DAO governance, Mainnet launch
- 20% Go-to-Market — East Africa NGO partnerships, school pilots
- 15% Operations — legal entity, team, infrastructure

---

## Risks

| Risk | Mitigation |
|---|---|
| Regulatory (utility token classification) | GTK redeemable for specific goods only; not a security by design |
| Smart contract bug | Internal review complete; external audit planned pre-Mainnet |
| Org acquisition cost | Free Starter tier removes friction; NGO partnerships as acquisition channel |
| Stellar ecosystem adoption | Stellar has 10+ year track record; Soroban launched 2024 — timing is right |
| Competition from well-funded players | Speed and mission-alignment advantage; Stellar niche is defensible |

---

## Contact

**Mokwa Moffat (RockieRaheem)**
- GitHub: [@mokwathedeveloper](https://github.com/mokwathedeveloper)
- Email: [mokwaohuru@gmail.com](mailto:mokwaohuru@gmail.com)
- Live Demo: [community-greentoken.vercel.app](https://community-greentoken-fb803chx2-moracios-projects.vercel.app)
- Tokenomics: [/tokenomics page](https://community-greentoken-fb803chx2-moracios-projects.vercel.app/tokenomics)

---

*Community GreenToken · Investor Brief · June 2026*
