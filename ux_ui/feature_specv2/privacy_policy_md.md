# Community GreenToken Privacy Policy Page MD

**Route:** `/privacy` | **Access:** Public

---

## 1. Purpose
Legally required for any SaaS platform that collects user data, processes payments (Stripe), and uses third-party services (Supabase, blockchain). Must be linked from Sign Up form and footer.

## 2. Components
- `PolicyHero` – Page title + last updated date.
- `PolicySection` – Reusable section with heading + body text.
- `PolicyTableOfContents` – Anchored links to each section.
- `ContactBlock` – Data controller contact details.

## 3. Primary Route
- `/privacy`
- Linked from: Sign Up form, Footer, Org Setup wizard, Billing page

## 4. Required Sections

### 4.1 Data We Collect
- Account info: name, email, wallet address
- Usage data: actions submitted, tokens earned, leaderboard rankings
- Billing data: processed by Stripe (we do not store card numbers)
- Blockchain data: wallet transactions are publicly visible on-chain

### 4.2 How We Use Your Data
- Provide and improve the GreenToken service
- Process token rewards and redemptions
- Send transactional emails (action confirmed, trial expiring, etc.)
- Comply with legal obligations

### 4.3 Data Sharing
- Supabase: database and authentication hosting
- Stripe: payment processing (has its own DPA and privacy policy)
- Blockchain network: action verification records are public
- We never sell personal data to third parties

### 4.4 Data Retention
- Active account data retained while account exists
- Deleted org data purged within 30 days of deletion request
- Blockchain records are immutable and cannot be deleted

### 4.5 Your Rights (POPIA / GDPR)
- Right to access your personal data
- Right to correction
- Right to deletion (subject to blockchain immutability)
- Right to data portability (CSV export available in settings)
- Right to object to processing

### 4.6 Cookies
- Session cookies for authentication only
- No advertising or tracking cookies
- Analytics (if enabled) use privacy-preserving aggregate data

### 4.7 Security
- Data encrypted at rest and in transit (TLS)
- Supabase Row-Level Security enforces data isolation
- Smart contracts audited before mainnet deployment

### 4.8 Contact
- Privacy queries: privacy@greentoken.app
- Data Protection Officer: [Name], [Country]

## 5. Folder Structure
```
frontend/
├── components/
│   ├── PolicyHero.jsx
│   ├── PolicySection.jsx
│   └── PolicyTableOfContents.jsx
├── pages/
│   └── privacy.jsx
```

## 6. UX/UI Notes
- Use clean, readable typography — no legalese formatting.
- Table of contents with anchor links at top for long document navigation.
- "Last updated: 2026-06-02" prominently shown.
- Mobile: single-column, generous line height for readability.

## 7. Accessibility
- All headings use proper H2/H3 hierarchy.
- Links use descriptive text (not "click here").
- Page is printable (CSS print styles apply readable formatting).

## 8. Legal Note
This placeholder covers typical SaaS requirements. Have a qualified legal professional review before launch, especially for POPIA (South Africa) and GDPR (EU) compliance if applicable.
