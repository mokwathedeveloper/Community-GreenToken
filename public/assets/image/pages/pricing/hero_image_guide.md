# Pricing Page Hero Image — Centered CTA Reference

## 1. Purpose
Use the attached image as the **hero section background**. The **CTA buttons** will be placed in the midsection, aligned with the key visual focus of the people and eco-graphics in the illustration.

**Image:** `price_page.png`  
**Resolution:** 1920 × 800 px  
**File Type:** PNG  

## 2. Folder Structure
```
frontend/
└─ assets/
   └─ images/
      └─ pages/
         └─ pricing/
            └─ price_page.png
```

## 3. Starter React/Next.js Component
```jsx
// components/PricingHeroImage.jsx
export default function PricingHeroImage() {
  return (
    <div className="relative w-full h-[800px] overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/pricing/price_page.png"
        alt="Eco-friendly workspace illustration for pricing hero"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* CTA buttons will be overlaid here */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        {/* Placeholder: devs add PricingCTAButton here */}
      </div>
    </div>
  );
}
```

## 4. UX/UI Notes
- Keep **key visual elements** (people, plants, globe) centered; CTA buttons should align with this area.
- Text overlay (headline, tagline) is **added via code**, not included in the image.
- Use `object-cover` to maintain image proportions on desktop and mobile.
- Maintain **safe padding** to avoid cropping key elements on smaller screens.
- Lazy-load the image for better performance.
