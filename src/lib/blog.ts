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
    slug: "self-healing-iot-operator",
    title: "Self-healing an IoT fleet in 1.3 seconds",
    excerpt:
      "Dual-path failure detection over MQTT, Kafka event streams, and a Kubernetes operator that recovers dead devices exactly once.",
    date: "2026-08-20",
    readingTime: "4 min read",
    tags: ["Kubernetes", "Java", "Kafka", "Reliability"],
  },
  {
    slug: "fuzzing-a-packet-parser",
    title: "Fuzzing a C++ packet parser before trusting it",
    excerpt:
      "How the DPI engine's parsers survived 85,000+ malformed packets under ASan, UBSan, and TSan — and why the harness came before the features.",
    date: "2026-07-30",
    readingTime: "4 min read",
    tags: ["C++", "Fuzzing", "Security", "Networking"],
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
