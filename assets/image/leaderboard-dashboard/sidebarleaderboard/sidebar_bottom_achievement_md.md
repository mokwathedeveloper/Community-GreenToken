# Community GreenToken Sidebar Bottom Achievement MD

This markdown provides **developer instructions** for using the "Eco Achievement with Trophy and Plants" image at the **bottom-left of the sidebar** in the Community GreenToken dashboard.

---

## 1. Folder Structure

Store the image in a dedicated folder for sidebar assets:

```
frontend/
└─ assets/
   └─ images/
      └─ sidebar/
         └─ eco_achievement_trophy_plants.png
```

**Notes:**
- Transparent background ensures it fits neatly in the sidebar.
- File name clearly indicates the purpose.
- Optional: create small/large variants for responsiveness.

---

## 2. Recommended Dimensions

- Width: 140–160px
- Height: auto (maintain aspect ratio)
- Should fit cleanly at the bottom-left without overlapping other sidebar elements.

---

## 3. React/Next.js Starter Component

```jsx
// SidebarBottomAchievement.jsx
import achievementImage from '../assets/images/sidebar/eco_achievement_trophy_plants.png';

export default function SidebarBottomAchievement() {
  return (
    <div className="mt-auto p-4">
      <img
        src={achievementImage}
        alt="Eco Achievement Trophy and Plants"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
```

---

## 4. Usage in Sidebar Component

```jsx
import SidebarBottomAchievement from './SidebarBottomAchievement';

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-full w-64 bg-white shadow-lg">
      {/* Other sidebar items */}

      {/* Bottom-left achievement image */}
      <SidebarBottomAchievement />
    </aside>
  );
}
```

---

## 5. UX/UI Notes

- Maintain **padding/margin** to prevent crowding.
- Ensure **object-contain** to preserve aspect ratio.
- Test **responsiveness** on desktop, tablet, and mobile.
- Include **alt text** for accessibility.
- Component is **modular** for easy replacement or updates