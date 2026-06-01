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