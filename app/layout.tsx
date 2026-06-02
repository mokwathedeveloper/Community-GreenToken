import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Community GreenToken — Rewarding Sustainable Actions",
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
      <body className="min-h-full font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
