# Community GreenToken Main Feature Page - Action Submission MD

This markdown provides **implementation instructions** for the Main Feature Page (Action Submission) of the Community GreenToken web application.

---

## 1. Components
- `ActionForm` – Form to submit sustainable actions.
- `SubmitButton` – Triggers submission with loading, success, and error states.
- `ConfirmationModal` – Displays confirmation after submission.
- `LoadingSkeleton` – Shows placeholders while submission is processing.

## 2. States
- **Loading:** Display skeleton loaders and disable form inputs.
- **Success:** Show confirmation modal and reset form.
- **Error:** Display inline error messages for failed submissions.

## 3. Props
- `actionType` – Type of the sustainable action.
- `description` – Description of the action.
- `timestamp` – Time of submission.
- Optional: `userId` or wallet address if required for backend/API calls.

## 4. Primary Route
- `/feature`
- This page is accessible from the Landing Page CTA and main navigation.

## 5. Key Interactions
1. User fills the action form.
2. Clicks `SubmitButton`.
3. `LoadingSkeleton` appears while backend/API processes the action.
4. On success, `ConfirmationModal` is displayed.
5. On error, inline message appears, allowing retry.
6. Form resets or maintains data as needed.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ ActionForm.jsx
│  ├─ SubmitButton.jsx
│  ├─ ConfirmationModal.jsx
│  └─ LoadingSkeleton.jsx
├─ pages/
│  └─ feature.jsx
├─ styles/
│  └─ feature.css (optional for specific page styling)
└─ data/
   └─ mockActions.js (optional for demo purposes)
```

## 7. UX/UI Notes
- Ensure **form validation** and clear error states.
- Provide **loading indicators** using `LoadingSkeleton`.
- Maintain **accessibility**: focus management, keyboard navigation, aria labels.
- Buttons should reflect **hover, focus, and active states**.
- Align layout with `design_system.md` and `features_to_mockup_map.md`.

## 8. Accessibility
- `ConfirmationModal` should trap focus while open.
- Use semantic HTML elements for forms and inputs.
- Provide `aria-busy` on `SubmitButton` when loading.
- Ensure color contrast for text, inputs, and buttons meets WCAG 2.1.

## 9. Optional Enhancements
- Animate success confirmation for better feedback.
- Pre-fill actionType if coming from a quick-select CTA.
- Integrate AI/Analytics API for validating or scoring the submitted action.

This MD file serves as a **developer blueprint** for implementing the Action Submission page exactly as per Community GreenToken design and UX/UI guidelines.

