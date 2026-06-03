
# GreenToken Pricing Page Hero Image

## File Name
pricing_hero.png

## Suggested Folder
frontend/assets/images/pages/pricing/

## Recommended Dimensions
1920px width × 800px height

## File Type
PNG

## Usage
- Place in the Hero section on `/pricing`.
- Text (headline/subheadline) will be overlayed via React/Next.js separately.

## UX/UI Notes
- Left side space remains empty for plan toggle & CTA buttons (approx. 40% width).
- Right side image should depict a collaborative eco-friendly workspace.
- Include subtle sunlight, soft-focus nature, or greenery accents for organic feel.
- Ensure color tones align with GreenToken branding (greens, natural earth tones).
- Mobile: Center crop key visual elements; maintain human and collaborative focus.

## Starter React/Next.js Integration
```jsx
// components/PricingHero.jsx
export default function PricingHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/pricing/pricing_hero.png"
        alt="Collaborative workspace with eco-friendly design elements"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

### Notes for Developers
- Do not add text/buttons in the image; these are part of the overlayed components in the actual page.
- Lazy-load the image for performance.
- Use responsive `object-cover` to maintain proportions on tablet and mobile.
- Maintain safe padding so key visual elements are not cropped.
