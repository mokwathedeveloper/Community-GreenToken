# Community GreenToken QA & Security Audit Checklist

This document provides a **professional quality assurance and security audit checklist** for the Community GreenToken web application, ensuring reliability, security, and hackathon readiness.

---

## 1. Quality Assurance & Testing Checklist
- **Frontend Testing:** Validate all UI components, forms, buttons, modals, and dashboards.
- **Backend Testing:** Test API routes, data validation, authentication, and authorization.
- **Smart Contract Testing:** Verify all token minting, action verification, and redemption functions on testnet.
- **Cross-Browser Testing:** Ensure compatibility across Chrome, Firefox, Safari, and Edge.
- **Responsive Design Testing:** Test mobile, tablet, and desktop layouts.

## 2. Unit Tests
- **Frontend:** Component rendering, event handling, form validation.
- **Backend:** API routes, serverless functions, database queries.
- **Smart Contracts:** Unit tests for GreenToken, ActionRegistry, RewardManager contracts.
- **Tools:** Jest, React Testing Library, Mocha/Chai, or Soroban SDK testing tools.

## 3. Integration & End-to-End Testing Plan
- **Integration Tests:** Test communication between frontend, backend, database, and smart contracts.
- **End-to-End Tests:** Simulate full user flows: action submission → token reward → redemption → dashboard update.
- **Automation:** Use Cypress or Playwright for automated E2E tests.
- **Data Consistency:** Validate Supabase updates after smart contract interactions.

## 4. Security Audit & Penetration Testing
- **Smart Contract Security:** Review contract code for reentrancy, overflow, access control, and token logic.
- **API Security:** Validate authentication, authorization, input validation, and rate limiting.
- **Database Security:** Ensure RLS, encryption at rest, and secure connection strings.
- **Penetration Testing:** Perform simulated attacks to check vulnerabilities in frontend, backend, and smart contracts.
- **Monitoring:** Set up alerts for suspicious activity and failed operations.
- **Documentation:** Maintain audit logs and security test results.

This QA and security audit checklist ensures that Community GreenToken is **robust, secure, and fully tested** for the hackathon demonstration and potential production deployment.

---

## SaaS Extension — Multi-Tenant Security Audit

### 5. Tenant Isolation Audit
- [ ] Every database query in API routes includes `.eq('org_id', orgId)` or relies on RLS
- [ ] RLS enabled and policies verified on: `actions`, `token_balances`, `redemption_logs`, `rewards`, `leaderboard_rankings`, `analytics_metrics`, `donation_records`, `invites`
- [ ] Cross-tenant test: confirm org B JWT cannot read org A's data
- [ ] Super admin route test: confirm non-superadmin role returns 403

### 6. Billing Security Audit
- [ ] Stripe webhook signature verified with `stripe.webhooks.constructEvent()` — reject unsigned events
- [ ] Stripe secret key not exposed in client-side code
- [ ] Plan downgrade immediately enforces feature limits — no grace period for data access
- [ ] `billing_events` table stores every webhook for audit trail
- [ ] Test: simulate failed payment → verify org marked `past_due`, feature access restricted

### 7. Invite Token Security Audit
- [ ] Invite tokens are 48-character hex strings (cryptographically random)
- [ ] Expired invite tokens return `410 Gone`
- [ ] Accepted invite tokens cannot be reused
- [ ] `uses_left` counter prevents mass account creation via single link

### 8. Smart Contract SaaS Audit
- [ ] Factory contract `deployForOrg` is `onlyOwner` (platform wallet only)
- [ ] Shared contract `mint` and `burn` require `ORG_ADMIN_ROLE`
- [ ] No org can call another org's contract functions
- [ ] Contract addresses stored in DB and verified before each call