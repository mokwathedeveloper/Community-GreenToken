import Link from "next/link";

// Mockup: 5-step horizontal flow with arrow connectors
// Spec: how_it_works_page_md.md — condensed version for landing page

const STEPS = [
  { num: 1, icon: "✍️", title: "Sign Up",          desc: "Create an account or connect your Freighter wallet in 60 seconds." },
  { num: 2, icon: "♻️", title: "Submit an Action", desc: "Log a sustainable action and upload photo evidence." },
  { num: 3, icon: "✅", title: "Verification",     desc: "Your action is verified on the Stellar blockchain via ActionRegistry." },
  { num: 4, icon: "🪙", title: "Earn GTK",         desc: "Verified actions trigger GreenToken.mint() — tokens appear in your wallet." },
  { num: 5, icon: "🎁", title: "Redeem or Donate", desc: "Spend tokens on rewards or donate to community eco-projects." },
];

const TRUST_CARDS = [
  {
    icon: "🔗",
    title: "Blockchain Transparency",
    desc: "Every action, token, and donation is permanently recorded on Stellar. Anyone can verify the data.",
  },
  {
    icon: "🌿",
    title: "Measurable Sustainability",
    desc: "Real-time metrics: trees planted, CO₂ offset, waste collected — all backed by on-chain proof.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2
            id="how-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            How Community GreenToken Works
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            From your first eco-action to a permanent blockchain record — in five simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              {/* Connector line (hidden on last) */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-primary-200"
                />
              )}
              {/* Circle */}
              <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mb-3 z-10 flex-shrink-0">
                {step.num}
              </div>
              <div className="text-2xl mb-1" aria-hidden="true">{step.icon}</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {TRUST_CARDS.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4"
            >
              <div className="text-3xl flex-shrink-0" aria-hidden="true">{icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Learn more about how it works →
          </Link>
        </div>
      </div>
    </section>
  );
}
