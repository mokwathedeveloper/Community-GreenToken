import Image from "next/image";
import Link from "next/link";
import { MLink, MPeople, MLeaf, MLightbulb, MPhoneAndroid, MStar } from "@/components/icons";

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
      {/* Background illustration — hidden on xs (<480px) to prevent text overlap on
          Tecno/budget Android phones at 320px. Visible from sm breakpoint upward. */}
      <Image
        src="/assets/image/pages/herosection/hero_eco_illustration.png"
        alt="Community members planting trees with the GreenToken coin emblem"
        fill
        className="object-contain hidden sm:block"
        style={{ objectPosition: "right center" }}
        priority
        sizes="(max-width: 640px) 0px, 100vw"
      />

      {/* White-to-transparent fade — covers the left side to keep text legible.
          On xs/sm we use a stronger fade so it fully covers the text column. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 35%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0) 75%)",
        }}
      />

      {/* Text content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16">
        <div className="max-w-xl">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5 sm:mb-6">
            Earn Real{" "}
            <span className="text-primary-600">Cash Rewards</span>{" "}
            for Eco-Actions.{" "}
            <span className="text-primary-600">Verified on Stellar.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3 max-w-lg">
            Your school, NGO, or company rewards members for verified real-world
            eco-actions — recycling, tree planting, clean-ups. Every reward is
            recorded on the Stellar blockchain and can be cashed out via M-Pesa.
          </p>

          {/* M-Pesa highlight pill */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-7 max-w-full">
            <MPhoneAndroid className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-semibold text-green-700 leading-snug">
              Community members in Kenya earn real KES — redeemable via M-Pesa
            </span>
          </div>

          {/* CTA Buttons — stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none min-h-[48px] touch-manipulation"
            >
              <MLeaf className="w-5 h-5" aria-hidden="true" />
              Start Earning Tokens
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-primary-600 border-2 border-primary-500 hover:bg-primary-50 active:bg-primary-100 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none min-h-[48px] touch-manipulation"
            >
              <MLightbulb className="w-5 h-5" aria-hidden="true" />
              See How It Works
            </Link>
          </div>

          {/* Trust Badges — wrap naturally on small screens */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 rounded-full border border-primary-100"
              >
                <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-primary-700 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
