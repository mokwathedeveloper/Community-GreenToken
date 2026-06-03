import type { Metadata } from "next";
import PublicLayout from "@/components/layouts/PublicLayout";
import HeroSection from "@/components/landing/HeroSection";
import StatsRow from "@/components/landing/StatsRow";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import SharedBanner from "@/components/SharedBanner";

// Spec: landing_page_md.md | Mockup: mockup/landing_page_mockup.png
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

      {/* 5. Bottom CTA Banner — "Small Actions. Big Impact." */}
      <SharedBanner
        title="Small Actions. Big Impact."
        subtitle="Join thousands of changemakers building a greener tomorrow."
        ctaLabel="Get Started"
        ctaHref="/org/setup"
        secondaryCta={{ label: "Explore Leaderboard", href: "/leaderboard" }}
        overlayStrength="dark"
      />
    </PublicLayout>
  );
}
