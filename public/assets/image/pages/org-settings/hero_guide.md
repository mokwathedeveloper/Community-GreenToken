
# Org Settings Page Hero Image

## File Name
org_settings_hero.png

## Suggested Folder
frontend/assets/images/pages/org_settings/

## Recommended Dimensions
1920px width × 800px height

## File Type
PNG

## Specifications
- **Layout:** Right-side hero illustration (form panel on left will be added later via code)
- **Visual Theme:** Eco-friendly, clean, collaborative
- **Illustration/Photo Focus:**
  - Hands arranging seedlings or plants
  - Diverse group of people in eco-office or outdoor green environment interacting with tokens or dashboards
  - Subtle eco elements like leaves, sunlight, and soft gradients
- **Style:** Semi-photorealistic vector or soft 3D blend, warm natural lighting
- **Background:** Optional transparency; soft organic tones
- **Mood:** Inviting, human, collaborative

## React/Next.js Starter Integration
```javascript
// components/OrgSettingsHero.jsx
export default function OrgSettingsHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/org_settings/org_settings_hero.png"
        alt="Team managing sustainable actions and tokens in green workspace"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

## UX/UI Notes for Developers
- Do **not** add text or buttons in the image; form fields will be overlayed on the left panel.
- Use `object-cover` for responsive behavior across desktop, tablet, and mobile.
- Maintain safe padding on all devices so hands, plants, or tokens are not cropped.
- Lazy-load the image for improved page load performance.
- Ensure colors match GreenToken branding: greens, earth tones, and soft natural light.
- Mobile: Center crop key visual elements; retain human-centric focus.
