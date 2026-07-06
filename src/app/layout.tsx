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
    default: `${SITE.name} — full-stack developer · security engineer`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Full-stack developer and security engineer. End-to-end platforms, data pipelines, attack-surface tooling, and Ethereum smart-contract auditing. Descend through the void.",
  keywords: [
    "Divyansh Gupta",
    "software architect",
    "security engineer",
    "full-stack developer",
    "cybersecurity",
    "cryptography",
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
    title: `${SITE.name} — architect · security engineer · builder`,
    description:
      "Encrypted AI systems, semantic pipelines, offensive security. Descend through the void.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — architect · security engineer · builder`,
    description:
      "Encrypted AI systems, semantic pipelines, offensive security. Descend through the void.",
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
  jobTitle: "Full-Stack Developer & Security Engineer",
  knowsAbout: [
    "Full-Stack Development",
    "Web Application Security",
    "OWASP Top 10",
    "Threat Modeling",
    "Blockchain & Smart-Contract Auditing",
    "Data Pipeline Engineering",
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
  const theme = jar.get("divi-theme")?.value === "light" ? "light" : "";

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
