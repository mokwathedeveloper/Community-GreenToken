# Community GreenToken Impact Page MD

This markdown provides **implementation instructions** for the public Impact page of the Community GreenToken web application.

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/impact/impact_hero.png` | 2077×757 | Top hero section background |
| Ecosystem diagram | `assets/image/architecture/blockchain_ecosystem_diagram.png` | 1448×1086 | Token-to-impact diagram section |
| Shared banner (fallback) | `assets/image/banner.png` | 1916×821 | Optional secondary banner |

> Impact page has no sidebar (public page).  
> See `impact/impact_page_hero_LandingPage_Starter.md` for hero + banner starter code.

## 1. Components
- `ImpactHero` – Full-width banner with the headline total community impact figure.
- `ImpactStatCard` – Individual stat cards (total actions, tokens minted, CO₂ offset, trees planted).
- `CommunityImpactChart` – Aggregated time-series chart of platform-wide actions.
- `ProjectHighlight` – Featured eco projects receiving donations with progress bars.
- `ParticipationMap` – (Optional) Geographic visualization of participating communities.

## 2. States
- **Loading:** Skeleton cards while fetching live stats from the analytics API.
- **Loaded:** Animated number count-up on `ImpactStatCard` values.
- **Hover:** `ProjectHighlight` cards show donation details on hover.
- **Error:** Fallback static message if API call fails.

## 3. Data
- Aggregate platform statistics from the Analytics/AI API (`/api/analytics`).
- Project donation totals from Supabase `donation_records` table.
- Time-series action data for `CommunityImpactChart`.

## 4. Primary Route
- `/impact`
- Accessible from the main navigation and the Landing Page CTA.
- This page is **publicly accessible** (no authentication required).

## 5. Key Interactions
1. `ImpactStatCard` numbers animate (count-up) when the section enters the viewport.
2. `CommunityImpactChart` supports time-range filtering (7 days, 30 days, all time).
3. `ProjectHighlight` progress bars fill dynamically based on donation totals vs goals.
4. Optional share button allows users to share community impact on social media.

## 6. Key Metrics to Display
- **Total Sustainable Actions Verified** — cumulative count
- **GreenTokens Minted** — total tokens issued
- **Active Community Members** — unique participants
- **CO₂ Equivalent Offset** — estimated environmental impact
- **Donation Tokens Allocated** — tokens redirected to eco projects
- **Top Eco Projects Funded** — ranked by token contributions

## 7. Folder Structure
```
frontend/
├─ components/
│  ├─ ImpactHero.jsx
│  ├─ ImpactStatCard.jsx
│  ├─ CommunityImpactChart.jsx
│  └─ ProjectHighlight.jsx
├─ pages/
│  └─ impact.jsx
├─ styles/
│  └─ impact.css (optional)
└─ data/
   └─ mockImpactData.js  (fallback/demo data)
```

## 8. UX/UI Notes
- Use the accent color (`#F1C40F`) for highlight numbers to convey positive momentum.
- `ImpactHero` background can use the existing hero illustration or the blockchain ecosystem diagram.
- Keep data visualizations simple and clearly labeled — this page is for general public, not power users.
- Mobile layout: single-column stat cards, vertically stacked chart and highlights.

## 9. Accessibility
- All charts must have a text-based data table fallback (`<table>` with `aria-hidden` on the visual chart).
- `ImpactStatCard` count-up animations must pause on `prefers-reduced-motion`.
- Clear ARIA labels on all chart elements.
- WCAG 2.1 AA contrast across all stat numbers and background combinations.

## 10. Mandatory Enhancements
- Real-time data polling (30-second interval) for live stats during demo.
- Social share button with pre-composed text ("Community GreenToken has offset X kg CO₂!").
- Integrate with the AI/Analytics API for trend analysis and projected future impact.
- Lazy load `CommunityImpactChart` to keep initial page load fast.

This MD file serves as a **developer blueprint** for implementing the Impact page, ensuring transparency, engagement, and public accountability aligned with Community GreenToken's mission.
