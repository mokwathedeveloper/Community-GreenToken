import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";

// Load Poppins via Next.js font optimization (self-hosted, no external CSS request needed)
// The `variable` prop exposes --font-poppins CSS custom property on <html>
// globals.css @theme picks it up via: --font-family-sans: var(--font-poppins), ...
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// viewport-fit=cover enables env(safe-area-inset-*) for devices with notches
// (iPhone X/11/12/13/14/15 Dynamic Island, Android punch-hole cameras)
export const viewport: Viewport = {
  width:          "device-width",
  initialScale:   1,
  viewportFit:    "cover",
  themeColor:     "#16a34a",
};

export const metadata: Metadata = {
  title: {
    default: "Community GreenToken",
    template: "%s | Community GreenToken",
  },
  description:
    "A Stellar blockchain-powered SaaS platform that rewards communities for eco-friendly actions with verifiable, on-chain GreenTokens (GTK).",
  keywords: ["sustainability", "blockchain", "Stellar", "eco", "community", "tokens"],
  openGraph: {
    title: "Community GreenToken",
    description: "Rewarding Sustainable Actions. Built on Stellar Blockchain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <head>
        {/* Material Icons — used for inline icon glyphs on leaderboard and labels */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans antialiased bg-white text-gray-900">
        {/* Single UserProvider = one Supabase auth subscription for the whole app */}
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
