import Link from "next/link";
import Image from "next/image";

function TwitterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

// Spec: DESIGN_SPEC.md — dark green footer background (primary-900)

// Define explicit type so `external` is consistently optional across all link groups
type FooterLink = { href: string; label: string; external?: boolean };
type FooterLinkGroups = Record<string, FooterLink[]>;

const FOOTER_LINKS: FooterLinkGroups = {
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
            <p className="text-xs text-primary-200 leading-relaxed mb-4">
              Rewarding sustainable actions with transparent, blockchain-verified tokens on the Stellar network.
            </p>
            <div className="flex items-center gap-2">
              {[
                { href: "https://twitter.com", label: "Twitter", Icon: TwitterIcon },
                { href: "https://linkedin.com", label: "LinkedIn", Icon: LinkedInIcon },
                { href: "https://github.com/mokwathedeveloper/Community-GreenToken", label: "GitHub", Icon: GitHubIcon },
              ].map(({ href, label, Icon }) => (
                <Link key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-primary-800 hover:bg-primary-700 border border-primary-700 flex items-center justify-center text-primary-300 hover:text-white transition-colors">
                  <Icon />
                </Link>
              ))}
            </div>
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
