// Spec: landing_page_md.md — FeatureHighlights section
// Mockup: 6 feature cards visible in landing page mockup

const FEATURES = [
  {
    icon: "✅",
    title: "Action Verification",
    description: "Every eco-action is verified with SHA-256 photo evidence stored permanently on the Stellar blockchain.",
    color: "bg-green-50",
  },
  {
    icon: "🪙",
    title: "Token Rewards",
    description: "Earn GreenTokens (GTK) automatically when your actions are verified. Tokens are real, on-chain assets you own.",
    color: "bg-yellow-50",
  },
  {
    icon: "🏆",
    title: "Leaderboard",
    description: "Compete with your community. Rankings update in real-time as members log and verify sustainable actions.",
    color: "bg-blue-50",
  },
  {
    icon: "❤️",
    title: "Donations",
    description: "Allocate your tokens to community eco-projects. Every donation is recorded transparently on-chain.",
    color: "bg-red-50",
  },
  {
    icon: "📊",
    title: "Impact Analytics",
    description: "Track community-wide CO₂ offset, trees planted, and waste collected with real-time dashboards.",
    color: "bg-purple-50",
  },
  {
    icon: "🔗",
    title: "Stellar Blockchain",
    description: "Built on Stellar — 5-second finality, $0.00001 per transaction, carbon-neutral, SEP-41 token standard.",
    color: "bg-teal-50",
  },
];

export default function FeaturesGrid() {
  return (
    <section aria-labelledby="features-heading" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            id="features-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Everything Your Community Needs
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A complete platform for running verifiable, transparent, and gamified
            sustainability reward programs — powered by Stellar blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, description, color }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl ${color}`}
                aria-hidden="true"
              >
                {icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
