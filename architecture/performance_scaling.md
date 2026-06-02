# Community GreenToken Performance & Scaling Plan

This document outlines **performance optimization and scaling strategies** for the Community GreenToken web application, including caching, database optimization, API response optimization, and scaling plans.

---

## 1. Caching Strategies
- **Frontend Caching:** Use React Query or SWR for caching API responses and data.
- **Serverless Caching:** Utilize edge caching for frequently accessed endpoints via Vercel or Supabase Edge Functions.
- **Token Data Caching:** Cache token balances, leaderboard data, and analytics metrics to reduce database calls.
- **Expiration Policies:** Implement TTL (Time-To-Live) for cached data to ensure freshness.

## 2. Database Optimization
- **Indexes:** Ensure all frequently queried columns (user_id, action_id, timestamp) are indexed.
- **Query Optimization:** Use efficient SELECT statements, avoid N+1 queries.
- **Row Level Security (RLS):** Optimize access policies to reduce unnecessary database checks.
- **Supabase Functions:** Offload heavy computation to serverless edge functions where possible.
- **Batch Updates:** Aggregate token and leaderboard updates in batches to reduce write operations.

## 3. API Response Optimization
- **Pagination:** Implement pagination for leaderboard and action logs.
- **Selective Data Fetching:** Return only necessary fields to reduce payload size.
- **Compression:** Enable gzip or Brotli compression for API responses.
- **Debouncing Requests:** Prevent excessive API calls for user input events.
- **Optimistic Updates:** Update frontend UI immediately, then confirm with backend asynchronously.

## 4. Scaling Plans
- **Horizontal Scaling:** Deploy multiple serverless instances for API routes via Vercel.
- **Vertical Scaling:** Upgrade Supabase plan or compute resources if database becomes a bottleneck.
- **Edge Functions:** Use Supabase edge functions to run code closer to users for low latency.
- **Load Balancing:** Automatically handled by Vercel for serverless functions.
- **Monitoring:** Integrate monitoring tools to detect performance issues early and auto-scale if needed.

This performance and scaling plan ensures that the Community GreenToken web application remains **responsive, scalable, and reliable** under high user load, supporting real-time token updates, leaderboard calculations, and analytics metrics.

---

## SaaS Extension — Multi-Tenant Performance

### 5. Per-Org Rate Limiting

Rate limits are enforced per `org_id` (not just per IP) to prevent one tenant from degrading performance for others:

```typescript
// rateLimit.ts — uses Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, '1 m') });
// Key: org_id:endpoint (not just IP)
const { success } = await ratelimit.limit(`${orgId}:actions`);
if (!success) return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: 60 });
```

| Plan | Requests/minute | Burst |
|---|---|---|
| Free | 30 | 10 |
| Starter | 120 | 30 |
| Pro | 600 | 100 |
| Enterprise | Custom | Custom |

### 6. Leaderboard Caching

Leaderboards are expensive to compute on every request. Cache them with a 60-second TTL:

```typescript
// Upstash Redis cache for leaderboard
const cacheKey = `leaderboard:${orgId}:${period}`;
const cached = await redis.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));

const data = await computeLeaderboard(orgId, period);
await redis.setex(cacheKey, 60, JSON.stringify(data));  // 60s TTL
return res.json(data);
```

### 7. Org Config Edge Cache

Org configuration (slug → org_id, plan, contract address) is fetched on every subdomain request. Cache it at the Vercel Edge with Vercel Edge Config:

```typescript
// middleware.ts — use Edge Config for sub-millisecond org lookup
import { get } from '@vercel/edge-config';
const orgConfig = await get(`org:${slug}`);  // < 1ms vs ~50ms DB query
```

### 8. Database Index Strategy for Multi-Tenancy

All high-traffic queries filter by `org_id` first. Composite indexes optimize these:

```sql
-- Composite indexes (org_id first for optimal selectivity)
CREATE INDEX idx_actions_org_date   ON actions(org_id, created_at DESC);
CREATE INDEX idx_leaderboard_org    ON leaderboard_rankings(org_id, rank);
CREATE INDEX idx_balances_org_user  ON token_balances(org_id, user_id);
CREATE INDEX idx_analytics_org_date ON analytics_metrics(org_id, metric_date DESC);
```

### 9. Scaling Thresholds

| Users | Infra | Est. Monthly Cost |
|---|---|---|
| 0–1,000 | Vercel Hobby + Supabase Free | ~$0 |
| 1,000–50,000 | Vercel Pro + Supabase Pro | ~$45 |
| 50,000–500,000 | Vercel Pro + Supabase Pro + Upstash Redis | ~$200 |
| 500,000+ | Vercel Enterprise + Supabase Enterprise + CDN | Custom |