// Rules: R-FE-01, R-FE-07, R-IMG-02, R-COLOR-02, R-A11Y-01
// Spec: ux_ui/feature_specv2/about_us_page_md.md
// Mockup: mockup/about_us_page_mockup.png

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";

export const metadata: Metadata = { title: "About Us — Community GreenToken" };

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 3 7.5 3 12c0 2.5 1 4.8 2.6 6.5M12 3c5 0 9 4.5 9 9 0 2.5-1 4.8-2.6 6.5M12 3v18M3 12h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7.5C9.5 6 11 5 12 5s2.5 1 4 2.5" />
      </svg>
    ),
    title: "Sustainability",
    desc: "We promote eco-friendly actions and hold ourselves accountable to the planet we protect.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Transparency",
    desc: "All actions and rewards are verifiable on-chain — no hidden mechanics, no manipulation.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Community Impact",
    desc: "We believe in collective action. Meaningful change only comes when communities work together.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Innovation",
    desc: "We leverage technology and innovation to drive positive change and expand environmental goals.",
  },
];

const TEAM = [
  { name: "Arjun Patel",   role: "Blockchain Lead",   bio: "10+ years blockchain, crypto architecture and smart contract development.", color: "bg-emerald-500" },
  { name: "Meera Shah",    role: "Product Designer",  bio: "Loves creating beautiful, human-centered and sustainable product experiences.", color: "bg-violet-500" },
  { name: "Rohit Verma",   role: "Backend Engineer",  bio: "Full-stack developer with a focus on Node.js, serverless APIs and Supabase.", color: "bg-sky-500"     },
  { name: "Priya Nair",    role: "Frontend Lead",     bio: "Lives and breathes React, Next.js and accessible UI design.", color: "bg-rose-500"     },
  { name: "Karan Singh",   role: "DevOps / Infra",    bio: "CI/CD pipelines, cloud infrastructure and blockchain node management.", color: "bg-amber-500"   },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function AboutUsPage() {
  return (
    <PublicLayout>

      {/* ── Hero — full-width background image with text overlay ── */}
      <section aria-labelledby="about-hero-heading" className="relative min-h-[480px] lg:min-h-[560px] flex items-center overflow-hidden bg-white">

        {/* Background image — object-contain shows the full image (it has natural white edges) */}
        <Image
          src="/assets/image/pages/about-us/about_us_hero.png"
          alt="Hands gently holding a young plant seedling in sunlit forest"
          fill
          className="object-contain object-right"
          priority
          sizes="100vw"
        />

        {/* Left-to-right gradient so dark text stays readable over the light-left image */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0.05) 100%)" }}
          aria-hidden="true"
        />

        {/* Text — sits on the light left portion */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16 lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-3">About Us</p>
            <h1 id="about-hero-heading" className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Building a Sustainable{" "}
              <span className="text-primary-500">Future, Together.</span>
            </h1>
            <p className="mt-5 text-base text-gray-600 leading-relaxed">
              Community GreenToken was born out of a simple belief: small actions can create big impact.
              We reward sustainable actions through transparent, blockchain-verified tokens.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section aria-labelledby="values-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Our Values</p>
          <h2 id="values-heading" className="text-3xl font-bold text-gray-900 text-center mb-14">
            The Principles That Guide Us
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title}
                className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-7 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                {/* Green circle icon container — matches mockup */}
                <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-600 transition-colors">
                  {icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section aria-labelledby="team-heading" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Meet Our Team</p>
          <h2 id="team-heading" className="text-3xl font-bold text-gray-900 text-center mb-14">
            The People Behind GreenToken
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {TEAM.map(({ name, role, bio, color }) => (
              <div key={name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200">

                {/* Avatar circle */}
                <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-md`}>
                  <span className="text-2xl font-extrabold text-white select-none">
                    {name.charAt(0)}
                  </span>
                </div>

                <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
                <p className="text-xs font-semibold text-primary-600 mt-0.5 mb-2">{role}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{bio}</p>

                {/* Social icons */}
                <div className="flex items-center justify-center gap-3">
                  <a href="#" aria-label={`${name} on GitHub`}
                    className="text-gray-400 hover:text-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                    <GitHubIcon />
                  </a>
                  <a href="#" aria-label={`${name} on LinkedIn`}
                    className="text-gray-400 hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                    <LinkedInIcon />
                  </a>
                  <a href="#" aria-label={`${name} on X (Twitter)`}
                    className="text-gray-400 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded">
                    <TwitterIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section aria-label="Call to action" className="relative h-80 sm:h-96 lg:h-[420px] overflow-hidden">
        <Image
          src="/assets/image/pages/about-us/about_us_cta_banner.png"
          alt="Green forest background"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Be a part of the change.
          </h2>
          <p className="text-sm sm:text-base text-white/85 mb-6 max-w-md">
            Join Community GreenToken and start making an impact today.
          </p>
          <Link
            href="/org/setup"
            className="inline-flex items-center gap-2 px-7 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none text-sm">
            Get Started →
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
