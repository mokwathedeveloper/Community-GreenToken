// Google Material Icons style — filled SVG paths matching mockup

function IconVerify() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}
function IconToken() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  );
}
function IconLeaderboard() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/>
    </svg>
  );
}
function IconDonate() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M12 21.593c-.425-.396-8.01-7.143-8.01-11.39C3.99 6.297 6.59 4 9.42 4c1.56 0 3.12.62 4.58 1.96C15.46 4.62 17.02 4 18.58 4c2.83 0 5.43 2.297 5.43 6.203 0 4.247-7.585 10.994-8.01 11.39l-2 1.407-2-1.407z"/>
    </svg>
  );
}
function IconAnalytics() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  );
}
function IconBlockchain() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
      <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"/>
    </svg>
  );
}

const FEATURES = [
  {
    IconComp: IconVerify,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Action Verification",
    description: "Every eco-action is verified with SHA-256 photo evidence stored permanently on the Stellar blockchain.",
  },
  {
    IconComp: IconToken,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    title: "Token Rewards",
    description: "Earn GreenTokens (GTK) automatically when your actions are verified. Tokens are real, on-chain assets you own.",
  },
  {
    IconComp: IconLeaderboard,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Leaderboard",
    description: "Compete with your community. Rankings update in real-time as members log and verify sustainable actions.",
  },
  {
    IconComp: IconDonate,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    title: "Donations",
    description: "Allocate your tokens to community eco-projects. Every donation is recorded transparently on-chain.",
  },
  {
    IconComp: IconAnalytics,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Impact Analytics",
    description: "Track community-wide CO₂ offset, trees planted, and waste collected with real-time dashboards.",
  },
  {
    IconComp: IconBlockchain,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    title: "Stellar Blockchain",
    description: "Built on Stellar — 5-second finality, $0.00001 per transaction, carbon-neutral, SEP-41 token standard.",
  },
];

export default function FeaturesGrid() {
  return (
    <section aria-labelledby="features-heading" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Everything Your Community Needs
          </h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A complete platform for running verifiable, transparent, and gamified
            sustainability reward programs — powered by Stellar blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ IconComp, iconBg, iconColor, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex gap-4 items-start"
            >
              <div className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <IconComp />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
