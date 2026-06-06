import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import PublicLayout from "@/components/layouts/PublicLayout";
import HeroSection from "@/components/landing/HeroSection";
import StatsRow from "@/components/landing/StatsRow";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorks from "@/components/landing/HowItWorks";

export const metadata: Metadata = {
  title: "Community GreenToken — Rewarding Sustainable Actions",
  description:
    "Earn blockchain-verified GreenTokens for recycling, tree planting, and eco-actions. Built on Stellar.",
};

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Platform Stats */}
      <StatsRow />

      {/* 3. Features */}
      <FeaturesGrid />

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Bottom CTA Banner — matches mockup with GreenToken emblem on right */}
      <section className="relative w-full h-[380px] md:h-[420px] overflow-hidden">
        <Image
          src="/assets/image/banner.png"
          alt="Community GreenToken — eco-friendly community illustration"
          fill
          className="object-cover"
          loading="lazy"
          sizes="100vw"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
          {/* Text + buttons — centred when no room for emblem */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-sm">
              Small Actions. Big Impact.
            </h2>
            <p className="text-base text-white/85 max-w-md mb-7 leading-relaxed mx-auto lg:mx-0">
              Join thousands of changemakers building a greener tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Get Started
              </Link>
              <Link
                href="/leaderboard"
                className="px-8 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-colors backdrop-blur-sm text-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Explore Leaderboard
              </Link>
            </div>
          </div>

          {/* Decorative GreenToken emblem — visible in mockup on right */}
          <div aria-hidden="true" className="hidden lg:flex flex-shrink-0 w-44 h-44 rounded-full bg-primary-600/80 border-4 border-primary-400/60 shadow-2xl items-center justify-center backdrop-blur-sm">
            <Leaf className="w-20 h-20 text-white drop-shadow-lg" strokeWidth={1.5} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
