# Community GreenToken Dashboard CTA Bottom Banner MD

This markdown provides **developer instructions** for placing the "Small Actions. Big Impact." CTA banner at the bottom of the Dashboard page.

---

## 1. Folder Structure

Store the image in a dedicated folder for dashboard assets:

```
frontend/
└─ assets/
   └─ images/
      └─ dashboard/
         └─ cta_bottom_banner.png
```

**Notes:**
- The actual asset in the project repository is stored as `dashboard_cta_banner_nature.png`
  in `assets/image/dashboard/` (2172 × 724 px, RGB PNG).
  When copying to the frontend folder, rename it to `cta_bottom_banner.png` to match this spec.
- Use a transparent or gradient background to blend with the dashboard.
- Maintain consistent style with Community GreenToken branding.

---

## 2. Recommended Dimensions

- Width: 100% of the dashboard content area (responsive)
- Height: 80–120px
- Fits at the bottom of the dashboard without overlapping cards or content.

---

## 3. Starter Code (React/Next.js)

```jsx
// DashboardCTABanner.jsx
// Note: source file in repo is assets/image/dashboard/dashboard_cta_banner_nature.png
// Copy to frontend folder and rename to cta_bottom_banner.png
import ctaBanner from '../assets/images/dashboard/dashboard_cta_banner_nature.png';

export default function DashboardCTABanner() {
  return (
    <div className="w-full mt-8">
      <img
        src={ctaBanner}
        alt="Small Actions, Big Impact CTA"
        className="w-full h-auto object-cover rounded-lg"
      />
    </div>
  );
}
```

---

## 4. Usage in Dashboard Page

```jsx
import DashboardCTABanner from './DashboardCTABanner';

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Dashboard content above */}
      <DashboardCTABanner />
    </div>
  );
}
```

---

## 5. UX/UI Notes

- Maintain **padding/margin** so the banner doesn’t crowd existing dashboard cards.
- Use `object-cover` to preserve the image aspect ratio while filling width.
- Test responsiveness on desktop, tablet, and mobile.
- Include `alt` text for accessibility.
- Modular component allows easy updates or replacement.

---

This MD file serves as a **developer blueprint** for integrating the dashboard CTA bottom banner professionally and accessibly during development.
