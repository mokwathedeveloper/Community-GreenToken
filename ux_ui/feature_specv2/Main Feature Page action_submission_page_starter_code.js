// Community GreenToken Main Feature Page - Action Submission

// Folder Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ ActionForm.jsx
// │   ├─ SubmitButton.jsx
// │   ├─ ConfirmationModal.jsx
// │   └─ LoadingSkeleton.jsx
// ├─ pages/
// │   └─ feature.jsx
// └─ styles/

// ActionForm.jsx
export default function ActionForm({ actionType, description, timestamp, onSubmit }) {
  return (
    <form className="bg-card p-6 rounded-lg space-y-4" onSubmit={onSubmit}>
      <label className="block text-text-secondary">
        Action Type
        <input type="text" value={actionType} className="w-full p-2 rounded border border-border" readOnly />
      </label>
      <label className="block text-text-secondary">
        Description
        <textarea value={description} className="w-full p-2 rounded border border-border" readOnly />
      </label>
      <label className="block text-text-secondary">
        Timestamp
        <input type="text" value={timestamp} className="w-full p-2 rounded border border-border" readOnly />
      </label>
    </form>
  );
}

// SubmitButton.jsx
export default function SubmitButton({ label, onClick, loading }) {
  return (
    <button
      className={`px-6 py-3 bg-primary text-bg-page rounded-lg hover:bg-primary-hover focus:ring-2 focus:ring-accent transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? 'Submitting...' : label}
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

// LoadingSkeleton.jsx
export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-hover rounded w-1/3"></div>
      <div className="h-6 bg-hover rounded w-2/3"></div>
      <div className="h-6 bg-hover rounded w-full"></div>
    </div>
  );
}

// pages/feature.jsx
import { useState } from 'react';
import ActionForm from '../components/ActionForm';
import SubmitButton from '../components/SubmitButton';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ActionSubmissionPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const actionData = {
    actionType: 'Recycling',
    description: 'Submit recycled materials',
    timestamp: new Date().toISOString(),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <h1 className="text-3xl font-bold text-primary mb-6">Submit Action</h1>
      <ActionForm {...actionData} />
      <div className="mt-4">
        {loading ? <LoadingSkeleton /> : <SubmitButton label="Submit Action" onClick={handleSubmit} loading={loading} />}
      </div>
      <ConfirmationModal
        visible={modalVisible}
        message={success ? 'Action submitted successfully!' : 'Error submitting action.'}
        onClose={() => setModalVisible(false)}
      />
      {error && <p className="text-error mt-2">Failed to submit action. Please try again.</p>}
    </div>
  );
}
