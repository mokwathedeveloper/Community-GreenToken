// Community GreenToken Analytics/Impact Metrics Page - Starter Code and Component Skeleton

// Folder Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ MetricCard.jsx
// │   ├─ TrendChart.jsx
// │   ├─ PieChart.jsx
// │   └─ FilterDropdown.jsx
// ├─ pages/
// │   └─ analytics.jsx
// └─ styles/

// MetricCard.jsx
export default function MetricCard({ title, value }) {
  return (
    <div className="bg-card p-6 rounded-lg hover:bg-hover transition">
      <h3 className="text-primary font-semibold mb-2">{title}</h3>
      <p className="text-text-primary text-2xl">{value}</p>
    </div>
  );
}

// TrendChart.jsx
export default function TrendChart({ data }) {
  return (
    <div className="bg-card p-6 rounded-lg hover:bg-hover transition">
      <h3 className="text-primary font-semibold mb-2">Trend</h3>
      <div className="h-48 bg-hover rounded">Chart Placeholder</div>
    </div>
  );
}

// PieChart.jsx
export default function PieChart({ data }) {
  return (
    <div className="bg-card p-6 rounded-lg hover:bg-hover transition">
      <h3 className="text-primary font-semibold mb-2">Distribution</h3>
      <div className="h-48 bg-hover rounded">Pie Chart Placeholder</div>
    </div>
  );
}

// FilterDropdown.jsx
export default function FilterDropdown({ options = [], selected, onChange }) {
  return (
    <select
      className="bg-card text-text-primary p-2 rounded border border-border"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt, index) => (
        <option key={index} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// pages/analytics.jsx
import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import TrendChart from '../components/TrendChart';
import PieChart from '../components/PieChart';
import FilterDropdown from '../components/FilterDropdown';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState([
    { title: 'Total Tokens', value: 5000 },
    { title: 'Total Donations', value: 1200 },
    { title: 'Total Actions', value: 850 },
  ]);

  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => ({ ...m, value: m.value + Math.floor(Math.random() * 5) })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FilterDropdown options={filterOptions} selected={filter} onChange={setFilter} />
      {metrics.map((m, idx) => <MetricCard key={idx} {...m} />)}
      <TrendChart data={metrics} />
      <PieChart data={metrics} />
    </div>
  );
}
