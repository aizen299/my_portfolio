import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/fx/scroll-progress";
import { ArchitectureDiagram } from "@/components/sections/architecture-diagram";
import { PROJECTS } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main className="flex-1 px-6 pt-32 lg:px-10">
        {/* Case-study hero — shared-element transition target in Phase 4 */}
        <header className="pb-16">
          <p className="label-mono mb-6">
            {"//"} case study — {project.index}/0{PROJECTS.length}
          </p>
          <h1 className="text-display text-6xl sm:text-7xl lg:text-8xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {project.tagline}
          </p>
        </header>

        <div className="max-w-4xl pb-32">
          {/* Scrolling text column */}
          <div className="flex flex-col gap-16">
            <section aria-label="Overview">
              <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-silver">overview</h2>
              <p className="text-lg leading-relaxed text-foreground/90">
                {project.description}
              </p>
            </section>

            <section aria-label="Metrics">
              <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-silver">metrics</h2>
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex flex-col gap-2 bg-background p-6"
                  >
                    <dd className="text-display text-2xl text-ice">
                      {metric.value}
                    </dd>
                    <dt className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {metric.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-label="Architecture">
              <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-silver">architecture</h2>
              <ArchitectureDiagram nodes={project.architecture} />
            </section>

            <section aria-label="Stack">
              <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-silver">stack</h2>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs uppercase tracking-wider text-foreground/80 border-silver/40"
                    >
                      {tech}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            {(project.links.repo || project.links.live) && (
              <section aria-label="Links">
                <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-silver">links</h2>
                <div className="flex flex-wrap gap-4">
                  {project.links.repo && (
                    <a
                      href={project.links.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-ice hover:text-ice"
                    >
                      github ↗
                    </a>
                  )}
                  {project.links.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-signal/30 bg-signal/5 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal/10"
                    >
                      live site ↗
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Next-project footer */}
        <Link
          href={`/projects/${next.slug}`}
          className="group block border-t py-16"
        >
          <p className="label-mono mb-4">next project</p>
          <p className="text-display text-5xl transition-colors group-hover:text-signal sm:text-6xl">
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
