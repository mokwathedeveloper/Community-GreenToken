# Community GreenToken AI/Analytics Integration

This document details the **AI and analytics integration** for the Community GreenToken web application, including APIs used, metrics tracked, integration flow, and reporting.

---

## 1. AI/Analytics APIs Used
- **OpenAI API:** For advanced analytics, predictions, and community engagement insights.
- **Custom Analytics API:** Collects, aggregates, and processes user activity and token data.
- **Supabase Edge Functions:** Serverless functions to pre-process data before analytics.

## 2. Metrics Tracked
- **User Actions:** Number and type of sustainable actions submitted.
- **Token Metrics:** Total tokens minted, redeemed, and transferred.
- **Leaderboard Metrics:** User rankings, participation rate, and engagement score.
- **Donation Tracking:** Tokens contributed to community projects.
- **Community Impact Metrics:** Aggregate environmental impact (e.g., trees planted, waste collected).

## 3. Integration Flow
1. **Data Collection:** Backend APIs log user actions, token updates, and donations to Supabase.
2. **Preprocessing:** Supabase Edge Functions clean and structure data for analytics.
3. **Analytics Processing:** Data sent to AI/analytics APIs for pattern detection, scoring, and trend analysis.
4. **Results Storage:** Analytics results stored in Supabase tables or dashboard-specific endpoints.
5. **Frontend Display:** Dashboards and visualizations rendered using React components.
6. **Feedback Loop:** Insights can inform gamification, recommendations, and rewards allocation.

## 4. Data Analysis & Reporting
- Generate **leaderboards and achievement dashboards**.
- Provide **visualizations** for token distribution and participation metrics.
- Track **community-wide environmental impact**.
- Generate **admin reports** for decision-making, sponsor reporting, and hackathon demo insights.
- Ensure **real-time updates** for frontend dashboards using SWR or React Query.

This AI/analytics integration ensures the Community GreenToken application has **mandatory real-time metrics, insights, and reporting**, supporting engagement, transparency, and measurable community impact.

---

## SaaS Extension — Org-Scoped Analytics

### 5. Multi-Tenant Analytics Scoping

All analytics queries are scoped to `org_id` — no cross-tenant data leaks:

```typescript
// analytics.js API route
const { org_id } = req.jwt;  // extracted from JWT

const metrics = await supabase
  .from('analytics_metrics')
  .select('*')
  .eq('org_id', org_id)          // ← always scoped
  .gte('metric_date', fromDate)
  .order('metric_date', { ascending: true });
```

### 6. Plan Gating

Analytics is a **Starter+ feature**. Free plan orgs are blocked:

```typescript
const { data: org } = await supabase.from('organizations').select('plan').eq('id', org_id).single();
if (org.plan === 'free') return res.status(403).json({ error: 'PLAN_LIMIT_EXCEEDED', upgrade_url: '/pricing' });
```

### 7. Platform-Wide Analytics (Super Admin)

Super admin has access to aggregate analytics across ALL orgs:

```typescript
// Only superadmin role can run cross-org queries
if (req.jwt.role !== 'superadmin') return res.status(403).end();

const platformStats = await supabase.rpc('get_platform_metrics');
// Returns: total_orgs, total_members, total_tokens_minted, total_actions, mrr
```

### 8. Key API Endpoints

| Endpoint | Plan | Description |
|---|---|---|
| `GET /api/analytics/overview` | Starter+ | Org KPIs: actions, tokens, members, CO₂ |
| `GET /api/analytics/actions` | Starter+ | Time-series action trends |
| `GET /api/analytics/tokens` | Starter+ | Token distribution + velocity |
| `GET /api/analytics/members` | Starter+ | Member growth + activity |
| `GET /api/admin/metrics` | superadmin | Platform-wide MRR, churn, orgs |

### 9. Nightly Aggregation Cron

To keep dashboard loads fast, analytics metrics are pre-aggregated nightly and cached in the `analytics_metrics` table:

```sql
-- Supabase scheduled function (runs at 00:00 UTC daily)
INSERT INTO analytics_metrics (org_id, metric_date, total_actions, tokens_minted, active_members)
SELECT org_id, CURRENT_DATE, COUNT(*), SUM(tokens_awarded), COUNT(DISTINCT user_id)
FROM actions
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY org_id
ON CONFLICT (org_id, metric_date) DO UPDATE SET
  total_actions = EXCLUDED.total_actions,
  tokens_minted = EXCLUDED.tokens_minted,
  active_members = EXCLUDED.active_members;
```