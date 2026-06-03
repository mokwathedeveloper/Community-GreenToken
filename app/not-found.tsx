// app/not-found.tsx — Global 404 page
// Rendered by Next.js when no matching route is found.
// Owner: RockieRaheem | Rule R-A11Y-01: focus-visible, proper heading hierarchy

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Image src="/branding/community-greentoken-logo.png" alt="" width={40} height={40} />
        <span className="font-bold text-gray-900 text-lg">
          Community <span className="text-primary-600">GreenToken</span>
        </span>
      </Link>

      {/* Eco-themed 404 illustration */}
      <div className="text-7xl mb-6" role="img" aria-label="Wilted plant">🌱</div>

      <h1 className="text-6xl font-extrabold text-gray-900 mb-3">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
        This page seems to have gone off the grid — just like we wish our carbon footprint would.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          Go to Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          Go to Dashboard
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-10">
        Lost? Try the{" "}
        <Link href="/how-it-works" className="text-primary-600 hover:underline">
          How It Works
        </Link>{" "}
        page or{" "}
        <Link href="/pricing" className="text-primary-600 hover:underline">
          view our plans
        </Link>
        .
      </p>
    </div>
  );
}
