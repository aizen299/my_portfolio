import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SITE, SITE_URL, SOCIALS } from "@/lib/content";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { EasterEggs } from "@/components/fx/easter-eggs";
import { ChatWidget } from "@/components/fx/chat-widget";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — software engineer · devsecops · blockchain`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Software engineer building DevSecOps platforms, distributed systems, and cross-chain blockchain protocols in Go, C++, Python, TypeScript, and Solidity.",
  keywords: [
    "Aditya Raina",
    "aizen299",
    "software engineer",
    "DevSecOps",
    "DevOps",
    "blockchain engineer",
    "distributed systems",
    "Next.js",
    "WebGL",
    "portfolio",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.alias,
    title: `${SITE.name} — software engineer · devsecops · blockchain`,
    description:
      "DevSecOps platforms, self-healing infrastructure, and cross-chain protocols.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — software engineer · devsecops · blockchain`,
    description:
      "DevSecOps platforms, self-healing infrastructure, and cross-chain protocols.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  alternateName: SITE.alias,
  url: SITE_URL,
  email: `mailto:${SITE.email}`,
  jobTitle: "Software Engineer",
  knowsAbout: [
    "DevSecOps",
    "Distributed Systems",
    "Kubernetes",
    "Smart-Contract Security",
    "Cross-Chain Protocols",
    "Network Security",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Vellore Institute of Technology",
  },
  sameAs: SOCIALS.filter((s) => s.label !== "email").map((s) => s.href),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read theme cookie so the server renders the correct class — eliminates
  // the SSR/client className mismatch and the dev-mode hydration error.
  const jar = await cookies();
  const theme = jar.get("aizen-theme")?.value === "light" ? "light" : "";

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased${theme ? ` ${theme}` : ""}`}
      suppressHydrationWarning
    >
      <body className="grain min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
        <EasterEggs />
        <ChatWidget />
      </body>
    </html>
  );
}
