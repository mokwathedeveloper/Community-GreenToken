# Community GreenToken Deployment Plan

This document outlines a professional **deployment plan** for the Community GreenToken web application, including the deployment pipeline, hosting strategy, CI/CD setup, and management of environment variables and secrets.

---

## 1. Deployment Pipeline
1. **Development Branch:** Developers commit features and bug fixes to `dev` branch.
2. **Continuous Integration:** Automated tests run on push to `dev` using GitHub Actions or Vercel CI.
3. **Staging Environment:** Successful builds deploy automatically to a staging environment for QA.
4. **Main Branch:** Merges to `main` trigger production deployment after passing tests and approval.
5. **Continuous Deployment:** Vercel automatically deploys the latest `main` branch to production.

## 2. Hosting Strategy
- **Platform:** Vercel for serverless hosting.
- **Frontend:** Next.js pages served globally with CDN.
- **Backend API Routes:** Serverless functions via Vercel.
- **SSL/TLS:** Automatic HTTPS provided by Vercel.
- **Custom Domain:** Optional, configured in Vercel dashboard.

## 3. CI/CD Setup
- **Repository:** GitHub or GitLab.
- **Continuous Integration:**
  - Run linting, unit tests, and integration tests on push.
  - Automated build process for Next.js application.
- **Continuous Deployment:**
  - Automatic deployment to staging on `dev` branch.
  - Automatic deployment to production on `main` branch.
  - Preview URLs generated for each pull request.
- **Monitoring:** Integration with Vercel analytics for deployment status and performance.

## 4. Environment Variables and Secrets Management
- **Supabase:** Project URL and Anonymous Key stored securely as environment variables in Vercel.
- **Smart Contracts:** Contract addresses, admin keys, and wallet credentials stored securely.
- **API Keys:** AI/Analytics API keys stored in Vercel environment variables.
- **Access Control:** Only authorized team members can modify environment variables.
- **Secrets Rotation:** Regularly rotate keys and tokens to maintain security.

This deployment plan ensures a **secure, automated, and scalable deployment process** for Community GreenToken, supporting hackathon MVP delivery and production-ready standards.

---

## SaaS Extension — Multi-Tenant Deployment

> **Full SaaS deployment guide:** `saas/saas_deployment_plan.md`

### Additional Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx

# Smart Contract Factory
FACTORY_CONTRACT_ADDRESS=0xxxx
SHARED_CONTRACT_ADDRESS=0xxxx
PLATFORM_WALLET_PRIVATE_KEY=0xxxx

# App domain (for subdomain routing)
NEXT_PUBLIC_APP_DOMAIN=greentoken.app
```

### Wildcard Subdomain Setup

Add to DNS: `CNAME * cname.vercel-dns.com` (wildcard for org subdomains).  
Add to Vercel project: custom domain `*.greentoken.app`.

### Stripe Webhook Registration

```
Dashboard → Developers → Webhooks → Add endpoint:
  URL: https://greentoken.app/api/billing/webhook
  Events: invoice.paid, customer.subscription.updated,
          customer.subscription.deleted, invoice.payment_failed
```

### New Deployment Steps

1. Run Supabase migrations (all 14 migration files in `database/migrations/`)
2. Deploy factory + shared smart contracts to target network
3. Seed `plan_limits` table with Free/Starter/Pro/Enterprise data
4. Configure Stripe products and copy Price IDs to env vars
5. Register Stripe webhook endpoint
6. Configure wildcard DNS and Vercel custom domain
7. Deploy to Vercel (`git push origin main`)
8. Verify with test org creation at `greentoken.app/org/setup`
