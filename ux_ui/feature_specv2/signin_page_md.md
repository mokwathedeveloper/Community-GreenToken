# Community GreenToken Sign In / Authentication Page MD

This markdown provides **implementation instructions** for the Sign In / Authentication page of the Community GreenToken web application.

---

## 0. Page Images

| Image | Path | Dimensions | Use |
|---|---|---|---|
| Hero background | `assets/image/pages/auth/signin_hero.png` | 1672×941 | Full-screen background behind sign-in form |

> Sign In has no sidebar.  
> See `siginpage/signin_hero_image.md` for hero implementation details.

## 1. Components
- `SignInForm` – Email/wallet input with password or wallet connection.
- `WalletConnectButton` – Connect crypto wallet (e.g., MetaMask, Phantom).
- `AuthProviderLinks` – Optional social login or Supabase Auth links.
- `ErrorMessage` – Inline error display for failed auth attempts.

## 2. States
- **Default:** Empty form, wallet button ready.
- **Loading:** Disable inputs and button; show spinner during auth.
- **Error:** Show inline error (invalid credentials, wallet rejected).
- **Success:** Redirect to Dashboard (`/dashboard`).

## 3. Props
- `redirectPath` – Where to send user on success (default: `/dashboard`).
- `authProviders` – List of supported auth methods (email, wallet, social).

## 4. Primary Route
- `/signin`
- Also reachable via redirect when unauthenticated user accesses protected routes.

## 5. Key Interactions
1. User enters credentials or clicks **Connect Wallet**.
2. `Loading` state shown while Supabase Auth or wallet handshake completes.
3. On success, user is redirected to `/dashboard`.
4. On error, inline `ErrorMessage` displays a clear, actionable message.
5. "Forgot password" link (email flow only) triggers password reset email.

## 6. Folder Structure
```
frontend/
├─ components/
│  ├─ SignInForm.jsx
│  ├─ WalletConnectButton.jsx
│  └─ ErrorMessage.jsx
├─ pages/
│  └─ signin.jsx
├─ styles/
│  └─ signin.css (optional)
└─ utils/
   └─ auth.js  (Supabase Auth helpers)
```

## 7. UX/UI Notes
- Keep the sign-in form centered, clean, and uncluttered.
- Wallet connect button should be visually distinct from email form.
- Use `design_system.md` colors: primary green for CTA, error red for messages.
- Maintain brand trust with the GreenToken logo above the form.
- Mobile layout should stack all elements vertically.

## 8. Accessibility
- Semantic `<form>` with `<label>` for all inputs.
- ARIA `role="alert"` on error messages for screen reader announcement.
- Full keyboard navigation: Tab through fields and buttons.
- Color contrast meets WCAG 2.1 (AA) minimum for all text.

## 9. Mandatory Enhancements
- Persist auth session with Supabase session tokens.
- Protect all non-public routes by checking auth state in middleware.
- Provide "Sign Up" link for new users (route: `/signup` — to be defined).
- Log sign-in events for analytics and security auditing.

This MD file serves as a **developer blueprint** for implementing the Sign In page, aligned with Supabase Auth and wallet integration per Community GreenToken security and UX/UI guidelines.
