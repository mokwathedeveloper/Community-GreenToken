
# Org Admin Dashboard Hero Section — Starter Guide

## File Name
org_admin_hero.png

## Suggested Folder
```
frontend/
└─ assets/images/pages/org_admin/
```

## Recommended Dimensions
- **Width:** 1920px  
- **Height:** 800px (adjustable if responsive design requires cropping)

## File Type
PNG (transparent optional; soft gradient background preferred)

## Placement
- **Page:** `/admin` (Super Admin Dashboard)
- **Section:** Top of the dashboard, behind the “Welcome back, GreenFuture Org” greeting.
- The hero image visually anchors the left sidebar and top summary cards.

## UX/UI Notes
- Keep left-side space free for navigation and metrics cards.
- The right-side visual should include eco-friendly elements, human touch, and collaboration indicators (plants, light, hands, or dashboards).
- Background should have subtle sunlight, soft gradients, and depth to keep a professional and organic feel.
- Ensure responsive cropping: center key visual elements, avoid cutting hands or plants on mobile.

## Starter React/Next.js Integration
```javascript
// components/OrgAdminHero.jsx
export default function OrgAdminHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/org_admin/org_admin_hero.png"
        alt="Team and eco-dashboard with greenery in a sunlit environment"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

## Folder Structure for Page Integration
```
frontend/
├─ components/
│  ├─ OrgAdminHero.jsx
│  ├─ AdminStatCard.jsx
│  ├─ OrgTable.jsx
│  ├─ RevenueChart.jsx
│  └─ PlanDistributionChart.jsx
├─ pages/
│  └─ admin/
│      └─ index.jsx  // Import and use <OrgAdminHero /> here
└─ assets/
   └─ images/
      └─ pages/
         └─ org_admin/
             └─ org_admin_hero.png
```

## Usage Notes
- Place <OrgAdminHero /> at the top of `/admin/index.jsx`.
- Cards like `PlatformMetricCard`, `PlanUsageBar`, and `ActionVerificationQueue` overlay on or appear below the hero section.
- Lazy-load the image to improve page performance.
- Hero image should **not contain text**, all titles and buttons are added in JSX/HTML.
