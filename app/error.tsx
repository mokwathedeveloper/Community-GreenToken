"use client";

// app/error.tsx — Global error boundary (must be a Client Component)
// Rendered by Next.js App Router when an unhandled error occurs.
// Owner: RockieRaheem | Rule R-A11Y-01: accessible error state

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error:  Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to Sentry or console in production
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6" role="img" aria-label="Error">⚠️</div>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-2 leading-relaxed">
        An unexpected error occurred. Our team has been notified.
      </p>

      {/* Show error digest for support in production */}
      {error.digest && (
        <p className="text-xs text-gray-400 font-mono mb-6">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          Go Home
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        If the issue persists, contact{" "}
        <a href="mailto:support@greentoken.app" className="text-primary-600 hover:underline">
          support@greentoken.app
        </a>
      </p>
    </div>
  );
}
