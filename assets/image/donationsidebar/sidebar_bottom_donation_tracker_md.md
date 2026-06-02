# Community GreenToken Sidebar Bottom Donation Tracker MD

This markdown provides **developer instructions** for placing the donation tracker illustration at the bottom-left of the sidebar on the Donation Tracking page.

---

## 1. Folder Structure

Store the image in a dedicated folder for sidebar assets:

```
frontend/
└─ assets/
   └─ images/
      └─ sidebar/
         └─ green_earth_and_sprout.png
```

**Notes:**
- Transparent background ensures it fits neatly in the sidebar.
- File name clearly identifies its purpose.
- Optional: create small/large variants for responsive design.

---

## 2. Recommended Dimensions

- Width: 140–160px
- Height: auto (maintain aspect ratio)
- Should fit cleanly at the bottom-left without overlapping other sidebar items.

---

## 3. Starter Code (React/Next.js)

```jsx
// SidebarBottomDonationTracker.jsx
import donationSidebar from '../assets/images/sidebar/green_earth_and_sprout.png';

export default function SidebarBottomDonationTracker() {
  return (
    <div className="mt-auto p-4">
      <img
        src={donationSidebar}
        alt="Donation Tracker Illustration"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
```

**Usage in Sidebar Component:**

```jsx
import SidebarBottomDonationTracker from './SidebarBottomDonationTracker';

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-full w-64 bg-white shadow-lg">
      {/* Other sidebar items */}
      <SidebarBottomDonationTracker />
    </aside>
  );
}
```

---

## 4. UX/UI Notes

- Maintain padding to prevent crowding menu items.
- Use `object-contain` to preserve aspect ratio.
- Test responsiveness on desktop, tablet, and mobile.
- Include `alt` text for accessibility.
- Component is modular for easy replacement or updates.

---

This MD file serves as a **developer blueprint** for integrating the sidebar bottom-left donation tracker illustration professionally and accessibly during development.