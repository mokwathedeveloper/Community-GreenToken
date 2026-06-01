// Community GreenToken Landing Page - Starter Code and Component Skeleton

// File Structure Suggestion:
// frontend/
// ├─ components/
// │   ├─ Navbar.jsx
// │   ├─ HeroCard.jsx
// │   ├─ FeatureHighlights.jsx
// │   └─ CTAButton.jsx
// ├─ pages/
// │   └─ index.jsx
// └─ styles/

// Navbar.jsx
export default function Navbar({ className }) {
  return (
    <nav className={`${className} flex justify-between items-center p-4 bg-bg-page`}> 
      <div className="logo text-primary font-bold">Community GreenToken</div>
      <ul className="flex space-x-4">
        <li className="hover:text-accent">Home</li>
        <li className="hover:text-accent">Features</li>
        <li className="hover:text-accent">Dashboard</li>
        <li className="hover:text-accent">Login</li>
      </ul>
    </nav>
  );
}

// HeroCard.jsx
export default function HeroCard({ title, subtitle, className }) {
  return (
    <section className={`${className} p-12 text-center bg-bg-page`}> 
      <h1 className="text-4xl font-bold text-primary">{title}</h1>
      <p className="mt-4 text-text-secondary text-lg">{subtitle}</p>
    </section>
  );
}

// FeatureHighlights.jsx
export default function FeatureHighlights({ features = [], className }) {
  return (
    <div className={`${className} grid grid-cols-1 md:grid-cols-3 gap-6 p-8`}> 
      {features.map((feature, index) => (
        <div key={index} className="bg-card p-6 rounded-lg hover:bg-hover transition">
          <h3 className="font-semibold text-primary mb-2">{feature.title}</h3>
          <p className="text-text-secondary">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

// CTAButton.jsx
export default function CTAButton({ label, onClick, className }) {
  return (
    <button
      className={`${className} px-6 py-3 bg-primary text-bg-page rounded-lg hover:bg-primary-hover focus:ring-2 focus:ring-accent transition`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// pages/index.jsx
import Navbar from '../components/Navbar';
import HeroCard from '../components/HeroCard';
import FeatureHighlights from '../components/FeatureHighlights';
import CTAButton from '../components/CTAButton';

export default function LandingPage() {
  const features = [
    { title: 'Action Submission', description: 'Submit your sustainable actions easily.' },
    { title: 'Token Rewards', description: 'Earn GreenTokens for verified actions.' },
    { title: 'Community Impact', description: 'Track contributions and environmental impact.' },
  ];

  return (
    <>
      <Navbar />
      <HeroCard title="Welcome to Community GreenToken" subtitle="Earn rewards for sustainable actions in your community" />
      <FeatureHighlights features={features} />
      <div className="text-center mt-8">
        <CTAButton label="Get Started" onClick={() => alert('CTA clicked')} />
      </div>
    </>
  );
}