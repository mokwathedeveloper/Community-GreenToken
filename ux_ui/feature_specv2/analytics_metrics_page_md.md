# Community GreenToken Analytics/Impact Metrics Page MD

This markdown provides **implementation instructions** for the Analytics/Impact Metrics Page of the Community GreenToken web application.

---

## 1. Components
- `MetricCard` – Displays key metrics such as total tokens, donations, and actions.
- `TrendChart` – Line or area chart to show trends over time.
- `PieChart` – Visualizes distribution of tokens, donations, or actions.
- `FilterDropdown` – Allows filtering metrics by time range or categories.

## 2. States
- **Loading:** Placeholder cards or skeleton loaders until data is available.
- **Hover:** Highlight charts or metric cards on mouse hover.
- **Drill-down:** Enable users to explore detailed breakdowns on click.

## 3. Data
- Community-wide tokens distributed.
- Donations allocated to projects.
- Count of verified actions.
- Optional: time-series or category-based data for charts.

## 4. Primary Route
- `/analytics`
- Accessible from the dashboard navigation and main menu.

## 5. Key Interactions
1. Filters update charts and metric cards dynamically.
2. Hovering over charts or cards shows tooltips with detailed data.
3. Drill-down allows deeper inspection of community contributions and trends.
4. Metrics update in real-time to reflect current data.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ MetricCard.jsx
│  ├─ TrendChart.jsx
│  ├─ PieChart.jsx
│  └─ FilterDropdown.jsx
├─ pages/
│  └─ analytics.jsx
├─ styles/
│  └─ analytics.css (optional for page-specific styling)
└─ data/
   └─ mockAnalyticsData.js (optional for demo purposes)
```

## 7. UX/UI Notes
- Ensure **cards and charts follow grid layouts** and are responsive.
- Tooltip content should be clear and concise.
- FilterDropdown should be easy to use and consistent with design system.
- Maintain **alignment with `design_system.md`** for typography, colors, and spacing.
- Real-time data updates should animate smoothly without jarring UI jumps.

## 8. Accessibility
- Use semantic HTML for metric cards and charts.
- ARIA roles for interactive chart elements and dropdowns.
- Keyboard navigation for filter selection and drill-down interactions.
- Ensure sufficient color contrast and readable labels on charts.

## 9. Mandatory Enhancements
- Animate charts and metric cards on updates.
- Lazy load chart components for performance optimization.
- Include tooltips for detailed metric explanations.
- Integrate AI/Analytics API for real-time metrics and impact calculations.

This MD file serves as a **developer blueprint** for implementing the Analytics/Impact Metrics Page, ensuring proper states, interactions, accessibility, and adherence to Community GreenToken UX/UI guidelines.