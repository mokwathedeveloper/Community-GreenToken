
# Signup Page Hero Image

## File Name
signup_hero_bg.png

## Suggested Folder
frontend/assets/images/pages/signup/

## Recommended Dimensions
1920px width × 800px height

## File Type
PNG

## Usage
The image will be used as the **background/hero section** on the Sign Up page. Form fields and interactive elements are overlaid on the left side.

## Starter React/Next.js Component

```jsx
// components/SignupHero.jsx
export default function SignupHero() {
  return (
    <div className="w-full h-[800px] relative overflow-hidden rounded-lg">
      <img
        src="/assets/images/pages/signup/signup_hero_bg.png"
        alt="People planting greenery together in nature"
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
│        └─ signup/
│           └─ signup_hero_bg.png
├─ components/
│  └─ SignupHero.jsx
├─ pages/
│  └─ signup.jsx
└─ styles/
   └─ signup.css (optional)
```

## Integration in Signup Page

```jsx
// pages/signup.jsx
import SignupHero from '../components/SignupHero';
import SignUpForm from '../components/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="w-full md:w-1/2">
        <SignupHero />
      </div>

      {/* Form Panel */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <SignUpForm />
      </div>
    </div>
  );
}
```

## UX/UI Notes
- Keep **left-side form panel** approx. 40–45% width; the hero image occupies right side.
- Use `object-cover` to ensure the hero image scales properly on tablet/mobile.
- Lazy-load the image to improve performance.
- Safe padding: ensure hands, people, and plants are visible and not cropped on smaller screens.
