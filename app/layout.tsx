import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DESCRIPTION, SITE_URL, TITLE, personJsonLd } from "@/lib/seo";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${TITLE}`,
  },
  description: DESCRIPTION,
  applicationName: "wavedidwhat",
  authors: [{ name: "Wave", url: SITE_URL }],
  creator: "Wave",
  keywords: [
    "product engineer",
    "full-stack developer",
    "backend engineer",
    "TypeScript",
    "Next.js",
    "Postgres",
    "developer tooling",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "wavedidwhat",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

/**
 * Resolve the theme before first paint so a dark-mode visitor never sees the
 * light background flash. Must stay inline and blocking.
 */
const noFlash = `(function(){try{var s=localStorage.getItem("wave-theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",s||(d?"dark":"light"))}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body data-view="home" suppressHydrationWarning>
        {children}
        {/* structured data: lets search engines render an entity, not just a page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
