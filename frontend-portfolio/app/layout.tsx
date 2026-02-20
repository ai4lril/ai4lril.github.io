import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PortfolioNavbar from "@/components/PortfolioNavbar";
import { SITE_URL, ORG_NAME, ORG_DESCRIPTION } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ILHRF - International Linguistic Heritage Research Foundation",
  description: ORG_DESCRIPTION,
  keywords: [
    "International Linguistic Heritage Research Foundation",
    "ILHRF",
    "linguistic heritage foundation",
    "crowdsourced linguistic data",
    "language data collection",
    "Indian languages",
  ],
  openGraph: {
    title: "ILHRF - International Linguistic Heritage Research Foundation",
    description: ORG_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: ORG_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "ILHRF - International Linguistic Heritage Research Foundation",
    description: ORG_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PortfolioNavbar />
        {children}
      </body>
    </html>
  );
}
