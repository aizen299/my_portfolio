/**
 * Blog ("Logs") metadata. Bodies live as typed TSX components in
 * src/content/blog/ and are mapped by slug in the /blog/[slug] route.
 * Mirrors the PROJECTS pattern in content.ts — add an entry + a body file
 * and the index, nav teaser, and sitemap all pick it up automatically.
 * Keep newest-first.
 */

export interface BlogPost {
  slug: string;
  title: string;
  /** 1–2 sentences — used as the card blurb and the meta description. */
  excerpt: string;
  /** ISO date (absolute). */
  date: string;
  /** Precomputed, e.g. "6 min read". */
  readingTime: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-i-built-this-portfolio",
    title: "How I built this portfolio (and the bug that hid every click)",
    excerpt:
      "80k WebGL particles, GSAP scroll choreography, and a hydration mismatch that silently made the entire site unclickable — a debugging war story.",
    date: "2026-07-06",
    readingTime: "7 min read",
    tags: ["WebGL", "Next.js", "Performance", "Debugging"],
  },
  {
    slug: "building-multi-agent-ai-systems",
    title: "Building multi-agent AI systems that don't fall apart",
    excerpt:
      "What actually breaks when you wire LLMs into a backend — contract-driven service boundaries, local-model fallbacks, and how to make agents testable.",
    date: "2026-06-28",
    readingTime: "6 min read",
    tags: ["AI", "LLMs", "CrewAI", "Backend"],
  },
  {
    slug: "fuzzing-for-sqli-xss-at-scale",
    title: "Fuzzing for SQLi and XSS at scale",
    excerpt:
      "How CivicShield crawls a target, extracts endpoints and parameters from JavaScript, and fuzzes them for injection flaws — offensive security, end to end.",
    date: "2026-06-15",
    readingTime: "5 min read",
    tags: ["Security", "Fuzzing", "OWASP", "Python"],
  },
];

/** Newest-first (already ordered, but sort defensively). */
export function getSortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Human-readable date, e.g. "6 July 2026". */
export function formatPostDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
