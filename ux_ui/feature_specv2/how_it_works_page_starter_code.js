// How It Works Page — Community GreenToken
// Route: /how-it-works
import { useState } from 'react';
import CTAButton from '../components/CTAButton';

const STEPS = [
  { num: 1, title: 'Sign Up',                icon: '✍️',  desc: 'Create your account or connect your crypto wallet in under a minute.' },
  { num: 2, title: 'Submit a Sustainable Action', icon: '♻️', desc: 'Log an action — recycling, tree planting, carpooling, energy saving, and more.' },
  { num: 3, title: 'Verification',           icon: '✅',  desc: 'The ActionRegistry smart contract verifies your submission on-chain.' },
  { num: 4, title: 'Earn GreenTokens',       icon: '🪙',  desc: 'Verified actions trigger the GreenToken contract to mint tokens directly to your wallet.' },
  { num: 5, title: 'Redeem or Donate',       icon: '🎁',  desc: 'Spend tokens on rewards, or donate them to community eco projects with full transparency.' },
];

const FAQ = [
  { q: 'What is a GreenToken?',          a: 'A GreenToken is a blockchain-verified digital reward earned by completing sustainable actions. Think of it as eco-points that live on-chain.' },
  { q: 'What is a smart contract?',      a: 'A smart contract is a self-executing program on the blockchain that automatically verifies your actions and mints tokens — no middleman needed.' },
  { q: 'Is my data private?',            a: 'Your wallet address and actions are stored on-chain (public) but your personal details are kept in a secure, encrypted database.' },
  { q: 'Can I join multiple programs?',  a: 'Yes — if your school, employer, or city runs a GreenToken program, you can join each independently and earn tokens in each.' },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-text-dark mb-4">How It Works</h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          From your first sustainable action to your first token reward — in five simple steps.
        </p>
      </section>

      {/* Steps */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-start gap-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-dark flex items-center gap-2">
                  <span>{step.icon}</span> {step.title}
                </h3>
                <p className="text-text-secondary mt-1 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="bg-green-50 py-12 px-6 text-center">
        <h2 className="text-xl font-bold text-text-dark mb-6">Token Lifecycle Diagram</h2>
        <img
          src="/assets/image/architecture/community_greentoken_flow_diagram.png"
          alt="Community GreenToken token flow diagram"
          className="mx-auto max-w-3xl w-full rounded-xl shadow"
        />
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-text-dark text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm"
              onToggle={e => setOpenFaq(e.target.open ? i : null)}
            >
              <summary className="px-6 py-4 font-medium text-text-dark cursor-pointer list-none flex justify-between items-center">
                {item.q}
                <span className="text-primary text-lg">{openFaq === i ? '−' : '+'}</span>
              </summary>
              <p className="px-6 pb-5 text-text-secondary text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <CTAButton label="Submit Your First Action" href="/feature" />
      </section>
    </main>
  );
}
