"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { getGPUTier } from "detect-gpu";
import { SectionHeading } from "@/components/layout/section-heading";
import { ViewTransition } from "@/components/fx/view-transition";
import { PROJECTS, type Project } from "@/lib/content";
import { scrollSignal } from "@/lib/scroll-signal";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/lib/hooks";
import { getThemeSnapshot, subscribeTheme } from "@/lib/theme";
import { useSyncExternalStore } from "react";

const ProjectPanelScene = dynamic(
  () => import("@/components/webgl/project-panel"),
  { ssr: false }
);

function Panel({
  project,
  webgl,
  paused,
  reduced,
  pinRef,
}: {
  project: Project;
  webgl: boolean;
  paused: boolean;
  reduced: boolean;
  pinRef: React.RefObject<HTMLDivElement | null>;
}) {
  const articleRef = useRef<HTMLElement>(null);
  // During the horizontal scroll only ~1-2 of the 5 panels are ever
  // visible at once — pause the rest individually instead of rendering
  // all five WebGL canvases simultaneously the whole time the section
  // is in view. rootMargin renders panels slightly before they're
  // visible so there's no pop-in.
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!webgl) return;
    const el = articleRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: pinRef.current, rootMargin: "0% 50% 0% 50%", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [webgl, pinRef]);

  return (
    <article
      ref={articleRef}
      className={`dark-zone group relative flex shrink-0 flex-col justify-end overflow-hidden rounded-lg border p-6 sm:p-8 lg:p-12 ${
        reduced
          ? "w-full pb-8 pt-64"
          : "h-[78vh] w-[82vw] sm:w-[62vw] lg:w-[48vw]"
      }`}
    >
      {/* Media layer — shared-element morph target into the case study */}
      <ViewTransition name={`project-media-${project.slug}`}>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {project.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-top opacity-35"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: project.image
                ? `linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.18) 100%), linear-gradient(160deg, ${project.accent}22, transparent 60%)`
                : `linear-gradient(160deg, ${project.accent}12, transparent 55%), radial-gradient(ellipse 70% 60% at 60% 28%, ${project.accent}10, transparent 70%)`,
            }}
          />
          {webgl && (
            <ProjectPanelScene accent={project.accent} paused={paused || !inView} />
          )}
        </div>
      </ViewTransition>

      {/* Giant parallax index number */}
      <span
        data-num
        aria-hidden
        className="pointer-events-none absolute -top-10 right-2 select-none text-display text-[11rem] leading-none text-silver/5 lg:text-[16rem]"
      >
        {project.index}
      </span>

      <p className="label-mono mb-4">
        {project.index}/0{PROJECTS.length} · {project.tagline}
      </p>

      <h3 className="text-display text-4xl sm:text-5xl lg:text-6xl">
        {project.title}
      </h3>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {project.stack.slice(0, 4).map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          {project.links.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-ice"
              onClick={(e) => e.stopPropagation()}
            >
              github ↗
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-signal"
              onClick={(e) => e.stopPropagation()}
            >
              live ↗
            </a>
          )}
          <Link
            href={`/projects/${project.slug}`}
            className="font-mono text-xs uppercase tracking-[0.25em] text-ice transition-colors hover:text-signal"
          >
            case study{" "}
            <span
              aria-hidden
              className="inline-block transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * 04 — Core. Pinned horizontal scroll: vertical scrolling drives the
 * panels sideways (ScrollTrigger pin + scrub). Each panel's media is a
 * WebGL plane (hover ripple + scroll-velocity RGB-shift) that morphs into
 * the case-study hero via <ViewTransition>. The giant index number
 * parallaxes at a different speed. Reduced motion → a plain vertical
 * stack, no pin, no WebGL.
 */
export function Projects() {
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "dark" as const);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [webgl, setWebgl] = useState(false);
  const [active, setActive] = useState(true);

  // pinned horizontal scroll only on desktop with motion allowed; phones
  // and reduced-motion get a plain vertical stack (robust native scroll)
  const stacked = reduced || !desktop;

  // feed Lenis velocity to the panel shaders
  useLenis((lenis) => {
    scrollSignal.velocity = lenis.velocity;
  });

  // GPU gate for the shader panels
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    getGPUTier()
      .then((tier) => {
        if (!cancelled) setWebgl(tier.tier >= 2 && !tier.isMobile);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  // pause panel render loops while the section is off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // pinned horizontal scroll + parallax numbers
  useEffect(() => {
    if (stacked || !pinRef.current || !trackRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const pin = pinRef.current;
    const track = trackRef.current;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - pin.clientWidth;

      const horizontal = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          // the section sits inside the skew wrapper (a transformed
          // ancestor) — transform pinning works there; fixed does not
          pinType: "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // each index number drifts opposite the scroll for parallax
      track.querySelectorAll<HTMLElement>("[data-num]").forEach((num) => {
        gsap.fromTo(
          num,
          { xPercent: 16 },
          {
            xPercent: -16,
            ease: "none",
            scrollTrigger: {
              trigger: num.closest("article"),
              containerAnimation: horizontal,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [stacked, webgl]);

  return (
    <section ref={sectionRef} id="core" aria-label="Projects" className="relative">
      <div className="px-6 pb-12 pt-32 lg:px-10">
        <SectionHeading index="05" label="core" title="Core" />
      </div>

      <div
        ref={pinRef}
        className={stacked ? "" : "relative h-screen overflow-hidden"}
      >
        <div
          ref={trackRef}
          className={
            stacked
              ? "flex flex-col gap-6 px-6 pb-6 lg:px-10"
              : "flex h-full w-max items-center gap-6 px-6 lg:px-10"
          }
        >
          {PROJECTS.map((project) => (
            <Panel
              key={project.slug}
              project={project}
              webgl={webgl && theme === "dark"}
              paused={!active}
              reduced={stacked}
              pinRef={pinRef}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
