# Community GreenToken — Pricing Page MD

**Route:** `/pricing` | **Access:** Public

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/pricing/pricing_hero.png` | 1942×809 | Top hero/banner section |
| CTA page background | `assets/image/pages/pricing/price_page.png` | 1942×809 | Alternative full-page background |
| Shared banner (fallback) | `assets/image/banner.png` | 1916×821 | Fallback banner |

> Pricing page has no sidebar.  
> See `Pricing Page /pricing_hero_image.md` for hero implementation.  
> See `Pricing Page /pricing_hero_image_guide.md` for CTA placement guide.

## 1. Components
- `PricingHero` – Headline + sub-headline above the plan cards.
- `PricingTable` – 3-column plan comparison (Free / Starter / Pro) + Enterprise row.
- `FeatureRow` – Each feature row with checkmarks/crosses per plan.
- `PricingCTAButton` – "Start Free", "Get Started", "Contact Us" per plan.
- `FAQAccordion` – Common billing/plan questions.
- `SocialProof` – Logos or short quotes from example organizations.

## 2. Plan Cards Layout

```
┌──────────┐  ┌──────────────┐  ┌──────────────┐
│  FREE    │  │  STARTER     │  │  PRO  ★      │
│  $0/mo   │  │  $49/mo      │  │  $199/mo     │
│          │  │              │  │  Most Popular│
│ 50 mbrs  │  │ 500 members  │  │ 5,000 members│
│ Basic    │  │ Analytics ✅  │  │ White-label ✅│
│ 3 actions│  │ Custom token ✅│  │ API access ✅ │
│          │  │ 10 actions ✅ │  │ Priority ✅   │
│[Start Free]│ │[Get Started] │  │[Get Started] │
└──────────┘  └──────────────┘  └──────────────┘
                    Enterprise: [ Contact Us ]
```

## 3. Feature Comparison Table

| Feature | Free | Starter | Pro | Enterprise |
|---|---|---|---|---|
| Members | 50 | 500 | 5,000 | Unlimited |
| Action types | 3 | 10 | Unlimited | Custom |
| Custom token name | ❌ | ✅ | ✅ | ✅ |
| Analytics dashboard | ❌ | ✅ | ✅ | ✅ |
| White-label branding | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ | ✅ |
| Per-org smart contract | ❌ | ❌ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| SLA / dedicated onboarding | ❌ | ❌ | ❌ | ✅ |

## 4. States
- **Default:** All three plan cards visible side by side.
- **Hover:** Card lifts with subtle shadow.
- **Annual toggle:** Switch monthly ↔ annual pricing (2 months free on annual).
- **Loading:** Button shows spinner during Stripe redirect.

## 5. Key Interactions
1. Toggle **Monthly / Annual** billing → prices update, annual shows savings badge.
2. Click **Start Free** → redirect to `/org/setup` (no credit card).
3. Click **Get Started** (Starter/Pro) → start Stripe Checkout flow.
4. Click **Contact Us** (Enterprise) → open contact form or Calendly link.
5. FAQ items expand/collapse on click.

## 6. Folder Structure
```
frontend/
├── components/
│   ├── PricingTable.jsx
│   ├── FeatureRow.jsx
│   ├── PricingCTAButton.jsx
│   └── FAQAccordion.jsx
├── pages/
│   └── pricing.jsx
└── data/
    └── pricingData.js    (plan features + prices)
```

## 7. UX/UI Notes
- Pro plan card has a "Most Popular" badge in primary green (`#2ECC71`).
- Use the accent color (`#F1C40F`) for savings badges (e.g., "Save 17%").
- Annual/monthly toggle is a pill switch at top of page.
- Enterprise row is a full-width muted card below the three columns.
- Mobile: stacks plan cards vertically; feature table collapses to accordion.

## 8. Accessibility
- Each plan card is a `<section>` with `aria-label="Free plan"` etc.
- CTA buttons include plan name in accessible text: "Get started with Starter plan".
- Toggle has `role="switch"` and keyboard support.
- FAQ uses `<details>/<summary>` for native keyboard + screen reader support.

## 9. Mandatory Enhancements
- Annual pricing toggle (2 months free = 16.7% discount).
- "14-day free Pro trial" banner above the plan cards.
- Exit-intent popup offering a free trial before user leaves the page.
