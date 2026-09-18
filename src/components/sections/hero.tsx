"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SITE } from "@/lib/content";
import { GSAP_EASE, STAGGER } from "@/lib/motion";
import { usePreloaded } from "@/lib/use-preloaded";
import { ScrambleText } from "@/components/fx/scramble-text";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/lib/hooks";

const LINES = ["ADITYA", "RAINA"];

/**
 * 01 — Surface. The particle crystal now lives in the global
 * <ParticleField/> behind all content. Here: the name reveals per
 * character (masked Y-translate) once the preloader lifts, and the role
 * line cycles identities with a decrypt/scramble animation.
 *
 * The title is visible by default in the markup — JS only hides it (while
 * the preloader overlay covers the screen) and then reveals it. So if the
 * preloader signal is ever missed, or JS doesn't run, the name still shows
 * rather than getting stuck off-screen in its mask.
 */
export function Hero() {
  const ready = usePreloaded();
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const chars = el.querySelectorAll("[data-char]");

    if (reduced) {
      gsap.set(chars, { yPercent: 0 });
      gsap.set(metaRef.current, { opacity: 1 });
      return;
    }

    if (!ready) {
      // hide until the preloader lifts — its overlay (z-200) covers this
      gsap.set(chars, { yPercent: 100 });
      gsap.set(metaRef.current, { opacity: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.to(chars, {
      yPercent: 0,
      duration: 1,
      ease: GSAP_EASE.out,
      stagger: STAGGER.chars,
    }).to(metaRef.current, { opacity: 1, duration: 0.8 }, "-=0.4");
    return () => {
      tl.kill();
    };
  }, [ready, reduced]);

  // Absolute fail-safe: the name must NEVER stay stuck hidden below its mask.
  // If, a few seconds after mount, the reveal hasn't happened (a missed
  // preloader signal, a killed tween, anything), force it visible with an
  // instant set. Runs once; the timer outlives the ~2s preloader + reveal.
  useEffect(() => {
    if (reduced) return;
    const el = titleRef.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      gsap.set(el.querySelectorAll("[data-char]"), { yPercent: 0 });
      if (metaRef.current) gsap.set(metaRef.current, { opacity: 1 });
    }, 4500);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <section
      id="surface"
      aria-label="Hero"
      className="relative flex min-h-screen flex-col justify-end px-6 pb-16 pt-32 lg:px-10"
    >
      <p className="label-mono mb-6">
        {"//"} 01 — surface · {SITE.alias}
      </p>

      <h1
        ref={titleRef}
        className="text-display text-[16vw] leading-[0.9] sm:text-[13vw] lg:text-[11vw]"
        aria-label={`${SITE.name}`}
      >
        {LINES.map((line, l) => (
          <span key={line} className="block" aria-hidden>
            {line.split("").map((ch, i) => (
              <span
                key={`${l}-${i}`}
                className="reveal-mask inline-block align-bottom"
              >
                <span data-char className="inline-block">
                  {ch}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div
        ref={metaRef}
        className="mt-8 flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
      >
        <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
          <ScrambleText
            words={SITE.roles}
            start={ready}
            className="text-ice"
          />
        </p>

        <div className="flex items-center gap-6">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded border border-ice/30 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-ice transition-colors hover:border-signal hover:bg-signal/5 hover:text-signal"
          >
            View Resume
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
              <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
            </svg>
          </a>
          <a
            href="/resume.pdf"
            download="Aditya_Raina_Resume.pdf"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-signal"
          >
            ↓ Download
          </a>
          <div
            className="hidden items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground md:flex"
            aria-hidden
          >
            <span className="block h-12 w-px bg-border" />
            scroll to descend
          </div>
        </div>
      </div>
    </section>
  );
}
