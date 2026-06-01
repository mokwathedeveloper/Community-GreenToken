# Community GreenToken Dashboard Page MD

This markdown provides instructions for implementing the Dashboard Page of the Community GreenToken web application.

---

## 1. Components
- `TokenBalanceCard` – Displays user's current token balance.
- `LeaderboardCard` – Shows top users and rankings.
- `AnalyticsChart` – Visualizes AI/Analytics metrics.
- `DonationProgress` – Displays progress of donations.

## 2. States
- **Real-time updates:** Reflect new token balances and leaderboard changes.
- **Hover:** Interactive visual feedback.
- **Focus:** Keyboard navigation focus states.

## 3. Data
- User tokens, leaderboard rankings, and AI metrics.
- Donation contributions per project.

## 4. Primary Route
- `/dashboard`
- Accessible from navigation menu and main feature CTA.

## 5. Key Interactions
1. Dashboard displays **real-time metrics**.
2. Users can drill-down into token balances or analytics charts.
3. Filters allow viewing specific time ranges or action types.
4. Hover states provide additional context or details.
5. Focus states enable full keyboard navigation.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ TokenBalanceCard.jsx
│  ├─ LeaderboardCard.jsx
│  ├─ AnalyticsChart.jsx
│  └─ DonationProgress.jsx
├─ pages/
│  └─ dashboard.jsx
├─ styles/
│  └─ dashboard.css (optional for page-specific styling)
└─ data/
   └─ mockDashboardData.js (optional for demo purposes)
```

## 7. UX/UI Notes
- Ensure **cards are responsive** and follow grid layout.
- Maintain **design consistency** with color palette, typography, and spacing from `design_system.md`.
- Charts should update **in real-time** without reloading the page.
- Hover and focus states must be visible and accessible.
- Dashboard should support **desktop, tablet, and mobile** breakpoints.

## 8. Accessibility
- Semantic HTML for cards, tables, and charts.
- ARIA labels for interactive elements.
- Keyboard navigation for all filters and drill-down options.
- Ensure color contrast meets WCAG 2.1 standards.

## 9. Optional Enhancements
- Animate token balance and leaderboard changes smoothly.
- Integrate AI/Analytics API for additional insights.
- Include tooltip explanations on charts for more detailed context.
- Lazy load charts to improve initial page performance.

This MD file serves as a **developer blueprint** for implementing the Dashboard Page with all required components, states, and UX/UI guidelines for Community GreenToken.