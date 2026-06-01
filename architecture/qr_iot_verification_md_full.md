# Community GreenToken QR/IoT Verification Integration MD

This markdown provides a **professional developer blueprint** for implementing QR/IoT verification for Community GreenToken, with all mandatory features implemented.

---

## 1. Components
- `QRScanner.jsx` – Camera-based QR scanning with auto-focus, overlays, and visual guidance.
- `IoTListener.jsx` – Receives and validates IoT sensor data for environmental actions.
- `ImpactScoreCard.jsx` – Displays AI-calculated impact score per verified action.
- `ConfirmationModal.jsx` – Provides immediate success/error feedback.

## 2. Mandatory Features

1. **Camera Auto-Focus & QR UX Optimizations**
   - Auto-detects QR code boundaries.
   - Maintains continuous focus during scanning.
   - Visual overlays guide user to scan correctly.
   - Retry/error handling for failed scans.

2. **IoT Sensor Verification**
   - Connects with real-world devices (e.g., recycling bins, tree planting trackers).
   - Data is timestamped, hashed, and sent to backend for validation.
   - Verification triggers smart contract function `verifyAction(userId, actionType)`.

3. **Real-Time Analytics**
   - Updates dashboard metrics immediately: `MetricCard`, `LeaderboardCard`, `DonationProgress`.
   - Reflects community-wide contributions and verified actions.

4. **AI/Analytics Impact Scoring**
   - Calculates environmental impact points per action.
   - Updates dashboards and leaderboards instantly.
   - Stores scores on blockchain for transparency.

## 3. Data Flow

1. User completes a sustainable action.
2. QR code is scanned or IoT sensor is triggered.
3. Frontend sends verification request to API route.
4. Backend validates authenticity.
5. Blockchain smart contract (`verifyAction`) records verified action.
6. AI module calculates environmental impact score.
7. Frontend dashboards update in real time.

## 4. Frontend Integration

- Next.js API routes:
  - `verifyQR.js` – Handles QR code submissions.
  - `verifyIoT.js` – Handles IoT sensor submissions.
- State management: Zod validation, TanStack Query for data fetching, Zustand for global UI state.
- Components update metrics and feedback immediately after verification.

## 5. Folder Structure Suggestion
```
frontend/
├─ components/
│  ├─ QRScanner.jsx
│  ├─ IoTListener.jsx
│  ├─ ImpactScoreCard.jsx
│  └─ ConfirmationModal.jsx
├─ pages/
│  └─ verify-action.jsx
backend/
├─ api/
│  ├─ verifyQR.js
│  └─ verifyIoT.js
blockchain/
├─ contracts/
│  ├─ GreenToken.sol
│  ├─ ActionRegistry.sol
│  └─ RewardManagement.sol
ai/
├─ impactScoring.js
```

## 6. UX/UI Notes
- Visual scanning overlays and feedback messages must follow Community GreenToken brand colors.
- Success/error confirmations should be immediate and intuitive.
- All mandatory features must be fully functional.
- Ensure responsive design for desktop, tablet, and mobile.

## 7. Accessibility
- Textual guidance for scanning and feedback.
- ARIA labels for all interactive elements.
- Proper focus management for modals and notifications.
- High contrast for overlays and score visualization.

This MD file ensures **mandatory implementation** of QR/IoT verification with camera auto-focus, real-time analytics, and AI/Analytics impact scori