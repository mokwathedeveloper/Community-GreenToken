# Community GreenToken Leaderboard Trophy Image MD

This markdown provides **implementation instructions** for placing the leaderboard trophy/podium image at the top-right of the leaderboard section.

---

## 1. Folder Structure

Store the image in a dedicated folder for dashboard assets:

```
frontend/
└─ assets/
   └─ images/
      └─ dashboard/
         └─ leaderboard_trophy.png
```

**Notes:**
- `frontend/assets/images/dashboard/` organizes all dashboard-related images.
- `leaderboard_trophy.png` clearly identifies the image purpose.
- Optional variants: `leaderboard_trophy_small.png`, `leaderboard_trophy_large.png` for responsive design.

---

## 2. Recommended Dimensions

- **Width:** 120–160px (desktop)
- **Height:** auto (to maintain aspect ratio)
- Fits cleanly in the top-right without overlapping leaderboard content.

---

## 3. Starter Code for React/Next.js

**Component to display the image:**

```jsx
// LeaderboardTrophy.jsx
import trophyImage from '../assets/images/dashboard/leaderboard_trophy.png';

export default function LeaderboardTrophy() {
  return (
    <div className="absolute top-4 right-4 w-32 h-auto">
      <img
        src={trophyImage}
        alt="Leaderboard Trophy"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
```

**Usage in the Leaderboard Page:**

```jsx
import LeaderboardTrophy from './LeaderboardTrophy';

export default function LeaderboardPage() {
  return (
    <div className="relative p-8">
      <LeaderboardTrophy />
      {/* Existing leaderboard content here */}
    </div>
  );
}
```

---

## 4. UX/UI Notes

- Ensure the image **does not overlap** leaderboard text or controls.
- Maintain padding around the image for clarity.
- Use `object-contain` to preserve aspect ratio.
- Test responsiveness on **desktop, tablet, and mobile**.
- Include **alt text** for accessibility.

---

This MD file provides a **developer blueprint** for integrating the leaderboard trophy image in the Community GreenToken dashboard professionally and accessibly.
