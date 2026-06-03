// Rules: R-FE-01, R-FE-07, R-IMG-02, R-COLOR-02, R-A11Y-01
// Spec: ux_ui/feature_specv2/about_us_page_md.md
// Mockup: mockup/about_us_page_mockup.png

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";
import SharedBanner from "@/components/SharedBanner";

export const metadata: Metadata = { title: "About Us" };

const VALUES = [
  { icon: "🌱", title: "Sustainability",     desc: "We promote eco-friendly actions and hold ourselves accountable to the planet we protect." },
  { icon: "🔗", title: "Transparency",       desc: "All actions and rewards are verifiable on-chain — no hidden mechanics, no manipulation." },
  { icon: "🤝", title: "Community Impact",   desc: "We believe in collective action. Meaningful change only comes when communities work together." },
  { icon: "💡", title: "Innovation",         desc: "We leverage technology and innovation to drive positive change and expand environmental goals." },
];

const TEAM = [
  { name: "Arjun Patel",   role: "Blockchain Lead",  bio: "10+ years blockchain, crypto architecture and smart contract development." },
  { name: "Meera Shah",    role: "Product Designer", bio: "Love to create beautiful, human-centered and sustainable product experiences." },
  { name: "Rohit Verma",   role: "Backend Engineer", bio: "Full-stack with focus on Node.js, serverless APIs and Supabase." },
  { name: "Priya Nair",    role: "Frontend Lead",    bio: "I live and breathe React, Next.js and accessible UI design." },
  { name: "Karan Singh",   role: "DevOps / Infra",   bio: "CI/CD, cloud infrastructure and blockchain node management." },
];

export default function AboutUsPage() {
  return (
    <PublicLayout>

      {/* Hero section — R-FE-07, R-IMG-02 */}
      <section aria-labelledby="about-hero-heading" className="relative min-h-[500px] flex items-center overflow-hidden">
        <Image
          src="/assets/image/pages/about-us/about_us_hero.png"
          alt="Hands gently nurturing a small plant seedling in sunlit soil"
          fill className="object-cover" priority sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold text-primary-300 uppercase tracking-widest mb-3">About Us</p>
          <h1 id="about-hero-heading" className="text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-2xl">
            Building a Sustainable Future,{" "}
            <span className="text-primary-400">Together.</span>
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-xl leading-relaxed">
            Community GreenToken was born out of a simple belief: small actions can create big impact.
            We reward sustainable actions through transparent, blockchain-verified tokens.
          </p>
        </div>
      </section>

      {/* Values — R-COLOR-05: headings gray-900 */}
      <section aria-labelledby="values-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Our Values</p>
          <h2 id="values-heading" className="text-3xl font-bold text-gray-900 text-center mb-14">
            The Principles That Guide Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section aria-labelledby="team-heading" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Meet Our Team</p>
          <h2 id="team-heading" className="text-3xl font-bold text-gray-900 text-center mb-14">
            The People Behind GreenToken
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {TEAM.map(({ name, role, bio }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow">
                {/* Avatar placeholder — R-A11Y-02: role="presentation" for decorative */}
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold mx-auto mb-3" role="presentation">
                  {name.charAt(0)}
                </div>
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5 mb-2">{role}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner — R-COMP-08: SharedBanner */}
      <SharedBanner
        title="Be a part of the change."
        subtitle="Join Community GreenToken and start making an impact today."
        ctaLabel="Get Started"
        ctaHref="/org/setup"
        overlayStrength="dark"
      />
    </PublicLayout>
  );
}
