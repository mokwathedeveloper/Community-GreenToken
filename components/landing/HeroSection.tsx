import Image from "next/image";
import Link from "next/link";
import { MLink, MScale, MPeople, MLeaf, MLightbulb, MPhoneAndroid, MStar } from "@/components/icons";

const TRUST_BADGES = [
  { Icon: MLink,   label: "Stellar Blockchain" },
  { Icon: MPhoneAndroid, label: "M-Pesa Cash Out" },
  { Icon: MPeople, label: "Community Driven"   },
  { Icon: MStar,   label: "Africa-First"        },
];

export default function HeroSection() {
  return (
    <section
      aria-label="Hero — Rewarding Sustainable Actions"
      className="relative w-full min-h-[480px] md:min-h-[580px] lg:min-h-[680px] flex items-center overflow-hidden bg-white"
    >
      {/* Background image — contain so full height is visible; sits right-of-center */}
      <Image
        src="/assets/image/pages/herosection/hero_eco_illustration.png"
        alt="Community members planting trees with the GreenToken coin emblem"
        fill
        className="object-contain"
        style={{ objectPosition: "right center" }}
        priority
        sizes="100vw"
      />

      {/* White-to-transparent fade from the left — blends white bg into the image */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 28%, rgba(255,255,255,0.50) 50%, rgba(255,255,255,0) 72%)",
        }}
      />

      {/* Text content — dark text on the white fade area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-16">
        <div className="max-w-xl">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Earn Real{" "}
            <span className="text-primary-600">Cash Rewards</span>{" "}
            for Eco-Actions.{" "}
            <span className="text-primary-600">Verified on Stellar.</span>
          </h1>

          <p className="text-lg text-gray-700 leading-relaxed mb-3 max-w-lg">
            Your school, NGO, or company rewards members for verified real-world
            eco-actions — recycling, tree planting, clean-ups. Every reward is
            recorded on the Stellar blockchain and can be cashed out via M-Pesa.
          </p>

          {/* M-Pesa highlight pill */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-7">
            <MPhoneAndroid className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-green-700">
              Community members in Kenya earn real KES — redeemable via M-Pesa
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <MLeaf className="w-5 h-5" aria-hidden="true" />
              Start Earning Tokens
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-primary-600 border-2 border-primary-500 hover:bg-primary-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            >
              <MLightbulb className="w-5 h-5" aria-hidden="true" />
              See How It Works
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-100"
              >
                <Icon className="w-4 h-4 text-primary-600" aria-hidden="true" />
                <span className="text-xs font-semibold text-primary-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
