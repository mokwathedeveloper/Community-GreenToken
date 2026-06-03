# Community GreenToken — Shared Banner Guide

## Banner Image

**File:** `banner/banner.png` (also at `assets/image/banner.png`)  
**Dimensions:** 1916 × 821 px | **Format:** PNG RGB  
**Purpose:** Full-width banner section used across all pages that have a CTA or section banner.

---

## Usage: Which Pages Use This Banner

This shared banner image is used as the **bottom CTA banner** or **section divider banner** on the following pages:

| Page | Route | Section | Component |
|---|---|---|---|
| Landing Page | `/` | CTA / Impact section | `BannerSection.jsx` |
| Dashboard | `/dashboard` | Bottom CTA ("Small Actions. Big Impact.") | `DashboardCTABanner.jsx` |
| About Us | `/about` | Bottom CTA banner | `AboutUsCTABanner.jsx` |
| How It Works | `/how-it-works` | Mid-page section break | `HowItWorksBanner.jsx` |
| Impact | `/impact` | Top hero banner area | `ImpactBanner.jsx` |
| Pricing | `/pricing` | Header banner area | `PricingBanner.jsx` |
| Action Submission | `/feature` | Hero / top section | `FeatureBanner.jsx` |
| Token Redemption | `/redeem` | Top section banner | `RedeemBanner.jsx` |
| Donation Tracking | `/donations` | Top section banner | `DonationBanner.jsx` |
| Leaderboard | `/leaderboard` | Top section banner | `LeaderboardBanner.jsx` |
| Analytics | `/analytics` | Top section banner | `AnalyticsBanner.jsx` |

> **Note:** Page-specific hero images (in `assets/image/pages/`) are taller (800–1080px) and serve as full-height hero backgrounds. The shared banner (1916×821) is shorter and used for secondary banner sections.

---

## Reusable Banner Component

```jsx
// components/SharedBanner.jsx
export default function SharedBanner({ title, subtitle, ctaLabel, ctaHref }) {
  return (
    <section className="relative w-full h-[400px] overflow-hidden rounded-xl my-8">
      <img
        src="/assets/images/banner.png"
        alt="Community GreenToken — eco-friendly community illustration"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        {title && <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">{title}</h2>}
        {subtitle && <p className="text-lg text-white/90 max-w-2xl mb-6">{subtitle}</p>}
        {ctaLabel && (
          <a
            href={ctaHref || '#'}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
```

### Usage in any page:
```jsx
import SharedBanner from '../components/SharedBanner';

// Example: bottom of About Us page
<SharedBanner
  title="Join the Movement"
  subtitle="Start earning tokens for the sustainable actions you already take."
  ctaLabel="Get Started"
  ctaHref="/org/setup"
/>
```

---

## Page-Specific Banners

Some pages have their own banner images (in `assets/image/pages/`). Use the page-specific image when available, fall back to `banner.png` when not:

| Page | Page-Specific Banner | Fallback |
|---|---|---|
| About Us | `assets/image/pages/about-us/about_us_cta_banner.png` (1916×821) | `banner/banner.png` |
| How It Works | `assets/image/pages/how-it-works/how_it_works_banner.png` (1916×821) | `banner/banner.png` |
| All others | — | `banner/banner.png` |

---

## UX/UI Notes
- Banner height: **380–420px** on desktop, scales down on mobile.
- Always use a dark overlay (`bg-black/20` to `bg-black/40`) over the banner image so text is readable.
- Do NOT embed text directly in the PNG — add text/CTAs as React overlay.
- `object-cover` ensures correct responsive behavior on all screen sizes.
- `loading="lazy"` for performance on pages where the banner is below the fold.
