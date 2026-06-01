# Community GreenToken MVP, User Journey, Architecture, and Backend

## 1. Core MVP Features
- **Action Verification:** Users log sustainable actions (recycling, tree planting, etc.) that are verified by the system.
- **Token Reward:** Verified actions trigger token minting via the GreenToken smart contract.
- **Token Redemption:** Users can redeem tokens for rewards, donations, or community benefits.
- **Dashboard:** Real-time overview of token balances, achievements, and participation.
- **Mandatory Enhancements:** Leaderboard, Analytics/Impact Metrics, Donation Tracking. These features are integral for engagement, tracking, and community impact visualization.

## 2. User Journey
1. **Landing Page:** Users learn about the platform, understand benefits, and see call-to-action.
2. **Action Submission:** Users submit or verify their sustainable actions.
3. **Token Reward:** Actions are verified and tokens are credited.
4. **Dashboard:** Users monitor their token balance, achievements, and impact.
5. **Redemption:** Users redeem tokens for rewards or donate them to projects.
6. **Leaderboard & Analytics:** Users view rankings, track community-wide participation, environmental impact, and token distribution.
7. **Donation Tracking:** Users allocate tokens toward community projects with transparent records.

## 3. Information Architecture
- **Pages/Screens:** Landing, Main Feature, Dashboard, Token Redemption, Leaderboard, Analytics/Impact Metrics, Donation Tracking.
- **Navigation:** Simple top or side menu with direct access to main features and dashboard.
- **Content Hierarchy:** Hero section → Main feature call-to-action → Token balance/achievements → Redemption/impact summary → Leaderboard & analytics.
- **Responsive Design:** Mobile-first, with adaptable layouts for tablets and desktops.

## 4. Backend / Data Requirements
- **Database:** Supabase project using Project URL and Anonymous Key.
- **Tables:** Users, Actions, Token Balances, Redemption Logs, Leaderboard Rankings, Analytics Metrics, Donation Records.
- **APIs:** Next.js (JSX) API routes with reusable components for action submission, verification, token reward, leaderboard, analytics, and donation tracking.
- **Authentication:** Wallet integration or Supabase Auth (if needed).
- **Data Flow:** 
  - User submits action → Next.js API route validates → Smart contract mints token → Dashboard updates → Leaderboard/analytics/donation metrics updated → Optional AI/analytics integration for deeper insights.

## 5. Smart Contract Interactions
- **GreenToken Contract:** Minting, transferring, and burning tokens.
- **ActionRegistry Contract:** Logging and verifying sustainable actions.
- **RewardManager Contract:** Redeeming tokens for rewards or donations.
- **Security:** Ensure only authorized users or admins can verify actions and mint tokens.

## 6. Technical Considerations
- Frontend: Next.js + TypeScript + Tailwind CSS + shadcn/ui, with reusable components.
- Backend: Next.js API routes for serverless logic.
- Database: Supabase (Project URL + Anonymous Key) for secure, serverless data handling.
- Deployment: Vercel.
- Integration with AI/analytics APIs for tracking insights, engagement metrics, leaderboard updates, and donation transparency.

This document now reflects that **Leaderboard, Analytics/Impact Metrics, and Donation Tracking are mandatory features** of the Community GreenToken web application MVP, ensuring a comprehensive, hackathon-ready specification.