# Community GreenToken Sidebar Image MD

This markdown provides **instructions and starter code** for using the Community GreenToken impact tracker image at the bottom of the sidebar.

---

## 1. Folder Structure

Store the image in a dedicated folder for sidebar assets:

```
frontend/
└─ assets/
   └─ images/
      └─ sidebar/
         └─ eco_friendly_blockchain_impact_tracker.png
```

**Explanation:**
- `frontend/assets/images/sidebar/` keeps all sidebar graphics organized.
- Descriptive filename makes it easy to identify its purpose.

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