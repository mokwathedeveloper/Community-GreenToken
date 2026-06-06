// Spec: ux_ui/feature_specv2/about_us_page_md.md
// Mockup: mockup/about_us_page_mockup.png

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MLeaf, MShield, MPeople, MLightbulb } from "@/components/icons";
import PublicLayout from "@/components/layouts/PublicLayout";

export const metadata: Metadata = { title: "About Us — Community GreenToken" };

const VALUES = [
  {
    Icon: MLeaf,
    bg: "bg-emerald-500",
    title: "Sustainability",
    desc: "We promote eco-friendly actions and hold ourselves accountable to the planet we protect.",
  },
  {
    Icon: MShield,
    bg: "bg-green-500",
    title: "Transparency",
    desc: "All actions and rewards are verifiable on-chain — no hidden mechanics, no manipulation.",
  },
  {
    Icon: MPeople,
    bg: "bg-teal-500",
    title: "Community Impact",
    desc: "We believe in collective action. Meaningful change only comes when communities work together.",
  },
  {
    Icon: MLightbulb,
    bg: "bg-primary-500",
    title: "Innovation",
    desc: "We leverage technology and innovation to drive positive change and expand environmental goals.",
  },
];

const TEAM = [
  {
    name: "Arjun Patel",
    role: "Blockchain Lead",
    bio: "10+ years blockchain, crypto architecture and smart contract development.",
    color: "from-emerald-400 to-emerald-600",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Meera Shah",
    role: "Product Designer",
    bio: "Loves creating beautiful, human-centred and sustainable product experiences.",
    color: "from-violet-400 to-violet-600",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Rohit Verma",
    role: "Backend Engineer",
    bio: "Full-stack developer with a focus on Node.js, serverless APIs and Supabase.",
    color: "from-sky-400 to-sky-600",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Priya Nair",
    role: "Frontend Lead",
    bio: "Lives and breathes React, Next.js and accessible UI design.",
    color: "from-rose-400 to-rose-600",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Karan Singh",
    role: "DevOps / Infra",
    bio: "CI/CD pipelines, cloud infrastructure and blockchain node management.",
    color: "from-amber-400 to-amber-600",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="about-hero-heading" className="relative min-h-[480px] lg:min-h-[540px] flex items-center overflow-hidden">
        <Image
          src="/assets/image/pages/about-us/about_us_hero.png"
          alt="Hands gently holding a young plant seedling in sunlit forest"
          fill
          className="object-cover object-[70%_center]"
          priority
          sizes="100vw"
        />

        {/* Subtle white fade on left keeps dark text readable over the image */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.80) 28%, rgba(255,255,255,0.20) 55%, rgba(255,255,255,0) 100%)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20 lg:py-28">
          <div className="max-w-xl">
            <h1 id="about-hero-heading" className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
              Building a Sustainable{" "}
              <span className="text-primary-500">Future, Together.</span>
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Community GreenToken was born out of a simple belief: small actions can create a big
              impact. We reward and empower individuals and communities to take sustainable actions
              through transparent, blockchain-verified tokens.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="values-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
            Our Values
          </p>
          <h2 id="values-heading" className="text-3xl font-extrabold text-gray-900 text-center mb-14">
            The Principles That Guide Us
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ Icon, bg, title, desc }) => (
              <div key={title}
                className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="team-heading" className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">
            Meet Our Team
          </p>
          <h2 id="team-heading" className="text-3xl font-extrabold text-gray-900 text-center mb-14">
            The People Behind GreenToken
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {TEAM.map(({ name, role, bio, color, social }) => (
              <div key={name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200">

                {/* Gradient avatar */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-md`}>
                  <span className="text-2xl font-extrabold text-white select-none">
                    {name.charAt(0)}
                  </span>
                </div>

                <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
                <p className="text-xs font-semibold text-primary-600 mt-1 mb-2">{role}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{bio}</p>

                <div className="flex items-center justify-center gap-3">
                  <a href={social.github} aria-label={`${name} on GitHub`}
                    className="text-gray-400 hover:text-gray-800 transition-colors">
                    <GitHubIcon />
                  </a>
                  <a href={social.linkedin} aria-label={`${name} on LinkedIn`}
                    className="text-gray-400 hover:text-blue-600 transition-colors">
                    <LinkedInIcon />
                  </a>
                  <a href={social.twitter} aria-label={`${name} on X (Twitter)`}
                    className="text-gray-400 hover:text-gray-900 transition-colors">
                    <TwitterIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section aria-label="Call to action" className="relative h-80 sm:h-96 lg:h-[420px] overflow-hidden">
        <Image
          src="/assets/image/pages/about-us/about_us_cta_banner.png"
          alt="Green forest background"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Be a part of the change.
          </h2>
          <p className="text-sm text-white/85 mb-7 max-w-md leading-relaxed">
            Join Community GreenToken and start making an impact today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg text-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
            Get Started
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
