import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://wavedidwhat.com"),
  title: "Wave — full-stack product & creative engineer",
  description:
    "Selected products, AI tooling and automation. Built solo, shipped in public.",
  openGraph: {
    title: "Wave — full-stack product & creative engineer",
    description: "Selected products, AI tooling and automation.",
    url: "https://wavedidwhat.com",
    type: "website",
  },
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
      </body>
    </html>
  );
}
