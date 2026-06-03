# Community GreenToken — Sidebar Bottom Image Guide (All Pages)

## Sidebar Image

**File:** `assets/image/sidebar/sidebar_bottom_all_pages.png`  
**Source:** `sidebar/sidebarforbottomfor allpages.png` (original)  
**Dimensions:** 1254 × 1254 px | **Format:** PNG RGB  
**Purpose:** Decorative illustration placed at the **bottom-left of the sidebar** across ALL pages that have a sidebar.

---

## Which Pages Use This Sidebar Image

| Page | Route | Sidebar Present | Image Used |
|---|---|---|---|
| Dashboard | `/dashboard` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Action Submission | `/feature` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Token Redemption | `/redeem` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Donation Tracking | `/donations` | ✅ Yes | `sidebar_bottom_all_pages.png` (primary), `green_earth_and_sprout.png` (optional alt) |
| Leaderboard | `/leaderboard` | ✅ Yes | `sidebar_bottom_all_pages.png` (primary), `eco_achievement_trophy_plants.png` (optional alt) |
| Analytics | `/analytics` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Org Admin | `/org/admin` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Billing | `/org/admin/billing` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Members | `/org/admin/members` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Org Settings | `/org/admin/settings` | ✅ Yes | `sidebar_bottom_all_pages.png` |
| Sign In | `/signin` | ❌ No sidebar | — |
| Sign Up | `/signup` | ❌ No sidebar | — |
| Landing | `/` | ❌ No sidebar | — |
| About Us | `/about` | ❌ No sidebar | — |
| How It Works | `/how-it-works` | ❌ No sidebar | — |
| Pricing | `/pricing` | ❌ No sidebar | — |
| Impact | `/impact` | ❌ No sidebar | — |

---

## Reusable Sidebar Bottom Component

```jsx
// components/SidebarBottomImage.jsx
export default function SidebarBottomImage() {
  return (
    <div className="mt-auto p-4 flex justify-center">
      <img
        src="/assets/images/sidebar/sidebar_bottom_all_pages.png"
        alt="Community GreenToken eco impact illustration"
        className="w-full max-w-[160px] h-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}
```

### Usage inside any Sidebar:
```jsx
// components/Sidebar.jsx
import SidebarBottomImage from './SidebarBottomImage';

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-full w-64 bg-white shadow-lg">
      {/* Navigation links */}
      <nav className="flex-1 px-4 py-6">
        {/* ... nav items ... */}
      </nav>

      {/* Bottom-left image — always at the bottom */}
      <SidebarBottomImage />
    </aside>
  );
}
```

---

## Page-Specific Sidebar Images (Optional Variants)

Some pages have alternative sidebar images that can be used instead of the shared one:

| Page | Alternative Image | Path | Note |
|---|---|---|---|
| Donation Tracking | Green Earth & Sprout | `assets/image/donationsidebar/green_earth_and_sprout.png` | RGBA transparent ✅ |
| Leaderboard | Eco Achievement Trophy | `assets/image/leaderboard-dashboard/sidebarleaderboard/eco_achievement_trophy_plants.png` | RGBA transparent ✅ |
| Leaderboard (top-right) | Leaderboard Trophy | `assets/image/leaderboard-dashboard/leaderboard_trophy.png` | RGBA transparent ✅ — used top-right of leaderboard section |

> **Recommendation:** Use `sidebar_bottom_all_pages.png` as the default for all pages. Optionally override with page-specific images for Donation and Leaderboard pages for richer visual context.

---

## UX/UI Notes
- Width: **140–160px** max — do not let it dominate the sidebar.
- Use `object-contain` to preserve aspect ratio.
- The image sits in a `mt-auto` container so it always floats to the **bottom** of the sidebar regardless of content height.
- `loading="lazy"` since it is below the fold.
- The 1254×1254 source image will be displayed much smaller (160px) — no scaling issues.
- If the sidebar background is dark (e.g., Super Admin), consider using a version with transparent background.

---

## Missing: Transparency Version

The current `sidebar_bottom_all_pages.png` is **RGB (no transparency)**. On dark sidebars (Super Admin uses a dark theme), the white background will be visible.

**Action needed:** Re-export or apply background removal if using on dark sidebar backgrounds.  
A temporary workaround is CSS: `mix-blend-mode: multiply` on the `<img>` element.
