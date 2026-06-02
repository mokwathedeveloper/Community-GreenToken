# Community GreenToken Sign Up / Register Page MD

**Route:** `/signup` | **Access:** Public

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/auth/signup_hero.png` | 1942×809 | Right-panel hero image |

> Sign Up has no sidebar.  
> See `signuppage/signup_hero_image_starter.md` for hero/split-layout implementation.

## 1. Components
- `SignUpForm` – Name, email, password fields with validation.
- `WalletConnectButton` – Alternative: register via crypto wallet.
- `InviteTokenInput` – Optional: pre-filled invite token from org invite link.
- `TermsCheckbox` – Required checkbox linking to `/terms` and `/privacy`.
- `ErrorMessage` – Inline error display.

## 2. States
- **Default:** Empty form.
- **Loading:** Inputs disabled, spinner on submit button.
- **Error:** Inline validation (email taken, weak password, etc.).
- **Success:** Redirect to `/org/setup` (new org owner) or `/dashboard` (via invite link).

## 3. Props / Data
- `inviteToken` – Optional query param from org invite link (`?token=abc123`).
- If `inviteToken` present, org name is pre-filled and user joins that org on success.

## 4. Primary Route
- `/signup`
- Linked from Sign In page ("Don't have an account?")
- Linked from Pricing page CTA ("Start Free")

## 5. Key Interactions
1. User fills email + password → `POST /api/auth/signup`.
2. If `inviteToken` in URL → on success call `POST /api/invites/:token/accept`.
3. New users with no invite → redirect to `/org/setup` to create their organization.
4. Email confirmation link sent via Supabase Auth.
5. Terms checkbox must be checked before submit enables.

## 6. Folder Structure
```
frontend/
├── components/
│   ├── SignUpForm.jsx
│   ├── WalletConnectButton.jsx
│   ├── InviteTokenInput.jsx
│   └── TermsCheckbox.jsx
├── pages/
│   └── signup.jsx
└── utils/
    └── auth.js
```

## 7. UX/UI Notes
- Mirror the Sign In page layout for consistency.
- Password strength indicator (weak/medium/strong) under the password field.
- If arriving via invite link, show org name prominently: "You're joining Cape Town Council".
- Terms checkbox uses `design_system.md` link styling for `/terms` and `/privacy`.

## 8. Accessibility
- `<form>` with proper `<label>` for every input.
- Password field has a show/hide toggle with `aria-label="Show password"`.
- `TermsCheckbox` links open in a new tab with `aria-label` indicating they leave the form.
- Error messages use `role="alert"` for screen reader announcement.

## 9. Mandatory Enhancements
- Password strength meter using zxcvbn or equivalent.
- Google / GitHub OAuth buttons (Supabase social providers).
- Rate-limit sign-up attempts (prevent spam account creation).
- Send welcome email via Supabase trigger after confirmation.

## 10. Starter Code
See `signup_page_starter_code.js`
