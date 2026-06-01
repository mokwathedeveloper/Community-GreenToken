# Community GreenToken Landing Page MD

This markdown provides **implementation instructions** for the Landing Page of the Community GreenToken web application.

---

## 1. Components
- `Navbar` – Top navigation bar with logo and page links.
- `HeroCard` – Main hero section with headline, subheadline, and hero illustration.
- `FeatureHighlights` – Highlights key platform features.
- `CTAButton` – Primary call-to-action button.

## 2. States
- **Default:** Base visual state.
- **Hover:** Highlight interactive elements on mouse hover.
- **Focus:** Keyboard focus outline.
- **Active:** Visual feedback when elements are pressed or selected.

## 3. Data
- Static text for hero, features, and navigation.
- Optional analytics counters for user engagement metrics.

## 4. Primary Route
- `/` – Root URL.
- Accessible as the first page when users visit the site.

## 5. Key Interactions
1. Users can navigate through the Navbar.
2. CTAButton triggers navigation to Main Feature Page.
3. Scroll-triggered animations for FeatureHighlights.
4. Responsive adjustments for mobile, tablet, and desktop.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ Navbar.jsx
│  ├─ HeroCard.jsx
│  ├─ FeatureHighlights.jsx
│  └─ CTAButton.jsx
├─ pages/
│  └─ index.jsx
├─ styles/
│  └─ landing.css (optional page-specific styling)
└─ assets/
   └─ images/hero/ (hero illustration and related graphics)
```

## 7. UX/UI Notes
- Ensure **hero illustration** is prominent and supports branding.
- Maintain **spacing and typography** as defined in `design_system.md`.
- CTAButton should have clear hover, focus, and active states.
- FeatureHighlights should animate slightly on scroll to enhance engagement.
- HeroCard content should be **readable over the background** using overlays or gradients.

## 8. Accessibility
- Use semantic HTML elements for navigation and hero content.
- Ensure all interactive elements are keyboard-accessible.
- Provide descriptive `alt` text for hero illustrations.
- Ensure color contrast meets WCAG 2.1 standards.
- Maintain focus visibility for keyboard users.

## 9. Mandatory Enhancements
- HeroCard image should **lazy load** for performance.
- CTAButton interactions should be animated subtly.
- Include ARIA labels for navigation and hero actions.
- Ensure responsive layout across breakpoints (mobile, tablet, desktop).

This MD file serves as a **developer blueprint** for implementing the Landing Page, ensuring proper states, interactions, accessibility, and adherence to Community GreenToken UX/UI guidelines.