# Community GreenToken Landing Page Hero Image

This markdown provides instructions for implementing the hero section illustration on the Landing Page.

---

## 1. Image Details
- **File:** `hero_eco_illustration.png`
  - Stored at: `assets/image/herosection/hero_eco_illustration.png`
  - Dimensions: 1402 × 1122 px, RGB PNG
- **Role:** Hero illustration for the Landing Page.
- **Positioning:** Primary visual element behind the HeroCard component.
- **Visual Focus:** Community engagement, sustainability, blockchain/eco overlay.

## 2. Implementation Instructions

### Frontend Placement
- Place image in `frontend/assets/images/herosection/`.
- Import into `HeroCard.jsx`:
```jsx
import heroImage from '../assets/images/herosection/hero_eco_illustration.png';
```
- Use as a background image or a full-width `img` inside the HeroCard:
```jsx
<section className="relative w-full h-[600px] flex items-center justify-start bg-bg-page overflow-hidden">
  <img src={heroImage} alt="Community GreenToken hero illustration" className="absolute inset-0 w-full h-full object-cover z-0" />
  <div className="relative z-10 max-w-3xl p-8">
    <h1 className="text-4xl font-bold text-primary">Welcome to Community GreenToken</h1>
    <p className="mt-4 text-text-secondary">Earn rewards for sustainable actions in your community</p>
    <CTAButton label="Get Started" onClick={() => alert('CTA clicked')} />
  </div>
</section>
```

### UX/UI Notes
- Ensure **hero text and CTA** are readable over the image; use overlays or gradient if necessary.
- Maintain **responsive design**: image should scale and crop appropriately on mobile, tablet, and desktop.
- Apply **hover/focus/active** states for CTA buttons.
- Keep **load times optimal** by compressing the image if needed.

### Accessibility
- Use a descriptive `alt` text: `"Community GreenToken hero illustration featuring community engagement and eco initiatives"`.
- Ensure text contrast meets WCAG 2.1 guidelines.
- Allow keyboard navigation to reach the CTA button.

### Optional Enhancements
- Add subtle **motion or parallax** effect to the background for a dynamic hero.
- Use **lazy loading** for the hero image to improve initial page load.
- Overlay **light shadow or gradient** behind text to enhance readability over detailed image.