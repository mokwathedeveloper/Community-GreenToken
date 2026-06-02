# Community GreenToken Sidebar Image MD

This markdown provides **instructions and starter code** for using the shared sidebar bottom-left image across all pages.

---

## PRIMARY SIDEBAR IMAGE (Use This Across All Pages)

**File:** `assets/image/sidebar/sidebar_bottom_all_pages.png`  
**Source:** `sidebar/sidebarforbottomfor allpages.png` (original)  
**Dimensions:** 1254 × 1254 px | **Format:** PNG RGB  
**Guide:** See `assets/image/sidebar/sidebar_all_pages_guide.md` for full usage documentation.

---

## 1. Folder Structure

Store the image in a dedicated folder for sidebar assets:

```
frontend/
└─ assets/
   └─ images/
      └─ sidebar/
         └─ sidebar_bottom_all_pages.png    ← PRIMARY: use this on all pages
         └─ eco_friendly_blockchain_impact_tracker.png  ← MISSING: needs re-sourcing
```

**Explanation:**
- `frontend/assets/images/sidebar/` keeps all sidebar graphics organized.
- `sidebar_bottom_all_pages.png` is the **shared image for ALL page sidebars**.
- The original `eco_friendly_blockchain_impact_tracker.png` was deleted — see `assets/image/sidebar/MISSING_ASSET_README.md`.
- Descriptive filename makes it easy to identify its purpose.

> ⚠️ **Asset Status:** The original file `eco_friendly_blockchain_impact_tracker` has been
> **deleted from the repository**. A placeholder README is available at
> `assets/image/sidebar/MISSING_ASSET_README.md` with re-sourcing instructions.
> Until restored, use `green_earth_and_sprout.png` from `assets/image/donationsidebar/` as a stand-in.
> Ensure the replacement file has a **transparent background (RGBA)** to blend with the sidebar.

---

## 2. Starter Code

**React/Next.js component to display the image:**

```jsx
// SidebarBottomImage.jsx
import impactImage from '../assets/images/sidebar/eco_friendly_blockchain_impact_tracker.png';

export default function SidebarBottomImage() {
  return (
    <div className="mt-auto p-4">
      <img
        src={impactImage}
        alt="Community GreenToken Impact Tracker"
        className="w-full h-auto object-contain rounded-lg"
      />
    </div>
  );
}
```

**Usage inside Sidebar component:**

```jsx
import SidebarBottomImage from './SidebarBottomImage';

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-full w-64 bg-white shadow-lg">
      {/* Other sidebar items here */}
      <SidebarBottomImage />
    </aside>
  );
}
```

---

## 3. UX/UI Notes
- Ensure the image **scales properly** on desktop and tablet.
- Maintain **padding/margin