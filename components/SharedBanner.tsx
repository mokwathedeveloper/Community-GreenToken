import Image from "next/image";
import Link from "next/link";

// Spec: banner/banner_guide.md
// Rule: banner/banner.png is the SHARED banner used across all pages with banner sections.

interface SharedBannerProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCta?: { label: string; href: string };
  overlayStrength?: "light" | "medium" | "dark";
}

const OVERLAY = {
  light:  "bg-black/20",
  medium: "bg-black/35",
  dark:   "bg-black/50",
};

export default function SharedBanner({
  title,
  subtitle,
  ctaLabel,
  ctaHref = "#",
  secondaryCta,
  overlayStrength = "medium",
}: SharedBannerProps) {
  return (
    <section className="relative w-full h-[380px] md:h-[420px] overflow-hidden rounded-none">
      <Image
        src="/assets/image/banner.png"
        alt="Community GreenToken — eco-friendly community illustration"
        fill
        className="object-cover"
        loading="lazy"
        sizes="100vw"
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${OVERLAY[overlayStrength]}`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        {title && (
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-sm">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-base md:text-lg text-white/90 max-w-2xl mb-6">
            {subtitle}
          </p>
        )}
        {(ctaLabel || secondaryCta) && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {ctaLabel && (
              <Link
                href={ctaHref}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm"
              >
                {ctaLabel}
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="px-8 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-colors duration-150 backdrop-blur-sm"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
