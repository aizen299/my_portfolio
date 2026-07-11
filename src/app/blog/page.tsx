import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/fx/scroll-progress";
import { getSortedPosts, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Logs",
  description:
    "Engineering write-ups on multi-agent AI systems, WebGL performance, and offensive security — grounded in real projects.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Logs — Divyansh Gupta",
    description:
      "Engineering write-ups on multi-agent AI systems, WebGL performance, and offensive security.",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getSortedPosts();

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main className="flex-1 px-6 pt-32 lg:px-10">
        <header className="pb-16">
          <p className="label-mono mb-6">{"//"} logs — writing</p>
          <h1 className="text-display text-6xl sm:text-7xl lg:text-8xl">Logs</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Engineering write-ups — multi-agent AI, WebGL performance, and
            offensive security. Each one traces back to something I actually
            built.
          </p>
        </header>

        <ul className="max-w-3xl border-t pb-32">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block border-b py-10"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <time
                    dateTime={post.date}
                    className="label-mono text-muted-foreground"
                  >
                    {formatPostDate(post.date)}
                  </time>
                  <span aria-hidden className="label-mono text-muted-foreground">
                    ·
                  </span>
                  <span className="label-mono text-muted-foreground">
                    {post.readingTime}
                  </span>
                </div>

                <h2 className="text-display mt-3 text-3xl transition-colors group-hover:text-signal sm:text-4xl">
                  {post.title}
                </h2>

                <p className="mt-3 max-w-2xl text-muted-foreground">
                  {post.excerpt}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Badge
                        variant="outline"
                        className="font-mono text-xs uppercase tracking-wider text-foreground/80 border-silver/40"
                      >
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
