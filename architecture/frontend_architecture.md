# Community GreenToken Frontend Architecture

This document outlines the **frontend architecture** for the Community GreenToken web application, detailing component hierarchy, reusable components, page layouts, routing, state management, and data fetching.

---

## 1. Component Hierarchy
- **App Layout**
  - Header (Navigation, Branding, User Info)
  - Main Content Area
    - Pages rendered based on routing
  - Footer (Links, Contact, Social Media)
- **Pages**
  - Landing Page
  - Main Feature Page (Action Submission)
  - Dashboard (Token Balances, Leaderboard, Analytics)
  - Token Redemption Page
  - Donation Tracking Page
- **Global Components**
  - Navbar
  - Sidebar
  - Modal / Dialogs
  - Notifications / Toasts
  - Loader / Skeletons
  - Buttons, Cards, Forms, Inputs

## 2. Reusable Components
- **ActionCard:** Displays individual action details, status, and token reward.
- **TokenBalance:** Shows current token count and progress.
- **LeaderboardEntry:** Represents a single leaderboard participant.
- **DonationCard:** Tracks user donations and projects supported.
- **AnalyticsChart:** Displays participation and impact metrics using charts.
- **Modal/Popup:** Reusable modal for confirmations, errors, or informational messages.
- **Button & Form Controls:** Standardized for consistent UI/UX across the app.

## 3. Page Layouts and Routing
- **Routing:** Next.js pages directory structure
  - `/` → Landing Page
  - `/feature` → Main Feature Page
  - `/dashboard` → Dashboard (tokens, leaderboard, analytics)
  - `/redeem` → Token Redemption Page
  - `/donations` → Donation Tracking Page
- **Layouts:**
  - Common layout wrapper for all pages
  - Responsive design with mobile-first approach
  - Sidebar navigation for logged-in users
  - Hero sections for landing pages with clear CTA

## 4. State Management and Data Fetching
- **State Management:**
  - React Context for global state (user session, token balances)
  - Local component state for forms, modals, and temporary UI states
  - Optional: Zustand or Redux for complex state handling if needed
- **Data Fetching:**
  - Next.js API routes for CRUD operations (Supabase, Smart Contracts, AI/Analytics)
  - SWR or React Query for data caching and real-time updates
  - Axios / Fetch for serverless API calls
  - Optimistic UI updates for token minting, action verification, and redemptions

This frontend architecture ensures a **modular, scalable, and reusable system** that supports the Community GreenToken MVP, mandatory features, and provides a polished user experience for hackathon demonstrations.

