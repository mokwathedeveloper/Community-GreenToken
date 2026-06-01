// Community GreenToken Dashboard Page - Starter Code and Component Skeleton

// Folder Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ TokenBalanceCard.jsx
// │   ├─ LeaderboardCard.jsx
// │   ├─ AnalyticsChart.jsx
// │   └─ DonationProgress.jsx
// ├─ pages/
// │   └─ dashboard.jsx
// └─ styles/

// TokenBalanceCard.jsx
export default function TokenBalanceCard({ balance, className }) {
  return (
    <div className={`${className} bg-card p-6 rounded-lg hover:bg-hover transition`}>
      <h3 className="text-primary font-semibold mb-2">Token Balance</h3>
      <p className="text-text-primary text-2xl">{balance}</p>
    </div>
  );
}

// LeaderboardCard.jsx
export default function LeaderboardCard({ leaderboard, className }) {
  return (
    <div className={`${className} bg-card p-6 rounded-lg hover:bg-hover transition`}>
      <h3 className="text-primary font-semibold mb-2">Leaderboard</h3>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={index} className="flex justify-between py-1">
            <span>{index + 1}. {user.username}</span>
            <span>{user.tokens}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// AnalyticsChart.jsx
export default function AnalyticsChart({ data, className }) {
  return (
    <div className={`${className} bg-card p-6 rounded-lg hover:bg-hover transition`}>
      <h3 className="text-primary font-semibold mb-2">Analytics</h3>
      {/* Placeholder for chart library */}
      <div className="h-48 bg-hover rounded">Chart Placeholder</div>
    </div>
  );
}

// DonationProgress.jsx
export default function DonationProgress({ donations, className }) {
  return (
    <div className={`${className} bg-card p-6 rounded-lg hover:bg-hover transition`}>
      <h3 className="text-primary font-semibold mb-2">Donation Progress</h3>
      <ul>
        {donations.map((item, index) => (
          <li key={index} className="mb-2">
            <span>{item.projectName}</span>
            <div className="w-full bg-hover h-4 rounded mt-1">
              <div className="bg-primary h-4 rounded" style={{ width: `${item.progress}%` }}></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// pages/dashboard.jsx
import { useState, useEffect } from 'react';
import TokenBalanceCard from '../components/TokenBalanceCard';
import LeaderboardCard from '../components/LeaderboardCard';
import AnalyticsChart from '../components/AnalyticsChart';
import DonationProgress from '../components/DonationProgress';

export default function DashboardPage() {
  const [balance, setBalance] = useState(120);
  const [leaderboard, setLeaderboard] = useState([
    { username: 'Alice', tokens: 300 },
    { username: 'Bob', tokens: 250 },
  ]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [donations, setDonations] = useState([
    { projectName: 'Tree Planting', progress: 60 },
    { projectName: 'Recycling Drive', progress: 80 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance((prev) => prev + Math.floor(Math.random() * 5));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TokenBalanceCard balance={balance} />
      <LeaderboardCard leaderboard={leaderboard} />
      <AnalyticsChart data={analyticsData} />
      <DonationProgress donations={donations} />
    </div>
  );
}