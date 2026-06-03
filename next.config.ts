import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Allow Next.js <Image> to serve images from the symlinked public/ directories
  images: {
    // Remote images (Stellar Explorer, Supabase Storage, etc.)
    remotePatterns: [
      { protocol: "https", hostname: "stellar.expert" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "horizon-testnet.stellar.org" },
    ],
    // Disable image optimization for local static images during development
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
