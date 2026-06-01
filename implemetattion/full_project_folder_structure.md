# Community GreenToken Full Project Folder Structure

This document provides a **professional directory layout** for the Community GreenToken web application, including frontend, backend, database, smart contracts, and assets. It also includes recommended naming conventions and organization of reusable components, API routes, and pages.

---

## 1. Root Directory Layout
```
community-greentoken/
│
├─ README.md
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ .env.local
├─ /frontend/
├─ /backend/
├─ /contracts/
├─ /database/
├─ /assets/
├─ /tests/
└─ /documentation/
```

## 2. Frontend Directory
```
/frontend/
│
├─ /components/       # Reusable UI components (buttons, cards, forms, modals)
├─ /pages/            # Next.js pages
│   ├─ index.jsx       # Landing page
│   ├─ feature.jsx     # Action submission page
│   ├─ dashboard.jsx   # Dashboard with tokens, leaderboard, analytics
│   ├─ redeem.jsx      # Token redemption page
│   └─ donations.jsx   # Donation tracking page
├─ /styles/           # Tailwind config and global styles
├─ /hooks/            # Custom React hooks
└─ /utils/            # Utility functions and constants
```

## 3. Backend Directory
```
/backend/
│
├─ /api/              # Next.js API routes
│   ├─ actions.js      # Submit and verify actions
│   ├─ tokens.js       # Token balance and redemption
│   ├─ leaderboard.js  # Leaderboard API
│   ├─ analytics.js    # Analytics/AI metrics
│   └─ donations.js    # Donation tracking API
├─ /services/         # Business logic modules
├─ /middleware/       # Authentication, error handling, validation
└─ /utils/            # Backend utilities
```

## 4. Smart Contracts Directory
```
/contracts/
│
├─ GreenToken.sol     # Token smart contract
├─ ActionRegistry.sol # Action verification contract
├─ RewardManager.sol  # Token redemption and donation contract
└─ /tests/            # Contract unit and integration tests
```

## 5. Database Directory
```
/database/
│
├─ schema.sql         # SQL schema definition
├─ seed_data.sql      # Initial seed data
└─ migrations/        # Versioned database migrations
```

## 6. Assets Directory
```
/assets/
│
├─ /images/           # Logos, icons, illustrations
├─ /videos/           # Demo or promotional videos
└─ /fonts/            # Custom fonts
```

## 7. Tests Directory
```
/tests/
│
├─ frontend/          # React component and page tests
├─ backend/           # API route tests
└─ contracts/         # Smart contract tests
```

## 8. Documentation Directory
```
/documentation/
│
├─ architecture/      # Architecture MD files
├─ implementation/    # Implementation MD files
└─ branding/          # Branding and problem statement MD files
```

## 9. Naming Conventions
- **Folders:** lowercase, hyphen-separated (e.g., `/backend/`, `/frontend/`)
- **Files:** lowercase, hyphen-separated, descriptive (e.g., `token-balance.js`)
- **Components:** PascalCase (e.g., `ActionCard.jsx`)
- **Hooks:** camelCase (e.g., `useTokenBalance.js`)
- **API Routes:** camelCase for filenames (e.g., `actions.js`) or grouped by feature.

## 10. Reusable Component Organization
- Buttons, cards, modals, forms, tables placed in `/components/`
- Separate folders per feature if large (e.g., `/components/dashboard/`)
- Shared utilities in `/utils/` for frontend/backend consistency.

This structure ensures a **scalable, maintainable, and hackathon-ready project organization**, making onboarding and collaborative development efficient.

