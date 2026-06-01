// Community GreenToken Donation Tracking Page - Starter Code and Component Skeleton

// Folder Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ DonationCard.jsx
// │   └─ ProjectProgressBar.jsx
// ├─ pages/
// │   └─ donations.jsx
// └─ styles/

// DonationCard.jsx
export default function DonationCard({ projectName, tokensContributed, totalTokens }) {
  const progress = Math.min((tokensContributed / totalTokens) * 100, 100);
  return (
    <div className="bg-card p-6 rounded-lg hover:bg-hover transition">
      <h3 className="text-primary font-semibold mb-2">{projectName}</h3>
      <p className="text-text-secondary mb-2">Contributed: {tokensContributed} / {totalTokens} Tokens</p>
      <div className="w-full bg-hover h-4 rounded">
        <div className="bg-primary h-4 rounded" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

// ProjectProgressBar.jsx
export default function ProjectProgressBar({ projects }) {
  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <DonationCard key={index} {...project} />
      ))}
    </div>
  );
}

// pages/donations.jsx
import { useState } from 'react';
import ProjectProgressBar from '../components/ProjectProgressBar';

export default function DonationTrackingPage() {
  const [projects, setProjects] = useState([
    { projectName: 'Tree Planting', tokensContributed: 60, totalTokens: 100 },
    { projectName: 'Recycling Drive', tokensContributed: 80, totalTokens: 120 },
  ]);

  // Simulate updates
  const handleContributionUpdate = (index, additionalTokens) => {
    const updated = [...projects];
    updated[index].tokensContributed += additionalTokens;
    setProjects(updated);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Donation Tracking</h1>
      <ProjectProgressBar projects={projects} />
    </div>
  );
}