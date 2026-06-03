
# Org Onboarding Wizard Hero Image

## File Name
`org_onboarding_hero.png`

## Suggested Folder
```
assets/images/pages/org_onboarding/
```

## Recommended Dimensions
1920px width × 800px height

## File Type
PNG

## Usage
- Place in the Hero section on `/org/setup?step=1–5`
- Image is static; form fields and live preview panel are implemented via React/Next.js separately.

## UX/UI Notes
- Left-side space should remain empty for the form panel (approx. 40% of width).
- Right-side image should show human hands interacting with plants/seedlings.
- Use subtle sunlight and soft-focus background for depth and organic feel.
- Ensure color tones align with GreenToken branding (greens, natural earth tones).
- Mobile: Center crop key visual elements; maintain human touch focus.

## Starter React/Next.js Integration
```jsx
// components/OrgOnboardingHero.jsx
export default function OrgOnboardingHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/org_onboarding/org_onboarding_hero.png"
        alt="Hands nurturing plants with sunlight in the background"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

## Notes for Developers
- Do **not** add text/buttons in the image; these are part of the left panel overlay in the actual page.
- Lazy-load the image for performance.
- Use `object-cover` to maintain proportions on tablet and mobile.
- Ensure the hero section retains safe padding so important elements aren’t cropped on smaller screens.
