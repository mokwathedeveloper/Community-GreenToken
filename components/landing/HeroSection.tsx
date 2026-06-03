import Image from "next/image";
import Link from "next/link";

// Spec: landing_page_md.md — HeroCard section
// Mockup: mockup/landing_page_mockup.png

const TRUST_BADGES = [
  { icon: "🔗", label: "Blockchain Secured" },
  { icon: "⚖️", label: "Transparent & Fair" },
  { icon: "🤝", label: "Community Driven" },
];

export default function HeroSection() {
  return (
    <section
      aria-label="Hero — Rewarding Sustainable Actions"
      className="relative bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text content */}
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Rewarding{" "}
              <span className="text-primary-600">Sustainable</span>{" "}
              Actions. Building Better{" "}
              <span className="text-primary-600">Communities.</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
              Community GreenToken rewards real-world eco-friendly actions with
              blockchain-verified tokens. Earn rewards for recycling, planting
              trees, and reducing your carbon footprint — transparently, on Stellar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/org/setup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span aria-hidden="true">🌿</span> Start Earning Tokens
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-primary-600 border-2 border-primary-500 hover:bg-primary-50 rounded-xl transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <span aria-hidden="true">▶</span> Watch How It Works
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {TRUST_BADGES.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100"
                >
                  <span aria-hidden="true" className="text-sm">{icon}</span>
                  <span className="text-xs font-medium text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero illustration */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-square">
              <Image
                src="/assets/image/herosection/hero_eco_illustration.png"
                alt="Community members engaging in eco-friendly actions with blockchain rewards visualization"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
