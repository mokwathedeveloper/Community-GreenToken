# Community GreenToken Integration Test Plan

This document outlines a **professional integration testing plan** for the Community GreenToken web application, covering interactions between frontend, backend, database, smart contracts, API response validation, performance testing, and AI/analytics integration.

---

## 1. Scope of Integration Testing
- Test interactions between **frontend components** and **backend API routes**.
- Validate **database updates** in Supabase after frontend or smart contract operations.
- Verify **smart contract interactions** (GreenToken, ActionRegistry, RewardManager) from frontend and backend.
- Ensure **AI/Analytics API integration** returns correct metrics.

## 2. Data Flow and API Response Validation
- Verify all API endpoints return correct **status codes, response formats, and error messages**.
- Test full user workflows:
  1. Action submission → Backend validation → Smart contract verification → Database update → Frontend dashboard update.
  2. Token redemption → Smart contract burn → Database update → Leaderboard refresh.
  3. Donation allocation → Backend logging → Dashboard update → Analytics processing.
- Ensure **real-time updates** are correctly reflected in frontend components.

## 3. Performance and Load Testing Strategy
- Simulate multiple concurrent users submitting actions and redeeming tokens.
- Measure API latency and response times under load.
- Test Supabase database performance for read/write operations.
- Ensure smart contract calls on testnet handle multiple transactions reliably.
- Optimize caching and state management to reduce bottlenecks.

## 4. AI/Analytics API Integration Testing
- Validate that all user actions and donations are captured and correctly sent to AI/Analytics APIs.
- Ensure analytics metrics (token distribution, leaderboard rankings, community impact) are accurate.
- Verify frontend dashboards correctly render analytics insights.
- Test real-time updates and error handling for API failures.

## 5. Tools and Frameworks
- **Frontend Testing:** React Testing Library, Cypress, or Playwright for E2E.
- **Backend Testing:** Jest or Mocha/Chai for API validation.
- **Smart Contract Testing:** Soroban SDK testing tools or Truffle/Hardhat.
- **Performance Testing:** Locust, JMeter, or custom scripts.
- **Monitoring:** Logflare, Sentry, or Supabase logs.

This integration test plan ensures that Community GreenToken is **fully tested across all layers**, providing reliable and hackathon-ready functionality with accurate analytics and seamless smart contract interactions.

---

## SaaS Extension — Multi-Tenant Integration Tests

### 6. Tenant Isolation Tests

```typescript
// test: org A cannot read org B's actions
it('should not return cross-tenant actions', async () => {
  const orgA = await createTestOrg();
  const orgB = await createTestOrg();
  await createAction({ orgId: orgA.id, userId: orgA.user.id });

  const res = await request(app)
    .get('/api/actions')
    .set('Authorization', `Bearer ${orgB.jwt}`);   // orgB JWT

  expect(res.body.data).toHaveLength(0);           // orgB sees nothing from orgA
});
```

### 7. Billing Webhook Tests

```typescript
// test: Stripe invoice.paid upgrades org plan
it('should upgrade org to pro on invoice.paid', async () => {
  const org = await createTestOrg({ plan: 'free' });
  await request(app)
    .post('/api/billing/webhook')
    .set('stripe-signature', mockStripeSignature)
    .send(mockInvoicePaidEvent({ orgId: org.id, priceId: PRO_PRICE_ID }));

  const updated = await getOrg(org.id);
  expect(updated.plan).toBe('pro');
  expect(updated.subscription_status).toBe('active');
});
```

### 8. Invite Flow Tests

```typescript
// test: invite token creates membership on accept
it('should join org via invite link', async () => {
  const org   = await createTestOrg();
  const invite = await createInvite({ orgId: org.id, role: 'member' });
  const newUser = await createTestUser();

  await request(app)
    .post(`/api/invites/${invite.token}/accept`)
    .set('Authorization', `Bearer ${newUser.jwt}`);

  const membership = await getOrgMember({ orgId: org.id, userId: newUser.id });
  expect(membership.role).toBe('member');
});
```

### 9. Plan Gate Tests

```typescript
// test: free plan blocked from analytics
it('should return 403 for free plan analytics request', async () => {
  const org = await createTestOrg({ plan: 'free' });
  const res = await request(app)
    .get('/api/analytics/overview')
    .set('Authorization', `Bearer ${org.jwt}`);

  expect(res.status).toBe(403);
  expect(res.body.error.code).toBe('PLAN_LIMIT_EXCEEDED');
});
```