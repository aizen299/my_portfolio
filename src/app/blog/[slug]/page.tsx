import type { ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/fx/scroll-progress";
import { Prose } from "@/components/blog/prose";
import { getSortedPosts, getPost, formatPostDate } from "@/lib/blog";
import { SITE, SITE_URL } from "@/lib/content";

// Slug → post body. Keep in sync with BLOG_POSTS; each body is a typed
// TSX component in src/content/blog/.
import HowIBuiltThisPortfolio from "@/content/blog/how-i-built-this-portfolio";
import BuildingMultiAgentAiSystems from "@/content/blog/building-multi-agent-ai-systems";
import FuzzingForSqliXssAtScale from "@/content/blog/fuzzing-for-sqli-xss-at-scale";

const BODIES: Record<string, ComponentType> = {
  "how-i-built-this-portfolio": HowIBuiltThisPortfolio,
  "building-multi-agent-ai-systems": BuildingMultiAgentAiSystems,
  "fuzzing-for-sqli-xss-at-scale": FuzzingForSqliXssAtScale,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getSortedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [SITE.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = getSortedPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const Body = BODIES[slug];
  if (index === -1 || !Body) notFound();

  const post = posts[index];
  const next = posts[(index + 1) % posts.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(", "),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: SITE.name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE.name,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollProgress />
      <Nav />
      <main className="flex-1 px-6 pt-32 lg:px-10">
        <header className="mx-auto max-w-2xl pb-12">
          <Link
            href="/blog"
            className="label-mono text-muted-foreground transition-colors hover:text-ice"
          >
            ← all logs
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
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

          <h1 className="text-display mt-4 text-4xl sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <ul className="mt-6 flex flex-wrap gap-2">
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
        </header>

        <article className="mx-auto max-w-2xl">
          <Prose>
            <Body />
          </Prose>
        </article>

        {/* Next-log footer */}
        <Link
          href={`/blog/${next.slug}`}
          className="group mx-auto mt-24 block max-w-2xl border-t py-16"
        >
          <p className="label-mono mb-4">next log</p>
          <p className="text-display text-3xl transition-colors group-hover:text-signal sm:text-4xl">
            {next.title}{" "}
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-2"
            >
              →
            </span>
          </p>
        </Link>
      </main>
      <Footer />
    </>
  );
}
