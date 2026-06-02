# Community GreenToken Deployment Checklist

This document provides a **professional deployment checklist** for the Community GreenToken web application, covering Vercel and Supabase deployment, CI/CD verification, environment variables, and staging/production steps.

---

## 1. Deployment Instructions
- **Vercel:**
  - Connect GitHub repository to Vercel.
  - Configure project settings and build commands.
  - Deploy frontend and API routes.
- **Supabase:**
  - Ensure Supabase project URL and Anonymous Key are configured.
  - Apply RLS policies and authentication settings.
  - Deploy database schema and seed data.

## 2. CI/CD Pipeline Verification
- **Development Branch:** Ensure automated builds and tests run on push.
- **Staging Branch:** Verify deployment pipeline triggers staging environment.
- **Main/Production Branch:** Confirm automated deployment to production only after passing all checks.
- **Preview URLs:** Generated for each pull request to review changes.

## 3. Environment Variables and Secrets Configuration
- Store **Supabase Project URL and Anonymous Key** securely in Vercel environment variables.
- Store **Smart Contract addresses and admin keys** securely.
- Store **AI/Analytics API keys** securely.
- Restrict access to environment variables to authorized team members.
- Regularly rotate secrets and keys.

## 4. Staging and Production Deployment Steps
1. **Staging Deployment:**
   - Deploy backend and frontend to Vercel staging environment.
   - Connect to staging Supabase database.
   - Verify functionality: API routes, token minting, leaderboard, and dashboard.
2. **Testing:**
   - Run QA tests on staging environment.
   - Validate smart contract interactions on testnet.
   - Check frontend responsiveness and UI/UX.
3. **Production Deployment:**
   - Merge staging-tested changes into main branch.
   - Deploy to production environment.
   - Connect to production Supabase database and mainnet smart contracts.
   - Monitor logs, errors, and analytics metrics post-deployment.

This deployment checklist ensures **secure, reliable, and streamlined deployment** of Community GreenToken, enabling the team to confidently deliver a hackathon-ready and production-capable MVP.

---

## SaaS Extension — Additional Deployment Checklist

### 5. Stripe Setup
- [ ] Create Stripe account and verify identity
- [ ] Create products: **Starter** ($49/mo) and **Pro** ($199/mo) in Stripe Dashboard
- [ ] Copy Price IDs to `.env.local`: `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`
- [ ] Register webhook endpoint: `https://greentoken.app/api/billing/webhook`
- [ ] Select webhook events: `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Copy Webhook Secret to `.env.local`: `STRIPE_WEBHOOK_SECRET`
- [ ] Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel

### 6. Wildcard Subdomain (DNS)
- [ ] Add DNS record: `CNAME * cname.vercel-dns.com` (wildcard for `*.greentoken.app`)
- [ ] Add custom domain `greentoken.app` to Vercel project
- [ ] Add wildcard `*.greentoken.app` as additional domain in Vercel
- [ ] Verify SSL certificate auto-provisions for wildcard

### 7. Supabase SaaS Migrations (run in order)
```bash
npx supabase db push --db-url $SUPABASE_DB_URL
```
Migration files in `database/migrations/`:
- [ ] `001_create_organizations.sql`
- [ ] `002_create_org_members.sql`
- [ ] `003_create_invites.sql`
- [ ] `004_add_org_id_to_users.sql`
- [ ] `005_add_org_id_to_actions.sql`
- [ ] `006_add_org_id_to_token_balances.sql`
- [ ] `007_add_org_id_to_redemption_logs.sql`
- [ ] `008_create_rewards.sql`
- [ ] `009_add_org_id_to_leaderboard.sql`
- [ ] `010_add_org_id_to_analytics.sql`
- [ ] `011_add_org_id_to_donations.sql`
- [ ] `012_create_billing_events.sql`
- [ ] `013_enable_rls_policies.sql`
- [ ] `014_create_plan_limits.sql`

### 8. SaaS Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
FACTORY_CONTRACT_ADDRESS=0xxxx
SHARED_CONTRACT_ADDRESS=0xxxx
PLATFORM_WALLET_PRIVATE_KEY=0xxxx
NEXT_PUBLIC_APP_DOMAIN=greentoken.app
```

### 9. Post-Deployment SaaS Verification
- [ ] Create test organization at `greentoken.app/org/setup`
- [ ] Complete 5-step wizard — verify all steps save correctly
- [ ] Access test subdomain: `test-org.greentoken.app`
- [ ] Submit test action → verify token minted
- [ ] Complete Stripe test checkout (use card `4242 4242 4242 4242`)
- [ ] Confirm plan upgraded after webhook fires
- [ ] Login as super admin at `admin.greentoken.app`
- [ ] Confirm RLS: org A cannot see org B's actions