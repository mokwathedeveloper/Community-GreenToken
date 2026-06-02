// About Us Page — Community GreenToken
// Route: /about
import CTAButton from '../components/CTAButton';

const VALUES = [
  { icon: '🌱', title: 'Sustainability', desc: 'Every action logged moves the needle on climate change.' },
  { icon: '🔗', title: 'Transparency', desc: 'Blockchain-verified tokens mean every reward is auditable.' },
  { icon: '🤝', title: 'Community Impact', desc: 'Rewards flow back into the communities that earn them.' },
  { icon: '💡', title: 'Innovation', desc: 'Smart contracts make eco incentives scalable and trustless.' },
];

const TEAM = [
  { name: 'Team Member 1', role: 'Frontend Developer', avatar: '/assets/image/branding/avatar_placeholder.png' },
  { name: 'Team Member 2', role: 'Backend Engineer',   avatar: '/assets/image/branding/avatar_placeholder.png' },
  { name: 'Team Member 3', role: 'Smart Contracts',    avatar: '/assets/image/branding/avatar_placeholder.png' },
  { name: 'Team Member 4', role: 'UX / Product',       avatar: '/assets/image/branding/avatar_placeholder.png' },
];

export default function AboutUsPage() {
  return (
    <main>
      {/* Mission Hero */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20 px-6 text-center">
        <img src="/branding/community-greentoken-logo.png" alt="Community GreenToken" className="h-16 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-text-dark mb-4">
          Rewarding Action. Verifying Impact.
        </h1>
        <p className="max-w-2xl mx-auto text-text-secondary text-lg">
          Community GreenToken is a blockchain-powered platform that turns everyday
          sustainable actions into real rewards — transparently, community-first.
        </p>
        <CTAButton label="Get Started" href="/org/setup" className="mt-8" />
      </section>

      {/* Values */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-text-dark text-center mb-10">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(v => (
            <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="text-4xl mb-3">{v.icon}</div>
              <h3 className="font-semibold text-text-dark mb-2">{v.title}</h3>
              <p className="text-sm text-text-secondary">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-green-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-text-dark text-center mb-10">Meet the Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center text-2xl">👤</div>
                <p className="font-semibold text-sm text-text-dark">{m.name}</p>
                <p className="text-xs text-text-secondary mt-1">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center px-6">
        <h2 className="text-2xl font-bold text-text-dark mb-4">Join the Movement</h2>
        <p className="text-text-secondary mb-6">Start earning tokens for the sustainable actions you already take.</p>
        <CTAButton label="Start Your Program" href="/org/setup" />
      </section>
    </main>
  );
}
