// Social proof — "Trusted by organizations" section per mockup
// Spec §1: SocialProof component — logos or short quotes
// Owner: RockieRaheem

import type { SocialProofOrg } from "@/lib/data/pricingData";

interface SocialProofProps {
  orgs: SocialProofOrg[];
}

export default function SocialProof({ orgs }: SocialProofProps) {
  return (
    <section
      aria-label="Organizations using Community GreenToken"
      className="py-14 bg-white border-t border-b border-gray-100"
    >
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-8">
          Trusted by Organizations
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {orgs.map(({ name, emoji, desc }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl" aria-hidden="true">{emoji}</span>
              <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{name}</p>
              <p className="text-xs text-gray-400 text-center">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
