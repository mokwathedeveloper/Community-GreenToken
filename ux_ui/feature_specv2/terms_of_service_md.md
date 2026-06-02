# Community GreenToken Terms of Service Page MD

**Route:** `/terms` | **Access:** Public

---

## 1. Purpose
Legally required for any SaaS platform with billing. Governs the relationship between Community GreenToken (the platform) and organizations / users. Must be accepted during Sign Up and linked from footer.

## 2. Components
- `PolicyHero` – Page title + effective date (reuse from Privacy Policy).
- `PolicySection` – Reusable section component.
- `PolicyTableOfContents` – Anchored navigation.

## 3. Primary Route
- `/terms`
- Linked from: Sign Up checkbox, Footer, Pricing page, Billing page

## 4. Required Sections

### 4.1 Acceptance of Terms
By creating an account or using the Service, you agree to these Terms. Organizations must be legally authorized to accept on behalf of their entity.

### 4.2 Description of Service
Community GreenToken is a SaaS platform that enables organizations to create and manage blockchain-based token reward programs for sustainable actions.

### 4.3 Account Registration
- You must provide accurate information
- You are responsible for maintaining account security
- One organization per subscription (unless Enterprise plan)
- Minimum age: 18 years for account ownership

### 4.4 Subscription and Billing
- Subscriptions are billed monthly or annually via Stripe
- Free trial period: 14 days with full Pro feature access
- After trial, account downgrades to Free plan if not upgraded
- No refunds for partial months unless required by law
- We may change pricing with 30 days' notice

### 4.5 Token System
- GreenTokens have no monetary value outside the platform
- Tokens cannot be exchanged for fiat currency
- Token balances may be reset if an organization is deleted
- On-chain tokens are subject to smart contract terms

### 4.6 Acceptable Use
You must NOT:
- Use the platform for fraudulent action submissions
- Attempt to manipulate leaderboards or token balances
- Share account credentials with unauthorized parties
- Use automated bots to submit actions

### 4.7 Intellectual Property
- The platform software and branding are owned by Community GreenToken
- Organizations retain ownership of their uploaded content (logos, custom action types)
- Open-source smart contracts are licensed under MIT

### 4.8 Service Availability
- We target 99.5% uptime but do not guarantee uninterrupted access
- Scheduled maintenance windows communicated 24h in advance
- No SLA for Free or Starter plans; SLA available on Enterprise

### 4.9 Termination
- You may cancel your subscription at any time (effective end of billing period)
- We may terminate accounts for violation of these Terms
- Upon termination, organization data is available for export for 30 days

### 4.10 Limitation of Liability
To the maximum extent permitted by law, Community GreenToken is not liable for indirect, incidental, or consequential damages arising from use of the Service.

### 4.11 Governing Law
These Terms are governed by the laws of South Africa. Disputes resolved in Cape Town jurisdiction unless otherwise agreed for Enterprise clients.

### 4.12 Changes to Terms
We may update these Terms with 30 days' notice via email and in-app notification. Continued use constitutes acceptance.

## 5. Folder Structure
```
frontend/
├── components/
│   ├── PolicyHero.jsx        (shared with /privacy)
│   ├── PolicySection.jsx     (shared with /privacy)
│   └── PolicyTableOfContents.jsx
├── pages/
│   └── terms.jsx
```

## 6. UX/UI Notes
- Reuse the same layout components as `/privacy` for visual consistency.
- Show effective date prominently.
- Include a "Print / Download PDF" button.

## 7. Legal Note
This is a template. Have a qualified legal professional review before launch, particularly for POPIA compliance (South Africa) and consumer protection regulations applicable to your jurisdiction.
