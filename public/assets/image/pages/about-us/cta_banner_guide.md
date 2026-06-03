# About Us CTA Banner — GreenToken Implementation Guide

## File Name
about_us_cta_banner.png

## Suggested Folder
frontend/assets/images/pages/about_us/

## Recommended Dimensions
- Width: 1920px
- Height: 400px (full-width hero/banner)

## File Type
PNG (no text or frame; text will be added via code)

## Usage
- Place at the **bottom** of the About Us page (/about)
- Banner sits **full-width**, behind CTA buttons or text overlay added during frontend development.

## UX/UI Notes
- Background: eco-friendly, natural tones, soft gradients.
- Focus: organic, human-centered, collaborative.
- Ensure safe padding around edges for responsive scaling.
- Avoid including text in the image; add all text as HTML/CSS overlay.

## React/Next.js Starter Integration
```jsx
// components/AboutUsCTABanner.jsx
export default function AboutUsCTABanner() {
  return (
    <div className="w-full h-[400px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/about_us/about_us_cta_banner.png"
        alt="Community GreenToken collective action, sustainability and eco-friendly collaboration"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

## Folder Structure Example
frontend/
├─ assets/
│   └─ images/
│       └─ pages/
│           └─ about_us/
│               └─ about_us_cta_banner.png
├─ components/
│   └─ AboutUsCTABanner.jsx
├─ pages/
│   └─ about.jsx
└─ styles/
    └─ about.css

## Accessibility
- alt text describes the scene for screen readers.
- Ensure overlay text (CTA) meets WCAG 2.1 AA contrast.
