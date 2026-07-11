import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { getSortedPosts, formatPostDate } from "@/lib/blog";

/**
 * 07 — Logs. Homepage teaser for the blog: the latest three posts as compact
 * rows — title, date, reading time, and topic tags — plus a prominent
 * "read all logs" link to /blog. The full index and post routes live under
 * src/app/blog/. Server-rendered (no client state) so it adds no hydration
 * surface to the homepage.
 */
export function Logs() {
  const posts = getSortedPosts().slice(0, 3);

  return (
    <section id="logs" aria-label="Logs" className="px-6 py-32 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-20">
        {/* Left rail — heading + intro + all-logs link, sticky on desktop */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading index="07" label="logs" title="Logs" />
          <p className="mt-6 text-muted-foreground">
            Field notes from the build — multi-agent AI, WebGL performance, and
            offensive security. Every post traces back to something I actually
            shipped.
          </p>
          <Link
            href="/blog"
            className="group mt-8 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-ice transition-colors hover:text-signal"
          >
            read all logs
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        {/* Right column — the post list fills the remaining width */}
        <ul className="border-t">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 border-b py-8 sm:flex-row sm:justify-between sm:gap-10"
              >
                <div className="min-w-0">
                  <h3 className="text-display text-2xl transition-colors group-hover:text-signal sm:text-3xl">
                    {post.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
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
    </section>
  );
}
