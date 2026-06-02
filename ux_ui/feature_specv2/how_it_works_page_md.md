# Community GreenToken How It Works Page MD

This markdown provides **implementation instructions** for the How It Works page of the Community GreenToken web application.

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/how-it-works/how_it_works_hero.png` | 1916×821 | Top hero section |
| Section banner | `assets/image/pages/how-it-works/how_it_works_banner.png` | 1916×821 | Mid-page section banner |
| Flow diagram background | `assets/image/pages/how-it-works/flow_diagram_background.png` | 2508×627 | Background behind flow diagram section |
| Flow diagram | `assets/image/architecture/community_greentoken_flow_diagram.png` | 1448×1086 | Token lifecycle diagram |
| Shared banner (fallback) | `assets/image/banner.png` | 1916×821 | Fallback banner |

> How It Works has no sidebar.  
> See `howitworks /how_it_works_hero_guide.md` for hero implementation.

## 1. Components
- `StepCard` – Numbered step card explaining each stage of the user journey.
- `FlowDiagram` – Visual diagram of the token lifecycle (Submit → Verify → Earn → Redeem).
- `FAQAccordion` – Expandable FAQ items answering common user questions.
- `CTAButton` – Directs users to sign in or submit their first action.

## 2. States
- **Default:** Static numbered steps and collapsed FAQ items.
- **Hover:** Step card slight elevation/border highlight.
- **Expanded:** FAQ accordion item opened.

## 3. Data
- Static step-by-step content.
- FAQ content array (question + answer pairs).
- Optional: diagram image from `assets/image/architecture/`.

## 4. Primary Route
- `/how-it-works`
- Accessible from the main navigation and the Landing Page.

## 5. Key Interactions
1. Users scroll through numbered `StepCard` entries (1 → 5).
2. `FlowDiagram` image (blockchain ecosystem diagram) renders responsively.
3. `FAQAccordion` expands/collapses on click or keyboard Enter/Space.
4. `CTAButton` at the bottom sends users to action submission (`/feature`).

## 6. Step Content (5 Steps)
1. **Sign Up** — Create your account or connect your crypto wallet.
2. **Submit a Sustainable Action** — Log an action (e.g., recycling, tree planting, carpooling).
3. **Verification** — The ActionRegistry smart contract verifies your submission.
4. **Earn GreenTokens** — Verified actions trigger the GreenToken smart contract to mint tokens to your wallet.
5. **Redeem or Donate** — Use tokens for rewards or allocate them to community eco projects.

## 7. Folder Structure
```
frontend/
├─ components/
│  ├─ StepCard.jsx
│  ├─ FlowDiagram.jsx
│  ├─ FAQAccordion.jsx
│  └─ CTAButton.jsx
├─ pages/
│  └─ how-it-works.jsx
├─ styles/
│  └─ how-it-works.css (optional)
└─ data/
   └─ faqData.js  (FAQ question/answer pairs)
```

## 8. UX/UI Notes
- Use the existing `Community GreenToken flow diagram.png` or `Blockchain-based sustainable action ecosystem diagram.png` from `assets/image/architecture/` as the `FlowDiagram` visual.
- Step numbers should use the primary green (`#2ECC71`) for visual clarity.
- FAQ accordion uses subtle border and smooth open/close transition (200ms ease).
- Page should read cleanly without JavaScript for accessibility fallback.

## 9. Accessibility
- `FAQAccordion` must use `<details>`/`<summary>` elements or ARIA `role="region"` + `aria-expanded`.
- All images in `FlowDiagram` need descriptive `alt` text explaining the flow.
- Keyboard navigation: Tab to each FAQ, Enter/Space to toggle.
- WCAG 2.1 AA color contrast on all step numbering and text.

## 10. Mandatory Enhancements
- Link step 3 (Verification) to a brief explanation of blockchain/smart contract technology for non-technical users.
- Include a short glossary tooltip on "GreenToken" and "smart contract" for first-time visitors.
- Lazy load the `FlowDiagram` image.

This MD file serves as a **developer blueprint** for implementing the How It Works page, ensuring clarity, engagement, and alignment with Community GreenToken UX/UI guidelines.
