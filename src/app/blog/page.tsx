import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/fx/scroll-progress";
import { getSortedPosts, formatPostDate } from "@/lib/blog";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Logs",
  description:
    "Engineering write-ups on self-healing infrastructure, DevSecOps, and parser fuzzing — grounded in real projects.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `Logs — ${SITE.name}`,
    description:
      "Engineering write-ups on self-healing infrastructure, DevSecOps, and parser fuzzing.",
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
        <div className="grid gap-12 pb-32 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-20">
          {/* Left rail — title + intro, sticky on desktop */}
          <header className="lg:sticky lg:top-32 lg:self-start">
            <p className="label-mono mb-6">{"//"} logs — writing</p>
            <h1 className="text-display text-6xl sm:text-7xl">Logs</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Engineering write-ups — self-healing infra, DevSecOps, and
              fuzzing. Each one traces back to something I actually
              built.
            </p>
          </header>

          {/* Right column — the post list fills the remaining width */}
          <ul className="border-t">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 border-b py-10 sm:flex-row sm:justify-between sm:gap-10"
                >
                  <div className="min-w-0">
                    <h2 className="text-display text-3xl transition-colors group-hover:text-signal sm:text-4xl">
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
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <time
                      dateTime={post.date}
                      className="label-mono text-muted-foreground"
                    >
                      {formatPostDate(post.date)}
                    </time>
                    <span className="label-mono text-muted-foreground">
                      {post.readingTime}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
