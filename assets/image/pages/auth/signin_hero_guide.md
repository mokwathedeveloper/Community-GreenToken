
# Sign In Page Hero Section — GreenToken

## File Name
`eco_friendly_gardening_in_a_sunlit_park.png`

## Suggested Folder
`frontend/assets/images/pages/auth/`

## Recommended Dimensions
Full screen: `1920px width × 1080px height` (or responsive `h-screen` for web)

## File Type
PNG

## Usage
- Place as the **background hero image** on `/signin` page.
- Form panel (`SignInForm`) will be overlayed separately in React/Next.js.
- Mobile: scale image proportionally, ensure key elements remain visible.

## Folder Structure

\`\`\`
frontend/
├─ assets/
│  └─ images/
│      └─ pages/
│          └─ auth/
│              └─ eco_friendly_gardening_in_a_sunlit_park.png
├─ components/
│  └─ SignInHero.jsx
├─ pages/
│  └─ signin.jsx
└─ styles/
   └─ signin.css (optional)
\`\`\`

## Starter React/Next.js Integration

\`\`\`jsx
// components/SignInHero.jsx
export default function SignInHero() {
  return (
    <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <img
        src="/assets/images/pages/auth/eco_friendly_gardening_in_a_sunlit_park.png"
        alt="Eco-friendly garden with people tending plants under sunlight"
        className="absolute w-full h-full object-cover top-0 left-0 z-0"
        loading="lazy"
      />

      {/* Optional overlay for contrast */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Sign In form placeholder */}
      <div className="relative z-20 w-full max-w-md p-8 bg-white/80 rounded-lg shadow-lg">
        {/* Actual SignInForm component will go here */}
        <p className="text-center text-gray-700">
          Sign In Form will be implemented here
        </p>
      </div>
    </div>
  );
}
\`\`\`

## UX/UI Notes
- **Do not add text/buttons** in the image; they are part of the overlayed SignInForm panel.
- Maintain **human-focused, organic feel** with the garden scene.
- Use **lazy loading** to improve performance.
- Responsive: `object-cover` ensures image scales on tablets and mobile.
- Keep **padding/safe zones** so hands, people, and greenery are not cropped.
