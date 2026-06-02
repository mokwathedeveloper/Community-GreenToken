
# About Us Hero Section — GreenToken

## File Name & Folder
- **File Name:** nurtured_nature_hero.png
- **Folder:** frontend/assets/images/pages/about_us/

## Recommended Dimensions
- Width: 1920px
- Height: 800px
- Format: PNG
- Background: Soft organic gradient, no text (text will be added via React overlay)

## React/Next.js Starter Component
```jsx
// components/AboutUsHero.jsx

export default function AboutUsHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/about_us/nurtured_nature_hero.png"
        alt="Hands nurturing a small plant with sunlight in the background"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

## Folder Structure
```
frontend/
├─ assets/
│  └─ images/
│     └─ pages/
│        └─ about_us/
│           └─ nurtured_nature_hero.png
├─ components/
│  └─ AboutUsHero.jsx
├─ pages/
│  └─ about.jsx
├─ styles/
│  └─ about.css (optional)
└─ data/
   └─ teamData.js
```

## Usage Notes
- Place the component at the top of the About Us page (`/about`) as the hero section.
- Ensure object-cover keeps the image proportional on all screen sizes.
- Left side space can be reserved for headings, subtext, and CTA via overlay in React.
- Lazy-load the image for performance using `loading="lazy"`.
- Safe padding around edges ensures that hands, seedlings, and greenery are never cropped on smaller screens.

## UX/UI Notes
- Hero image conveys human touch, sustainability, and nurturing.
- Align colors with GreenToken branding: soft greens, natural earth tones.
- Avoid adding text directly in the image; overlay text dynamically using components.
- Mobile: center-crop the key visual (hands, plant) to retain human focus.
