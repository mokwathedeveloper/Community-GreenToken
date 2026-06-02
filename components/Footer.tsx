import Link from "next/link";
import Image from "next/image";

// Spec: DESIGN_SPEC.md — dark green footer background (primary-900)

const FOOTER_LINKS = {
  Product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/impact",       label: "Impact" },
    { href: "/pricing",      label: "Pricing" },
    { href: "/leaderboard",  label: "Leaderboard" },
  ],
  Company: [
    { href: "/about",   label: "About Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms",   label: "Terms of Service" },
  ],
  Blockchain: [
    { href: "https://stellar.org", label: "Stellar Network", external: true },
    { href: "https://soroban.stellar.org", label: "Soroban", external: true },
    { href: "https://freighter.app", label: "Freighter Wallet", external: true },
  ],
};

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-primary-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="Community GreenToken home">
              <div className="relative w-9 h-9">
                <Image src="/branding/community-greentoken-logo.png" alt="" fill className="object-contain" sizes="36px" />
              </div>
              <span className="text-sm font-bold">Community GreenToken</span>
            </Link>
            <p className="text-xs text-primary-200 leading-relaxed">
              Rewarding sustainable actions with transparent, blockchain-verified tokens on the Stellar network.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ href, label, external }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="text-sm text-primary-100 hover:text-white transition-colors duration-100"
                    >
                      {label}
                      {external && <span aria-label="(opens in new tab)" className="ml-1 text-xs opacity-60">↗</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-300">
            © {new Date().getFullYear()} Community GreenToken. Built on Stellar.
          </p>
          <p className="text-xs text-primary-400">
            Powered by{" "}
            <Link href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:text-white transition-colors">
              Stellar
            </Link>
            {" · "}
            <Link href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:text-white transition-colors">
              Soroban
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
