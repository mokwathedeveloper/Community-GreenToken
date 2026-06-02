# Community GreenToken Sidebar Bottom Green Earth MD

This markdown provides **developer instructions** for placing the "Green Earth and Sprout" illustration at the bottom-left of the sidebar on the Dashboard and Donation Tracking pages.

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
- Transparent PNG ensures clean integration.
- File name clearly identifies purpose.
- Use the same image for dashboard and donation tracking sidebars for consistency.

---

## 2. Recommended Dimensions

- Width: 140–160px
- Height: auto (maintain aspect ratio)
- Fits neatly at the bottom-left of the sidebar without overlapping navigation items.

---

## 3. Starter Code (React/Next.js)

```jsx
// SidebarBottomGreenEarth.jsx
import greenEarthImage from '../assets/images/sidebar/green_earth_and_sprout.png';

export default function SidebarBottomGreenEarth() {
  return (
    <div className="mt-auto p-4">
      <img
        src={greenEarthImage}
        alt="Green Earth and Sprout Illustration"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
```

---

## 4. Usage in Sidebar

```jsx
import SidebarBottomGreenEarth from './SidebarBottomGreenEarth';

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-full w-64 bg-white shadow-lg">
      {/* Other sidebar items */}
      <SidebarBottomGreenEarth />
    </aside>
  );
}
```

---

## 5. UX/UI Notes

- Maintain padding to avoid crowding.
- Use `object-contain` to preserve aspect ratio.
- Test responsiveness on desktop, tablet, and mobile.
- Include `alt` text for accessibility.
- Component is modular for easy replacement or updates.

---

This MD file serves as a **developer blueprint** for integrating the sidebar bottom-left "Green Earth and Sprout" illustration professionally and accessibly during development on both Dashboard and Donation Tracking pages.
