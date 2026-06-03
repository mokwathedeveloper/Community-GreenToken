import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "stellar.expert" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "horizon-testnet.stellar.org" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Mark @stellar/stellar-sdk as external so Vercel/Turbopack doesn't
  // try to statically bundle it (it uses Node.js native APIs).
  // At runtime on Vercel serverless, Node.js is available so it works fine.
  serverExternalPackages: ["@stellar/stellar-sdk"],
};

export default nextConfig;
