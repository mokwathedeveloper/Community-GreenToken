# Community GreenToken — SaaS Deployment Plan

## Infrastructure Overview

```
Users
  │
  ▼
Vercel (Edge Network)
  ├── *.greentoken.app  →  Wildcard subdomain routing
  ├── greentoken.app    →  Marketing / pricing / auth
  └── admin.greentoken.app  →  Super admin panel
  │
  ▼
Next.js App (Vercel Functions)
  ├── Frontend pages (SSR/SSG)
  └── API routes (serverless)
  │
  ├──► Supabase (Database + Auth + Storage)
  │       ├── PostgreSQL + RLS (multi-tenant data)
  │       ├── Supabase Auth (JWT with org_id claims)
  │       └── Supabase Storage (org logos, evidence images)
  │
  ├──► Stripe (Billing)
  │       ├── Subscriptions + Webhooks
  │       └── Customer Portal
  │
  └──► Blockchain RPC
          ├── Testnet: Stellar Testnet / Ethereum Sepolia
          └── Mainnet: Stellar / Ethereum / Polygon
```

---

## 1. Vercel Configuration

### Wildcard Subdomain Setup
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "(?<slug>[^.]+)\\.greentoken\\.app" }],
      "destination": "/:path*"
    }
  ]
}
```

### Environment Variables (Vercel Dashboard)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx

# Smart Contracts
PLATFORM_WALLET_PRIVATE_KEY=0xxxx
FACTORY_CONTRACT_ADDRESS=0xxxx
SHARED_CONTRACT_ADDRESS=0xxxx
CONTRACT_NETWORK=mainnet

# App
NEXT_PUBLIC_APP_DOMAIN=greentoken.app
NEXT_PUBLIC_APP_URL=https://greentoken.app
```

### Custom Domain DNS (Namecheap / Cloudflare)
```
Type  Name    Value
A     @       76.76.21.21   (Vercel)
CNAME www     cname.vercel-dns.com
CNAME *       cname.vercel-dns.com   ← Wildcard for org subdomains
```

---

## 2. Supabase Configuration

### Auth Settings
```
Site URL:           https://greentoken.app
Redirect URLs:      https://*.greentoken.app/auth/callback
JWT Expiry:         3600 (1 hour)
Refresh Token:      True
Custom JWT Hook:    custom_jwt_claims function (injects org_id + role)
```

### Storage Buckets
```
Bucket: org-logos      (public, 500KB limit, image/* only)
Bucket: action-evidence (private, 5MB limit, image/* + video/*)
```

### Supabase Edge Functions (optional — for complex operations)
```
functions/
├── deploy-contract/   Trigger factory deployment on org creation
├── trial-expiry/      Daily cron: downgrade expired free trials
└── leaderboard-update/ Hourly: recalculate org leaderboard rankings
```

---

## 3. Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in Vercel dashboard
- [ ] Supabase project URL + anon key confirmed
- [ ] Stripe products and price IDs created in Stripe Dashboard
- [ ] Stripe webhook endpoint registered: `https://greentoken.app/api/billing/webhook`
- [ ] Smart contracts deployed to chosen network; addresses in env vars
- [ ] Wildcard DNS record configured (`*.greentoken.app → Vercel`)
- [ ] Custom JWT claims function deployed in Supabase
- [ ] RLS policies enabled and tested on all tenant tables
- [ ] Seed data: at least one demo organization

### Deployment Steps
```bash
# 1. Push to GitHub main branch → Vercel auto-deploys
git push origin main

# 2. Run database migrations
npx supabase db push --db-url $SUPABASE_DB_URL

# 3. Verify deployment
curl https://greentoken.app/api/orgs/check-slug?slug=test
# Expected: { "available": true }

# 4. Test org subdomain
curl -H "Host: demo.greentoken.app" https://greentoken.app/api/auth/me
# Expected: 401 (unauthenticated, but routing works)

# 5. Test Stripe webhook
stripe listen --forward-to https://greentoken.app/api/billing/webhook
```

### Post-Deployment Verification
- [ ] Create test org at `greentoken.app/org/setup`
- [ ] Complete 5-step onboarding wizard
- [ ] Verify test org subdomain loads: `test-org.greentoken.app`
- [ ] Submit and verify a test action → confirm token minted
- [ ] Complete test Stripe checkout for Starter plan
- [ ] Confirm plan upgrade reflected in org dashboard
- [ ] Super admin login at `admin.greentoken.app`
- [ ] Verify RLS: confirm org A cannot see org B's data

---

## 4. Scaling Plan

| Users | Architecture | Cost |
|---|---|---|
| 0–1,000 members | Vercel Hobby + Supabase Free | $0/month |
| 1,000–50,000 members | Vercel Pro + Supabase Pro | ~$45/month |
| 50,000–500,000 members | Vercel Pro + Supabase Pro + Read Replicas | ~$200/month |
| 500,000+ members | Vercel Enterprise + Dedicated Supabase | Custom |

### Caching Strategy
- Leaderboard rankings: cache in Redis (Upstash) with 60-second TTL
- Analytics metrics: pre-computed nightly, stored in `analytics_metrics` table
- Org config: cached in Next.js middleware (Edge Config) for subdomain resolution

---

## 5. Monitoring

| Tool | Purpose |
|---|---|
| Vercel Analytics | Page performance, Core Web Vitals |
| Supabase Dashboard | Query performance, RLS audit logs |
| Stripe Dashboard | MRR, failed payments, churn |
| Sentry | Frontend + API error tracking |
| Uptime Robot | Endpoint availability monitoring |

---

## 6. Disaster Recovery

- **Database:** Supabase auto-backups (daily on Pro, PITR on Enterprise)
- **Smart contracts:** Deploy to testnet first; mainnet deployment requires 2/3 multisig
- **Billing:** Stripe handles payment retries automatically (Smart Retries)
- **Rollback:** Vercel instant rollback to previous deployment via dashboard
