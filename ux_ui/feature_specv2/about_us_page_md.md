# Community GreenToken About Us Page MD

This markdown provides **implementation instructions** for the About Us page of the Community GreenToken web application.

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/about-us/about_us_hero.png` | 1536×1024 | `AboutUsHero` — top hero section |
| CTA banner | `assets/image/pages/about-us/about_us_cta_banner.png` | 1916×821 | `CTABanner` — bottom CTA section |
| Shared banner (fallback) | `assets/image/banner.png` | 1916×821 | Optional fallback banner |

> See `about page /about_us_hero_starter.md` for hero starter code.  
> See `about page /about_us_cta_banner_guide.md` for banner guide.

## 1. Components
- `MissionStatement` – Hero-style block presenting the platform mission.
- `TeamCard` – Individual card per team member with name, role, and photo.
- `ValuePillar` – Icon + short description for each core value (sustainability, transparency, community).
- `CTABanner` – Bottom call-to-action pointing users to the main feature or sign-in.

## 2. States
- **Default:** Static content with hover states on TeamCard and ValuePillar.
- **Hover:** Card elevation / subtle highlight on interactive elements.

## 3. Data
- Static team member data (name, role, avatar).
- Static mission and values text.
- Optional: link to external social profiles or GitHub.

## 4. Primary Route
- `/about`
- Accessible from the main navigation bar.

## 5. Key Interactions
1. Scroll-triggered fade-in for `ValuePillar` entries.
2. Hover on `TeamCard` reveals a short bio overlay.
3. `CTABanner` at the bottom directs users to start using the platform.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ MissionStatement.jsx
│  ├─ TeamCard.jsx
│  ├─ ValuePillar.jsx
│  └─ CTABanner.jsx
├─ pages/
│  └─ about.jsx
├─ styles/
│  └─ about.css (optional)
└─ data/
   └─ teamData.js  (static team member info)
```

## 7. UX/UI Notes
- Use the Community GreenToken brand identity board image (`branding/`) as a visual reference.
- Mission statement should be in an H1 with large, bold typography (700 weight per design system).
- ValuePillar icons should use the flat/simple icon style from `design_system.md`.
- Keep content scannable — short paragraphs, clear headings, ample whitespace.

## 8. Accessibility
- Semantic HTML: `<section>`, `<article>`, `<h1>–<h3>` hierarchy.
- All `TeamCard` images need descriptive `alt` text.
- Scroll animations must respect `prefers-reduced-motion` media query.
- Ensure WCAG 2.1 color contrast for all text on background.

## 9. Content Guidelines
- Mission: Why Community GreenToken exists — rewarding sustainable action with transparent, blockchain-verified tokens.
- Values: Sustainability · Transparency · Community Impact · Innovation.
- Team: Hackathon team members with roles (frontend, backend, smart contracts, design, product).

This MD file serves as a **developer blueprint** for implementing the About Us page, aligned with Community GreenToken branding and UX/UI guidelines.
