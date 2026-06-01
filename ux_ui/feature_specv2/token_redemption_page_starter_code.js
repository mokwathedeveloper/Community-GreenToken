// Community GreenToken Token Redemption Page - Starter Code and Component Skeleton

// Folder Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ RewardCard.jsx
// │   ├─ RedeemButton.jsx
// │   └─ ConfirmationModal.jsx
// ├─ pages/
// │   └─ redeem.jsx
// └─ styles/

// RewardCard.jsx
export default function RewardCard({ id, title, description, cost, available, onSelect }) {
  return (
    <div
      className={`bg-card p-6 rounded-lg hover:bg-hover transition cursor-pointer ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => available && onSelect(id)}
    >
      <h3 className="text-primary font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary mb-2">{description}</p>
      <p className="text-text-primary font-bold">Cost: {cost} Tokens</p>
    </div>
  );
}

// RedeemButton.jsx
export default function RedeemButton({ label, onClick, loading, disabled }) {
  return (
    <button
      className={`px-6 py-3 bg-primary text-bg-page rounded-lg hover:bg-primary-hover focus:ring-2 focus:ring-accent transition ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? 'Redeeming...' : label}
    </button>
  );
}

// ConfirmationModal.jsx
export default function ConfirmationModal({ visible, message, onClose }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-card p-6 rounded-lg max-w-sm w-full">
        <p className="text-text-primary mb-4">{message}</p>
        <button className="px-4 py-2 bg-primary rounded-lg" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// pages/redeem.jsx
import { useState } from 'react';
import RewardCard from '../components/RewardCard';
import RedeemButton from '../components/RedeemButton';
import ConfirmationModal from '../components/ConfirmationModal';

export default function TokenRedemptionPage() {
  const [selectedReward, setSelectedReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const rewards = [
    { id: 1, title: 'Tree Planting', description: 'Plant a tree', cost: 50, available: true },
    { id: 2, title: 'Recycling Kit', description: 'Receive a recycling starter kit', cost: 100, available: true },
    { id: 3, title: 'Workshop Entry', description: 'Attend a sustainability workshop', cost: 75, available: false },
  ];

  const handleRedeem = async () => {
    if (!selectedReward) return;
    setLoading(true);
    setError(false);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setModalVisible(true);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Redeem Tokens</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} {...reward} onSelect={setSelectedReward} />
        ))}
      </div>
      <div className="mt-4 text-center">
        <RedeemButton label="Redeem Selected" onClick={handleRedeem} loading={loading} disabled={!selectedReward} />
      </div>
      <ConfirmationModal
        visible={modalVisible}
        message={success ? 'Redemption successful!' : 'Error redeeming reward.'}
        onClose={() => setModalVisible(false)}
      />
      {error && <p className="text-error mt-2">Failed to redeem reward. Please try again.</p>}
    </div>
  );
}