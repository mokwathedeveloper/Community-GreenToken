# Community GreenToken Landing Page — Starter React Code

This markdown provides a **starter code** for the landing page of Community GreenToken, including the **Hero Section** and the **Impact Banner Section**.

---

## Folder Structure
```
frontend/
├─ assets/
│  └─ images/
│     └─ pages/
│        ├─ about_us/
│        │   └─ nurtured_nature_hero.png
│        └─ impact/
│            └─ eco_tech_globe_in_a_green_landscape.png
├─ components/
│  ├─ HeroSection.jsx
│  └─ BannerSection.jsx
├─ pages/
│  └─ index.jsx
├─ styles/
│  └─ landing.css (optional)
```

---

## HeroSection.jsx
```jsx
// components/HeroSection.jsx
import React from "react";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[800px] overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/about_us/nurtured_nature_hero.png"
        alt="Hands nurturing a small plant with sunlight in the background"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20 text-left text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Building a Sustainable Future, Together
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-xl">
          Empowering communities to take eco-friendly actions and make an impact.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
          Get Started
        </button>
      </div>
    </section>
  );
}
```

---

## BannerSection.jsx
```jsx
// components/BannerSection.jsx
import React from "react";

export default function BannerSection() {
  return (
    <section className="relative w-full h-[400px] my-10 rounded-lg overflow-hidden">
      <img
        src="/assets/images/pages/impact/eco_tech_globe_in_a_green_landscape.png"
        alt="Community GreenToken Impact Banner"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-5">
        <h2 className="text-3xl md:text-5xl font-bold mb-3">
          Our Community. Our Collective Impact.
        </h2>
        <p className="text-lg md:text-xl mb-4 max-w-2xl">
          Every action you take creates a ripple of positive change. Together,
          we're building a greener, more sustainable future.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
          View Projects
        </button>
      </div>
    </section>
  );
}
```

---

## index.jsx Usage
```jsx
// pages/index.jsx
import React from "react";
import HeroSection from "../components/HeroSection";
import BannerSection from "../components/BannerSection";

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <BannerSection />
      {/* Additional sections like How It Works, Stats, Footer can go here */}
    </div>
  );
}
```

---

## Notes
1. `object-cover` ensures images fill sections without distortion.
2. Overlay text uses absolute positioning and is responsive with Tailwind classes.
3. Buttons and headings can be styled further via Tailwind or CSS.
4. Images should be placed under `frontend/assets/images/pages/` as per folder structure.
5. Can expand with more landing page sections below Hero/Banner as needed.
