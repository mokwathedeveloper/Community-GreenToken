# Community GreenToken Token Redemption Page MD

This markdown provides instructions for implementing the Token Redemption Page of the Community GreenToken web application.

---

## 1. Components
- `RewardCard` – Displays each redeemable reward with title, description, and token cost.
- `RedeemButton` – Button to submit redemption requests.
- `ConfirmationModal` – Displays confirmation or error after redemption.

## 2. States
- **Loading:** Disable inputs and show visual feedback while processing.
- **Success:** Show confirmation modal and update token balance.
- **Error:** Display inline error message if redemption fails.

## 3. Props
- `rewardId` – Unique identifier for the reward.
- `tokenCost` – Number of tokens required for redemption.
- `availability` – Boolean indicating if the reward is available.
- Optional: `userTokenBalance` to determine if user can redeem.

## 4. Primary Route
- `/redeem`
- Accessible from the dashboard or main navigation.

## 5. Key Interactions
1. User selects a reward from the list of `RewardCard`s.
2. Clicks `RedeemButton`.
3. `Loading` state is displayed until backend/API confirms redemption.
4. `ConfirmationModal` shows success or error.
5. Token balance updates automatically on success.
6. Disabled rewards cannot be selected or redeemed.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ RewardCard.jsx
│  ├─ RedeemButton.jsx
│  └─ ConfirmationModal.jsx
├─ pages/
│  └─ redeem.jsx
├─ styles/
│  └─ redeem.css (optional for page-specific styling)
└─ data/
   └─ mockRewards.js (optional for demo purposes)
```

## 7. UX/UI Notes
- Ensure `RewardCard` highlights hover and focus states.
- `RedeemButton` reflects loading, disabled, and active states.
- Confirmation modal should trap focus and be keyboard accessible.
- Layout should be responsive and maintain card alignment on mobile, tablet, and desktop.
- Follow `design_system.md` for colors, spacing, and typography.

## 8. Accessibility
- Use semantic HTML and ARIA labels.
- Disabled rewards should be communicated visually and programmatically.
- Confirmation modal must be readable by screen readers.
- Ensure color contrast meets WCAG 2.1 standards.

## 9. Mandatory Enhancements
- Animate reward selection and redemption feedback.
- Lazy load reward images to optimize performance.
- Include tooltips for additional reward information.
- Integrate with AI/Analytics API to log redemption and impact metrics.

This MD file serves as a **developer blueprint** for implementing the Token Redemption Page, ensuring proper states, interactions, accessibility, and adherence to Community GreenToken UX/UI guidelines.