# Community GreenToken — Complete Design Specification

**Extracted from:** All 13 mockup PNG files  
**Stack:** React + Next.js + Tailwind CSS  
**Date:** 2026-06-03

---

## Table of Contents

1. [Design Tokens — Colors](#1-design-tokens--colors)
2. [Typography](#2-typography)
3. [Spacing & Layout](#3-spacing--layout)
4. [Shadows & Borders](#4-shadows--borders)
5. [Icon Guide](#5-icon-guide)
6. [Component Library](#6-component-library)
   - Navbar (Public)
   - Sidebar (App)
   - Top App Bar
   - Stat Card
   - Feature Card
   - Reward Card
   - Donation Card
   - Leaderboard Table Row
   - Progress Bar
   - Button System
   - Badge / Status Tag
   - Form Input
   - Modal
   - Data Table
   - Pricing Card
   - Avatar
   - Plan Usage Bar
   - Notification Toast
7. [Page-Level Layout Patterns](#7-page-level-layout-patterns)
8. [Tailwind Config Extension](#8-tailwind-config-extension)
9. [Animation & Interaction Tokens](#9-animation--interaction-tokens)
10. [Accessibility Tokens](#10-accessibility-tokens)

---

## 1. Design Tokens — Colors

### Brand Palette

```js
// tailwind.config.js → theme.extend.colors
colors: {
  primary: {
    50:  '#f0fdf4',  // bg-primary-50  — page sections, subtle bg
    100: '#dcfce7',  // bg-primary-100 — badge bg, hover tints
    200: '#bbf7d0',  // bg-primary-200 — selected states
    300: '#86efac',  // bg-primary-300 — chart fills
    400: '#4ade80',  // bg-primary-400 — icon fills
    500: '#22c55e',  // bg-primary-500 — PRIMARY: buttons, active nav, icons ★
    600: '#16a34a',  // bg-primary-600 — hover state for primary buttons
    700: '#15803d',  // bg-primary-700 — dark sections, footer header bg
    800: '#166534',  // bg-primary-800 — CTA banners, dark nav
    900: '#14532d',  // bg-primary-900 — footer background
    950: '#052e16',  // bg-primary-950 — deepest dark green
  },
}
```

### Semantic Color Map

| Token | Hex | Tailwind Class | Use |
|---|---|---|---|
| `--color-bg-page` | `#ffffff` | `bg-white` | Page background |
| `--color-bg-surface` | `#f9fafb` | `bg-gray-50` | Card/section bg |
| `--color-bg-subtle` | `#f0fdf4` | `bg-primary-50` | Light green tint sections |
| `--color-bg-sidebar` | `#ffffff` | `bg-white` | Sidebar background |
| `--color-bg-topbar` | `#ffffff` | `bg-white` | Top app bar |
| `--color-border` | `#e5e7eb` | `border-gray-200` | Card/input borders |
| `--color-border-focus` | `#22c55e` | `ring-primary-500` | Input focus ring |
| `--color-text-primary` | `#111827` | `text-gray-900` | Headings |
| `--color-text-body` | `#374151` | `text-gray-700` | Body text |
| `--color-text-secondary` | `#6b7280` | `text-gray-500` | Captions, labels |
| `--color-text-muted` | `#9ca3af` | `text-gray-400` | Placeholders |
| `--color-text-inverse` | `#ffffff` | `text-white` | Text on dark bg |
| `--color-text-brand` | `#16a34a` | `text-primary-600` | Brand text accents |
| `--color-success` | `#22c55e` | `text-green-500` | Success states |
| `--color-warning` | `#f59e0b` | `text-amber-500` | Warning/trial |
| `--color-error` | `#ef4444` | `text-red-500` | Error/past due |
| `--color-info` | `#3b82f6` | `text-blue-500` | Info/analytics |
| `--color-token` | `#22c55e` | `text-primary-500` | Token/coin displays |
| `--color-trophy` | `#f59e0b` | `text-amber-500` | Leaderboard trophy |

### Status Badge Colors

```
Available / Active / Completed:  bg-green-100   text-green-700
Ongoing / In Progress:           bg-blue-100    text-blue-700
Trialing / Warning:              bg-amber-100   text-amber-700
Past Due / Error:                bg-red-100     text-red-600
Canceled / Inactive:             bg-gray-100    text-gray-600
```

---

## 2. Typography

### Font Family

```css
/* Google Font — Import in _document.tsx or globals.css */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

/* tailwind.config.js */
fontFamily: {
  sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui'],
}
```

### Type Scale

| Role | Size | Weight | Line Height | Tailwind |
|---|---|---|---|---|
| Display / Hero H1 | 56–64px | 800 | 1.1 | `text-5xl lg:text-6xl font-extrabold leading-tight` |
| H1 (landing section) | 40–48px | 700 | 1.2 | `text-4xl lg:text-5xl font-bold leading-tight` |
| H1 (dashboard page) | 28–32px | 700 | 1.25 | `text-2xl md:text-3xl font-bold` |
| H2 (section title) | 24–28px | 700 | 1.3 | `text-2xl font-bold text-gray-900` |
| H3 (card title) | 18–20px | 600 | 1.4 | `text-lg font-semibold text-gray-900` |
| H4 (sub-label) | 15–16px | 600 | 1.5 | `text-base font-semibold text-gray-800` |
| Body Large | 16px | 400 | 1.6 | `text-base text-gray-600` |
| Body | 14px | 400 | 1.6 | `text-sm text-gray-600` |
| Caption / Label | 12–13px | 500 | 1.5 | `text-xs font-medium text-gray-500` |
| Micro / Badge | 11–12px | 600 | 1.4 | `text-xs font-semibold` |
| Stat Number | 32–40px | 700 | 1.1 | `text-3xl md:text-4xl font-bold text-gray-900` |
| Stat Label | 12–13px | 400 | 1.5 | `text-xs text-gray-500` |
| Nav Link | 14px | 500 | — | `text-sm font-medium text-gray-700` |
| Button Large | 15–16px | 600 | — | `text-sm md:text-base font-semibold` |
| Button Small | 13–14px | 500 | — | `text-xs font-medium` |

### Typography Examples

```jsx
// Hero Heading
<h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
  Rewarding Sustainable{' '}
  <span className="text-primary-600">Actions.</span>
</h1>

// Section Heading
<h2 className="text-2xl font-bold text-gray-900">How It Works</h2>

// Dashboard Page Title
<h1 className="text-2xl font-bold text-gray-900">Welcome back, GreenUser! 🌿</h1>

// Stat Number
<p className="text-3xl font-bold text-gray-900">1,250</p>
<p className="text-xs text-gray-500 mt-0.5">Token Balance</p>

// Body text
<p className="text-sm text-gray-600 leading-relaxed">
  Community GreenToken rewards real-world eco-friendly actions.
</p>

// Green accent text
<span className="text-primary-600 font-semibold">+12% from last week</span>
```

---

## 3. Spacing & Layout

### Page Layout Structure

```
┌─────────────────────────────────────────────┐
│ Sidebar (w-60) │ Main Content (flex-1)       │
│                │  ┌─ Top Bar (h-16) ────────┐│
│                │  │                         ││
│                │  └─────────────────────────┘│
│                │  ┌─ Page Content ──────────┐│
│                │  │  p-6 md:p-8             ││
│                │  └─────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Spacing Tokens

| Token | Value | Tailwind |
|---|---|---|
| Page horizontal padding | 24px | `px-6` |
| Page vertical padding | 32px | `py-8` |
| Card padding | 20–24px | `p-5` or `p-6` |
| Card padding compact | 16px | `p-4` |
| Section gap | 24px | `gap-6` or `space-y-6` |
| Card gap | 16px | `gap-4` |
| Inner element gap | 12px | `gap-3` |
| Tight gap | 8px | `gap-2` |
| Sidebar width | 240px | `w-60` |
| Top bar height | 64px | `h-16` |
| Container max width | 1280px | `max-w-7xl mx-auto` |

### Grid Patterns

```jsx
// Stat cards — 4 across
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4" />

// Feature cards — 3 across
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />

// Reward cards — 3 across
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" />

// Dashboard split — chart + sidebar panel
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">  {/* chart */}  </div>
  <div>                            {/* panel */}  </div>
</div>

// Sign In / Sign Up split layout
<div className="flex min-h-screen">
  <div className="hidden lg:flex lg:w-1/2">  {/* hero image */}  </div>
  <div className="w-full lg:w-1/2 flex items-center justify-center p-8">  {/* form */}  </div>
</div>
```

---

## 4. Shadows & Borders

### Shadow Scale

```js
// tailwind.config.js
boxShadow: {
  'card':    '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  'modal':   '0 25px 50px -12px rgb(0 0 0 / 0.20)',
  'dropdown':'0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
}
```

| Component | Shadow | Tailwind |
|---|---|---|
| Stat card | card | `shadow-card` (custom) or `shadow-sm` |
| Feature card | card-md on hover | `hover:shadow-md transition-shadow` |
| Reward card | card-md | `shadow-md` |
| Sidebar | right side | `shadow-sm` or `border-r border-gray-200` |
| Top bar | bottom | `border-b border-gray-100 shadow-sm` |
| Modal | modal | `shadow-xl` or `shadow-2xl` |
| Dropdown | dropdown | `shadow-lg` |
| Button hover | subtle | `hover:shadow-md` |

### Border Radius

| Component | Radius | Tailwind |
|---|---|---|
| Page card | 12–16px | `rounded-xl` or `rounded-2xl` |
| Button large | 8px | `rounded-lg` |
| Button small | 6px | `rounded-md` |
| Badge / tag | full | `rounded-full` |
| Input field | 8–10px | `rounded-lg` |
| Avatar | full | `rounded-full` |
| Modal | 16px | `rounded-2xl` |
| Progress bar | full | `rounded-full` |
| Reward card image | top only | `rounded-t-xl` |
| Chart container | 12px | `rounded-xl` |
| Sidebar nav active | 8px | `rounded-lg` |

---

## 5. Icon Guide

### Icon Library: Heroicons v2 + Lucide React

```bash
npm install @heroicons/react lucide-react
```

### Navigation Icons

```jsx
import {
  HomeIcon,           // Dashboard
  BoltIcon,           // Actions / Submit Action
  GiftIcon,           // Redeem Tokens / Rewards
  HeartIcon,          // Donations
  TrophyIcon,         // Leaderboard
  ChartBarIcon,       // Analytics
  UsersIcon,          // Community / Members
  Cog6ToothIcon,      // Settings
  ShieldCheckIcon,    // Security / Verified
  BuildingOfficeIcon, // Organizations
  CreditCardIcon,     // Billing
} from '@heroicons/react/24/outline';

// Active state: use solid variant
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
```

### Action / UI Icons

```jsx
import {
  BellIcon,             // Notifications
  MagnifyingGlassIcon,  // Search
  FunnelIcon,           // Filter
  ArrowsUpDownIcon,     // Sort
  ChevronDownIcon,      // Dropdown
  ChevronRightIcon,     // Navigation arrow
  XMarkIcon,            // Close / dismiss
  CheckIcon,            // Success checkmark
  CheckCircleIcon,      // Verified state
  PlusIcon,             // Add / create
  PencilIcon,           // Edit
  TrashIcon,            // Delete
  EyeIcon,              // Show password / view
  EyeSlashIcon,         // Hide password
  ArrowUpIcon,          // Trend up (green)
  ArrowDownIcon,        // Trend down (red)
  ArrowRightIcon,       // Step navigation
  CalendarIcon,         // Date picker
  ArrowUpTrayIcon,      // Upload
  ArrowDownTrayIcon,    // Download / export
  ShareIcon,            // Share
  ClipboardIcon,        // Copy link
  InformationCircleIcon,// Info tooltip
  ExclamationTriangleIcon, // Warning
  LockClosedIcon,       // Locked feature (plan gate)
} from '@heroicons/react/24/outline';
```

### Eco / Domain Icons (Lucide React)

```jsx
import {
  Leaf,          // Sidebar bottom illustration / brand accent
  Recycle,       // Recycling action
  TreePine,      // Tree planting
  Droplets,      // Water saving
  Zap,           // Energy saving
  Car,           // Carpooling
  Globe,         // Community / global impact
  Coins,         // Token / coin balance
  Award,         // Achievements / badges
  TrendingUp,    // Growth chart
} from 'lucide-react';
```

### Icon Sizing

| Context | Size | Tailwind |
|---|---|---|
| Navigation sidebar | 20px | `w-5 h-5` |
| Stat card icon | 24px | `w-6 h-6` |
| Feature card icon | 32px | `w-8 h-8` |
| Button icon | 18–20px | `w-4.5 h-4.5` or `w-5 h-5` |
| Badge icon | 14–16px | `w-3.5 h-3.5` or `w-4 h-4` |
| Hero illustration | 48–64px | `w-12 h-12` or `w-16 h-16` |
| Modal header | 32px | `w-8 h-8` |
| Trend arrow | 14px | `w-3.5 h-3.5` |

### Icon Color Patterns

```jsx
// Active nav item
<HomeIconSolid className="w-5 h-5 text-primary-600" />

// Stat card icon containers
<div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
  <BoltIcon className="w-6 h-6 text-primary-600" />
</div>

// Trend up (positive)
<ArrowUpIcon className="w-3.5 h-3.5 text-green-500" />

// Trend down (negative)
<ArrowDownIcon className="w-3.5 h-3.5 text-red-500" />

// Locked feature (plan gate)
<LockClosedIcon className="w-4 h-4 text-gray-400" />
```

---

## 6. Component Library

---

### 6.1 Navbar (Public Pages)

```jsx
// components/Navbar.jsx
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="/branding/community-greentoken-logo.png" alt="Community GreenToken" className="h-9 w-auto" />
          <span className="text-base font-bold text-gray-900 hidden sm:block">Community GreenToken</span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {['How It Works', 'Impact', 'Leaderboard', 'Redeem', 'About Us'].map(link => (
            <a key={link} href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
              {link}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <a href="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
            Sign In
          </a>
          <a href="/org/setup" className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition shadow-sm">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
```

---

### 6.2 Sidebar (App / Dashboard)

```jsx
// components/Sidebar.jsx
const NAV_ITEMS = [
  { label: 'Dashboard',     href: '/dashboard',   icon: HomeIcon,       iconSolid: HomeIconSolid },
  { label: 'Actions',       href: '/feature',     icon: BoltIcon },
  { label: 'Rewards',       href: '/redeem',      icon: GiftIcon },
  { label: 'Donations',     href: '/donations',   icon: HeartIcon },
  { label: 'Leaderboard',   href: '/leaderboard', icon: TrophyIcon },
  { label: 'Analytics',     href: '/analytics',   icon: ChartBarIcon },
  { label: 'Settings',      href: '/settings',    icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-gray-100 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <img src="/branding/community-greentoken-logo.png" alt="" className="h-8 w-8" />
        <span className="text-sm font-bold text-gray-900 leading-tight">Community<br/>GreenToken</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <a key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
              {label}
            </a>
          );
        })}
      </nav>

      {/* Bottom image + CTA */}
      <div className="px-4 pb-5 mt-auto">
        <img
          src="/assets/image/sidebar/sidebar_bottom_all_pages.png"
          alt="Community GreenToken — together we create a greener tomorrow"
          className="w-full max-w-[160px] mx-auto h-auto object-contain mb-3"
          loading="lazy"
        />
        <p className="text-xs text-gray-500 text-center mb-2.5 leading-snug">
          Together we create a greener tomorrow
        </p>
        <a href="/how-it-works"
          className="flex items-center justify-center w-full py-2 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition">
          Learn More
        </a>
      </div>
    </aside>
  );
}
```

---

### 6.3 Top App Bar (Dashboard)

```jsx
// components/AppTopBar.jsx
export default function AppTopBar({ title }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm">

      {/* Page title / breadcrumb */}
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Date */}
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarIcon className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        {/* Token chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100">
          <Coins className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-primary-700">1,250</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition">
          <img src="/assets/image/branding/avatar_placeholder.png" alt="User" className="w-8 h-8 rounded-full object-cover" />
          <ChevronDownIcon className="w-4 h-4 text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
```

---

### 6.4 Stat Card

```jsx
// components/StatCard.jsx
export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, change, changeType }) {
  const positive = changeType === 'up';
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full
            ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {positive ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// Usage
<StatCard
  icon={Coins}
  iconBg="bg-primary-100"
  iconColor="text-primary-600"
  label="Token Balance"
  value="1,250"
  change="+12%"
  changeType="up"
/>
```

#### Stat Card Variants (from mockups)

| Stat | Icon | Icon BG | Icon Color |
|---|---|---|---|
| Token Balance | `Coins` | `bg-primary-100` | `text-primary-600` |
| Actions Completed | `CheckCircleIcon` | `bg-blue-100` | `text-blue-600` |
| Total Donations | `HeartIcon` | `bg-red-100` | `text-red-500` |
| CO₂ Offset | `Globe` | `bg-emerald-100` | `text-emerald-600` |
| Trees Planted | `TreePine` | `bg-green-100` | `text-green-600` |
| Members | `UsersIcon` | `bg-violet-100` | `text-violet-600` |
| MRR | `CreditCardIcon` | `bg-amber-100` | `text-amber-600` |

---

### 6.5 Feature Card (Landing Page)

```jsx
// components/FeatureCard.jsx
export default function FeatureCard({ icon: Icon, iconBg, iconColor, title, description }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
```

---

### 6.6 Reward Card

```jsx
// components/RewardCard.jsx
export default function RewardCard({ image, title, description, tokenCost, available, selected, onSelect }) {
  return (
    <div className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200
      ${selected ? 'border-primary-500 shadow-md' : 'border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md'}
      ${!available ? 'opacity-60' : ''}`}>

      {/* Availability badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full
          ${available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-3 left-3 z-10 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Image */}
      <div className="h-40 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-bold text-gray-900">{tokenCost} Tokens</span>
          </div>
          <button
            onClick={onSelect}
            disabled={!available}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
              ${selected
                ? 'bg-primary-500 text-white'
                : available
                  ? 'border border-primary-200 text-primary-600 hover:bg-primary-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {selected ? 'Selected ✓' : 'Select Reward'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 6.7 Donation Card

```jsx
// components/DonationCard.jsx
export default function DonationCard({ image, title, status, tokensRaised, tokensGoal, communityDonors }) {
  const pct = Math.min(100, Math.round((tokensRaised / tokensGoal) * 100));
  const statusColor = { Ongoing: 'bg-blue-100 text-blue-700', Completed: 'bg-green-100 text-green-700' };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <img src={image} alt={title} className="w-full h-36 object-cover" loading="lazy" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-900 flex-1 pr-2">{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[status]}`}>{status}</span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{tokensRaised.toLocaleString()} Tokens raised</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Goal: {tokensGoal.toLocaleString()} Tokens</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{communityDonors} donors</span>
          <button className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition">
            Donate More
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 6.8 Leaderboard Row

```jsx
// components/LeaderboardRow.jsx
const RANK_BADGE = {
  1: 'bg-yellow-400 text-white',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-amber-600 text-white',
};

export default function LeaderboardRow({ rank, avatar, name, handle, actions, tokens, isCurrentUser }) {
  return (
    <tr className={`border-b border-gray-50 hover:bg-gray-50 transition
      ${isCurrentUser ? 'bg-primary-50 border-primary-100' : ''}`}>
      <td className="px-4 py-3 w-12">
        <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold
          ${RANK_BADGE[rank] || 'bg-gray-100 text-gray-600'}`}>
          {rank}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-400">{handle}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 font-medium">{actions}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-semibold text-gray-900">{tokens.toLocaleString()}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {rank <= 3 && <TrophyIcon className={`w-5 h-5 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />}
      </td>
    </tr>
  );
}
```

---

### 6.9 Progress Bar

```jsx
// components/ProgressBar.jsx
export default function ProgressBar({ value, max, colorClass = 'bg-primary-500', showLabel = false }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
          <span className={pct > 90 ? 'text-amber-500 font-medium' : ''}>{pct}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}
            ${pct > 90 ? '!bg-amber-500' : ''} ${pct >= 100 ? '!bg-red-500' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

---

### 6.10 Button System

```jsx
// components/Button.jsx
const VARIANTS = {
  primary:   'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  outline:   'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
  ghost:     'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  success:   'bg-primary-500 hover:bg-primary-600 text-white shadow-sm',
  dark:      'bg-primary-800 hover:bg-primary-900 text-white shadow-sm',
};

const SIZES = {
  xs:  'px-3 py-1.5 text-xs rounded-md',
  sm:  'px-4 py-2   text-sm rounded-lg',
  md:  'px-5 py-2.5 text-sm rounded-lg',
  lg:  'px-6 py-3   text-base rounded-xl',
  xl:  'px-8 py-3.5 text-base rounded-xl',
};

export default function Button({ variant='primary', size='md', icon: Icon, iconRight, loading, disabled, children, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150
        ${VARIANTS[variant]} ${SIZES[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {!loading && Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
      {iconRight && !loading && <iconRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}
```

**Button Usage Examples from Mockups:**

```jsx
// Primary — Get Started, Submit Action, Upgrade
<Button variant="primary" size="lg">Get Started</Button>

// Outline — Watch How It Works, Connect Wallet
<Button variant="outline" size="md">Watch How It Works</Button>

// Ghost — Nav Sign In link
<Button variant="ghost" size="sm">Sign In</Button>

// Danger — Delete org, Remove member
<Button variant="danger" size="sm" icon={TrashIcon}>Delete</Button>

// Dark — Footer CTA banner
<Button variant="dark" size="lg">Explore Leaderboard</Button>

// With icon
<Button variant="primary" size="md" icon={BoltIcon}>Submit Action</Button>
```

---

### 6.11 Badge / Status Tag

```jsx
// components/Badge.jsx
const STYLES = {
  green:  'bg-green-100  text-green-700',
  blue:   'bg-blue-100   text-blue-700',
  amber:  'bg-amber-100  text-amber-700',
  red:    'bg-red-100    text-red-600',
  gray:   'bg-gray-100   text-gray-600',
  violet: 'bg-violet-100 text-violet-700',
};

export default function Badge({ color = 'gray', dot = false, children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${STYLES[color]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${STYLES[color].split(' ')[1].replace('text', 'bg')}`} />}
      {children}
    </span>
  );
}

// Usage
<Badge color="green" dot>Available</Badge>
<Badge color="blue" dot>Ongoing</Badge>
<Badge color="amber">Trial</Badge>
<Badge color="red" dot>Past Due</Badge>
<Badge color="gray">Completed</Badge>
```

---

### 6.12 Form Input

```jsx
// components/Input.jsx
export default function Input({ label, id, type='text', icon: Icon, error, hint, ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4.5 h-4.5 text-gray-400" />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm
            bg-white border rounded-lg text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition
            ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'}`}
          {...props}
        />
      </div>
      {error  && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// Select / Dropdown
export function Select({ label, id, options, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <select id={id} className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-lg
          text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none" {...props}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
```

---

### 6.13 Modal

```jsx
// components/Modal.jsx
export default function Modal({ open, onClose, title, children, icon: Icon, iconColor = 'text-primary-500' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Icon */}
        {Icon && (
          <div className={`w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        )}

        {title && <h3 className="text-lg font-bold text-gray-900 text-center mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

// Success modal variant (from Redemption mockup)
<Modal open={success} onClose={handleClose} icon={CheckCircleIcon} iconColor="text-primary-500" title="Redemption Successful!">
  <p className="text-sm text-gray-500 text-center mb-5">
    You have successfully redeemed your tokens for Tree Planting.
  </p>
  <Button variant="primary" className="w-full" onClick={handleClose}>Close</Button>
</Modal>
```

---

### 6.14 Data Table

```jsx
// components/DataTable.jsx
export default function DataTable({ columns, data, caption }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {columns.map(col => (
              <th key={col.key} scope="col"
                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 6.15 Pricing Card

```jsx
// components/PricingCard.jsx
export default function PricingCard({ name, price, description, features, cta, highlight, badge }) {
  return (
    <div className={`relative flex flex-col bg-white rounded-2xl p-7 border-2 transition-all
      ${highlight ? 'border-primary-500 shadow-lg' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'}`}>

      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">{badge}</span>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-900">{name}</h3>
      <div className="my-4">
        {price === null
          ? <p className="text-3xl font-bold text-gray-900">Custom</p>
          : <p className="text-3xl font-bold text-gray-900">
              <span className="text-lg font-normal text-gray-400">$</span>{price}
              <span className="text-sm font-normal text-gray-400">/mo</span>
            </p>}
      </div>
      <p className="text-sm text-gray-500 mb-5">{description}</p>

      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <CheckIcon className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600">{f}</span>
          </li>
        ))}
      </ul>

      <Button variant={highlight ? 'primary' : 'outline'} size="md" className="w-full">{cta}</Button>
    </div>
  );
}
```

---

### 6.16 Plan Usage Bar (Billing / Org Admin)

```jsx
// components/PlanUsageBar.jsx
export default function PlanUsageBar({ used, limit, planName, onUpgrade }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warning = pct >= 80;
  const critical = pct >= 95;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Member Capacity</span>
          <span className="ml-2 text-xs text-gray-400">({planName})</span>
        </div>
        <span className={`text-xs font-semibold ${critical ? 'text-red-500' : warning ? 'text-amber-500' : 'text-gray-500'}`}>
          {used.toLocaleString()} / {limit ? limit.toLocaleString() : '∞'}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${critical ? 'bg-red-500' : warning ? 'bg-amber-400' : 'bg-primary-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {warning && (
        <p className={`text-xs ${critical ? 'text-red-500' : 'text-amber-500'} flex items-center gap-1`}>
          <ExclamationTriangleIcon className="w-3.5 h-3.5" />
          {critical ? 'At limit — upgrade now' : 'Approaching plan limit'}
          {onUpgrade && (
            <button onClick={onUpgrade} className="ml-1 underline font-medium">Upgrade Plan</button>
          )}
        </p>
      )}
    </div>
  );
}
```

---

### 6.17 Notification Toast

```jsx
// components/Toast.jsx
const TOAST_STYLES = {
  success: { icon: CheckCircleIcon, bg: 'bg-green-50 border-green-200',  text: 'text-green-800', icon: 'text-green-500' },
  error:   { icon: XMarkIcon,       bg: 'bg-red-50   border-red-200',    text: 'text-red-800',   icon: 'text-red-500'   },
  warning: { icon: ExclamationTriangleIcon, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' },
  info:    { icon: InformationCircleIcon, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: 'text-blue-500' },
};

export default function Toast({ type = 'success', message, onDismiss }) {
  const { bg, text, icon: color } = TOAST_STYLES[type];
  const Icon = TOAST_STYLES[type].icon;
  return (
    <div className={`flex items-start gap-3 max-w-sm w-full rounded-xl border px-4 py-3 shadow-lg ${bg}
      animate-in slide-in-from-right-5 duration-300`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
      <p className={`flex-1 text-sm font-medium ${text}`}>{message}</p>
      <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## 7. Page-Level Layout Patterns

### 7.1 App Layout (Dashboard / Admin Pages)

```jsx
// components/AppLayout.jsx
export default function AppLayout({ children, title }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppTopBar title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 7.2 Public Layout (Landing / About / Pricing)

```jsx
// components/PublicLayout.jsx
export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### 7.3 Auth Layout (Sign In / Sign Up)

```jsx
// components/AuthLayout.jsx
export default function AuthLayout({ heroImage, heroAlt, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Hero side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={heroImage} alt={heroAlt} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 7.4 Dashboard Stat Row

```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <StatCard icon={Coins}         iconBg="bg-primary-100" iconColor="text-primary-600" label="Token Balance"     value="1,250"  change="+12%"  changeType="up"   />
  <StatCard icon={CheckCircleIcon} iconBg="bg-blue-100"  iconColor="text-blue-600"   label="Actions Completed" value="24"     change="+8%"   changeType="up"   />
  <StatCard icon={HeartIcon}     iconBg="bg-red-100"     iconColor="text-red-500"    label="Total Donations"   value="$320"   change="-3%"   changeType="down" />
  <StatCard icon={Globe}         iconBg="bg-emerald-100" iconColor="text-emerald-600" label="CO₂ Offset"       value="24.6 kg" change="+15%" changeType="up"   />
</div>
```

### 7.5 Dashboard Two-Column Grid

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Chart — takes 2/3 */}
  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-gray-900 mb-4">Analytics Overview</h3>
    {/* <LineChart /> */}
  </div>

  {/* Leaderboard panel — takes 1/3 */}
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-gray-900 mb-4">Leaderboard</h3>
    {/* <LeaderboardMini /> */}
  </div>
</div>
```

---

## 8. Tailwind Config Extension

```js
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./pages/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', ...fontFamily.sans],
      },
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // ← MAIN BRAND COLOR
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: {
          yellow: '#f59e0b',
          blue:   '#3b82f6',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08)',
        'modal':   '0 25px 50px -12px rgb(0 0 0 / 0.20)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },
      animation: {
        'count-up':   'countUp 1s ease-out forwards',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'bar-fill':   'barFill 0.8s ease-out forwards',
      },
      keyframes: {
        countUp:  { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        barFill:  { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('tailwindcss-animate'),
  ],
};
```

---

## 9. Animation & Interaction Tokens

| Interaction | Duration | Easing | Tailwind |
|---|---|---|---|
| Button hover | 150ms | ease-out | `transition duration-150` |
| Card hover lift | 200ms | ease-out | `hover:-translate-y-1 transition-all duration-200` |
| Card shadow grow | 200ms | ease-out | `hover:shadow-md transition-shadow duration-200` |
| Sidebar nav item | 100ms | ease-out | `transition-colors duration-100` |
| Progress bar fill | 500ms | ease-out | `transition-all duration-500` |
| Modal backdrop | 200ms | ease-out | `animate-in fade-in duration-200` |
| Modal card | 200ms | ease-out | `animate-in zoom-in-95 duration-200` |
| Toast slide-in | 300ms | ease-out | `animate-in slide-in-from-right-5 duration-300` |
| Page skeleton pulse | 1500ms | — | `animate-pulse` |
| Stat count-up | 1000ms | ease-out | `animate-count-up` |
| Dropdown open | 150ms | ease-out | `animate-in fade-in-0 zoom-in-95` |
| Color fill gradient | 800ms | ease-out | `animate-bar-fill` |

### Hover State Pattern

```jsx
// Standard card hover
className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"

// Button hover
className="hover:bg-primary-600 active:bg-primary-700 transition-colors duration-150"

// Nav item hover
className="hover:bg-gray-50 hover:text-gray-900 transition-colors duration-100"

// Icon hover
className="hover:text-primary-600 transition-colors duration-150"
```

---

## 10. Accessibility Tokens

| Element | Class | Note |
|---|---|---|
| Focus ring | `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2` | All interactive elements |
| Skip link | `sr-only focus:not-sr-only` | First element in body |
| Screen reader only | `sr-only` | Labels not visually needed |
| Reduced motion | `motion-reduce:transition-none motion-reduce:animate-none` | All animations |
| Min touch target | `min-w-[44px] min-h-[44px]` | Mobile buttons/icons |
| ARIA live region | `role="status"` or `role="alert"` | Dynamic content |
| Color contrast | WCAG AA: 4.5:1 text, 3:1 large | All text on bg |

### Contrast Reference

| Text Color | Background | Ratio | Pass |
|---|---|---|---|
| `gray-900` on `white` | `#111827` on `#fff` | 18:1 | ✅ AAA |
| `gray-700` on `white` | `#374151` on `#fff` | 10:1 | ✅ AAA |
| `gray-500` on `white` | `#6b7280` on `#fff` | 5.7:1 | ✅ AA |
| `white` on `primary-500` | `#fff` on `#22c55e` | 2.9:1 | ⚠️ Use `primary-600` instead |
| `white` on `primary-600` | `#fff` on `#16a34a` | 4.6:1 | ✅ AA |
| `primary-700` on `primary-50` | on `#f0fdf4` | 7.2:1 | ✅ AAA |
| `red-600` on `red-50` | on `#fef2f2` | 5.1:1 | ✅ AA |

> **Important:** Always use `primary-600` (`#16a34a`) or darker for white text on green backgrounds — `primary-500` alone fails WCAG AA.

---

## Quick Reference Card

```
COLORS ──────────────────────────────────────────────────────────
Brand:     #22c55e  (primary-500)   bg-primary-500
Brand Btn: #16a34a  (primary-600)   bg-primary-600
Dark:      #166534  (primary-800)   bg-primary-800
Page:      #ffffff               bg-white
Surface:   #f9fafb               bg-gray-50
Text H:    #111827               text-gray-900
Text B:    #374151               text-gray-700
Text S:    #6b7280               text-gray-500
Border:    #e5e7eb               border-gray-200

TYPOGRAPHY ──────────────────────────────────────────────────────
Font:   Poppins (Google Fonts)
Hero:   text-5xl font-extrabold
H1:     text-3xl font-bold
H2:     text-2xl font-bold
H3:     text-lg font-semibold
Body:   text-sm text-gray-600
Stat:   text-3xl font-bold

SPACING ─────────────────────────────────────────────────────────
Page:   px-6 py-8
Card:   p-5 or p-6
Grid:   gap-4 (tight) | gap-6 (cards) | gap-8 (sections)
Sidebar: w-60

RADIUS ──────────────────────────────────────────────────────────
Cards:   rounded-xl or rounded-2xl
Buttons: rounded-lg
Badges:  rounded-full
Inputs:  rounded-lg
Modals:  rounded-2xl

SHADOWS ─────────────────────────────────────────────────────────
Cards:   shadow-sm → hover:shadow-md
Modals:  shadow-2xl
Topbar:  border-b border-gray-100 shadow-sm
```

---

*Generated by AI inspection of 13 Community GreenToken mockup PNG files.*  
*Stack: React 18 + Next.js 14 + Tailwind CSS 3.x + Heroicons v2 + Lucide React*
