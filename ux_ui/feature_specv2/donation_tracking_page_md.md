# Community GreenToken Donation Tracking Page MD

This markdown provides **implementation instructions** for the Donation Tracking Page of the Community GreenToken web application.

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Shared banner | `assets/image/banner.png` | 1916×821 | Top hero/banner section |
| Sidebar bottom (primary) | `assets/image/sidebar/sidebar_bottom_all_pages.png` | 1254×1254 | Sidebar bottom-left |
| Sidebar bottom (alt) | `assets/image/donationsidebar/green_earth_and_sprout.png` | 1254×1254 | Optional: donation-specific sidebar variant |
| Donation tracker icon | `assets/image/donationsidebar/donation_tracker_sidebar.png` | 320×320 | Optional: compact sidebar icon |

> See `assets/image/donationsidebar/sidebar_bottom_green_earth.md` for green earth sidebar component.  
> See `assets/image/sidebar/sidebar_all_pages_guide.md` for sidebar image guide.

## 1. Components
- `DonationCard` – Displays each project with token contribution progress.
- `ProjectProgressBar` – Visualizes cumulative contributions across projects.

## 2. States
- **Hover:** Highlight card or progress bar for focus.
- **Click:** Select or drill-down into project details.
- **Update:** Real-time update of token contributions and project progress.

## 3. Data
- User contributions per project.
- Project totals and cumulative progress.
- Optional: timestamps or last update metadata.

## 4. Primary Route
- `/donations`
- Accessible from dashboard navigation or CTA buttons.

## 5. Key Interactions
1. Users view token contributions per project.
2. Hovering provides visual feedback and additional info.
3. Clicking allows drilling into detailed project contribution.
4. Contributions update in real-time reflecting user actions or token redemptions.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ DonationCard.jsx
│  └─ ProjectProgressBar.jsx
├─ pages/
│  └─ donations.jsx
├─ styles/
│  └─ donations.css (optional for page-specific styling)
└─ data/
   └─ mockDonations.js (optional for demo purposes)
```

## 7. UX/UI Notes
- Maintain **consistent card and progress bar styling** according to `design_system.md`.
- Ensure responsive layout for mobile, tablet, and desktop.
- Provide hover and focus states for visual clarity.
- Align visual progress feedback with actual token contribution data.

## 8. Accessibility
- Use semantic HTML for cards and progress bars.
- ARIA labels for all interactive elements.
- Ensure keyboard navigation can access all project cards.
- Maintain sufficient color contrast and readable text.

## 9. Mandatory Enhancements
- Animate progress bar updates to reflect new contributions.
- Lazy load project images or icons if applicable.
- Include tooltips for additional project info or contribution details.
- Integrate AI/Analytics API to log user contributions and community impact metrics.

This MD file serves as a **developer blueprint** for implementing the Donation Tracking Page, ensuring proper states, interacti