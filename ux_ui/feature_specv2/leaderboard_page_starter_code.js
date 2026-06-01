// Community GreenToken Leaderboard Page - Starter Code and Component Skeleton

// Folder Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ LeaderboardTable.jsx
// │   └─ UserRankCard.jsx
// ├─ pages/
// │   └─ leaderboard.jsx
// └─ styles/

// UserRankCard.jsx
export default function UserRankCard({ username, rank, tokens }) {
  return (
    <div className="flex justify-between p-4 bg-card rounded-lg hover:bg-hover transition">
      <span>{rank}. {username}</span>
      <span>{tokens} Tokens</span>
    </div>
  );
}

// LeaderboardTable.jsx
import UserRankCard from './UserRankCard';

export default function LeaderboardTable({ users }) {
  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <UserRankCard key={index} username={user.username} rank={index + 1} tokens={user.tokens} />
      ))}
    </div>
  );
}

// pages/leaderboard.jsx
import { useState } from 'react';
import LeaderboardTable from '../components/LeaderboardTable';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([
    { username: 'Alice', tokens: 300 },
    { username: 'Bob', tokens: 250 },
    { username: 'Charlie', tokens: 200 },
  ]);

  // Simulate sorting/filtering
  const handleSort = () => {
    const sorted = [...users].sort((a, b) => b.tokens - a.tokens);
    setUsers(sorted);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Leaderboard</h1>
      <button className="mb-4 px-4 py-2 bg-primary text-bg-page rounded-lg hover:bg-primary-hover" onClick={handleSort}>
        Sort by Tokens
      </button>
      <LeaderboardTable users={users} />
    </div>
  );
}