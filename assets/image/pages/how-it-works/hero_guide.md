
# How It Works Page Hero Section — Image Implementation

## File Name
how_it_works_hero.png

## Suggested Folder
frontend/assets/images/pages/how_it_works/

## Recommended Dimensions
- Width: 1920px  
- Height: 800px  

## File Type
- PNG (transparent background optional)

## Usage
- Place this image in the Hero section of `/how-it-works` page.
- Step numbers and content panels are implemented separately via React/Next.js.

## UX/UI Notes
- Left-side space (~40% width) remains empty for text and interactive StepCards.
- Right-side image shows eco-friendly illustration with human/organic elements.
- Include soft gradients, sunlight, and depth to maintain organic feel.
- Ensure color palette aligns with GreenToken branding (greens, natural earth tones).
- Mobile: Center crop key elements (plants, globe, human figure).

## Starter React/Next.js Integration
```jsx
// components/HowItWorksHero.jsx
export default function HowItWorksHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/how_it_works/how_it_works_hero.png"
        alt="Eco-friendly illustration with globe, plants, and human interaction"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
```

## Folder Structure
frontend/
├── assets/
│   └── images/
│       └── pages/
│           └── how_it_works/
│               └── how_it_works_hero.png
├── components/
│   └── HowItWorksHero.jsx
├── pages/
│   └── how-it-works.jsx
├── styles/
│   └── how-it-works.css (optional)
└── data/
    └── stepsData.js  (static step-by-step content)

## Developer Notes
- Do **not** include text or StepCard elements in the PNG; overlay these with React components.
- Use `object-cover` to maintain proportions and responsiveness.
- Lazy-load the image for performance.
- Keep safe padding so the globe, plants, and human elements are not cropped on smaller screens.
