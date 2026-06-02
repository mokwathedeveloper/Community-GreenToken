# Community GreenToken Error Logging and Monitoring

This document outlines **error logging, monitoring, and debugging procedures** for the Community GreenToken web application to ensure reliability, quick issue resolution, and system observability.

---

## 1. Logging Mechanisms
- **Serverless Logging:** Use Vercel logs for API route calls and serverless function execution.
- **Database Logging:** Log important actions and events in Supabase, including token minting, redemptions, and donations.
- **Frontend Logging:** Capture errors and warnings in the browser console and optionally send to a monitoring service.
- **Centralized Logging Service:** Optional integration with services like Logflare or Sentry.
- **Log Levels:** Implement INFO, WARNING, ERROR, and DEBUG levels for proper categorization.

## 2. Error Handling & Notifications
- **API Responses:** Return structured error responses with HTTP status codes (400, 401, 403, 404, 500).
- **User Feedback:** Display friendly error messages on frontend for failed actions.
- **Admin Notifications:** Send email or Slack notifications for critical backend or smart contract errors.
- **Retry Mechanisms:** Automatic retries for transient errors in backend processes.

## 3. Monitoring Dashboards
- **Vercel Dashboard:** Track API route performance, build status, and uptime.
- **Supabase Dashboard:** Monitor database performance, query statistics, and failed operations.
- **Custom Analytics Dashboard:** Display key metrics such as token distribution, action submissions, leaderboard updates, and donations.
- **AI/Analytics Integration:** Monitor trends, anomalies, and community engagement metrics in real time.

## 4. Debugging Procedures and Alerts
- **Error Tracking:** Use Sentry or similar tools to capture frontend/backend exceptions.
- **Debugging Workflow:** Replicate issue using staging data → Inspect logs → Identify root cause → Fix code → Deploy hotfix.
- **Automated Alerts:** Configure alerts for downtime, high error rates, or failed smart contract interactions.
- **Documentation:** Maintain a troubleshooting guide and incident logs for recurring issues.

This error logging and monitoring plan ensures the Community GreenToken application is **robust, observable, and quickly recoverable**, supporting a seamless user experience and reliable token operations.

---

## SaaS Extension — Multi-Tenant Logging

### 5. Per-Tenant Error Scoping

All error logs must include `org_id` so incidents can be isolated per tenant:

```typescript
// Structured log format for every API error
logger.error({
  org_id:    req.jwt?.org_id,
  user_id:   req.jwt?.sub,
  route:     req.url,
  error:     err.message,
  code:      err.code,
  timestamp: new Date().toISOString(),
});
```

### 6. Stripe Webhook Error Handling

Failed billing events are stored in `billing_events` with `processed = false` and can be retried via super admin dashboard:

```typescript
await supabase.from('billing_events').insert({
  org_id, stripe_event_id: event.id, event_type: event.type,
  payload: event.data.object, processed: false,
});
// Super admin retries: POST /api/admin/billing-events/:id/reprocess
```

### 7. Tenant Isolation Alerts

Set up automated alerts when cross-tenant access is attempted:
```sql
-- Alert when RLS policy rejects a query (unexpected org_id mismatch)
-- Configure in Supabase Dashboard → Logs → Add alert on RLS violations
```

### 8. SaaS Monitoring Stack

| Tool | Purpose | Alert Threshold |
|---|---|---|
| Vercel Analytics | Page load, API latency | P95 > 2s |
| Supabase Dashboard | Query perf, RLS violations | Error rate > 1% |
| Stripe Dashboard | Failed payments, churn | Any `payment_failed` event |
| Sentry | Frontend/API exceptions | Any error in production |
| Uptime Robot | Endpoint availability | Downtime > 1 min |

### 9. Incident Response by Severity

| Level | Example | Response Time | Action |
|---|---|---|---|
| P0 | All orgs can't log in | < 15 min | Page on-call, hotfix deploy |
| P1 | Stripe webhooks failing | < 1 hour | Fix webhook handler, reprocess events |
| P2 | Analytics slow for 1 org | < 4 hours | Investigate query, add index |
| P3 | Minor UI bug | Next sprint | Log ticket, plan fix |