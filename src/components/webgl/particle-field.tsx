"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getGPUTier } from "detect-gpu";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/lib/hooks";
import { getThemeSnapshot, subscribeTheme } from "@/lib/theme";
import { particleState } from "./hero-particles";

const HeroParticlesScene = dynamic(() => import("./hero-particles"), {
  ssr: false,
});

/** Particle budget per GPU tier — 60fps over max fidelity. */
const COUNT_BY_TIER: Record<number, number> = {
  0: 0, // no WebGL / blocklisted → keep gradient fallback
  1: 18_000,
  2: 45_000,
  3: 80_000,
};

let cachedCount: number | null = null;

/**
 * The single particle system for the page — fixed, full-viewport, behind
 * all content. It lives across Surface + Profile so the crystal can morph
 * into the bust as the visitor descends (Phase 3), then fades out and
 * pauses before Systems. The radial gradient backdrop doubles as the
 * reduced-motion / no-WebGL fallback. (Later phases extend the journey:
 * dissolve at Projects, beacon at Contact.)
 */
export function ParticleField() {
  const wrapper = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "dark" as const);
  const isLight = theme === "light";
  const [count, setCount] = useState<number | null>(cachedCount);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (cachedCount !== null || reducedMotion) return;
    let cancelled = false;
    getGPUTier()
      .then((tier) => {
        const mobilePenalty = tier.isMobile ? 0.4 : 1;
        const base = COUNT_BY_TIER[tier.tier] ?? 18_000;
        cachedCount = Math.floor(base * mobilePenalty);
        if (!cancelled) setCount(cachedCount);
      })
      .catch(() => {
        cachedCount = 0;
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  // Scroll choreography: morph crystal → bust as Profile arrives, then
  // fade the whole field out as Profile leaves (and pause the loop).
  useEffect(() => {
    if (reducedMotion || !wrapper.current) return;
    const el = wrapper.current;
    gsap.registerPlugin(ScrollTrigger);
    const setOpacity = gsap.quickSetter(el, "opacity");

    const morph = ScrollTrigger.create({
      trigger: "#profile",
      start: "top 88%",
      end: "top 32%",
      onUpdate: (self) => {
        particleState.morph = self.progress;
      },
      onLeave: () => (particleState.morph = 1),
      onLeaveBack: () => (particleState.morph = 0),
      onEnter: () => setPaused(false),
    });

    const fade = ScrollTrigger.create({
      trigger: "#profile",
      start: "bottom 65%",
      end: "bottom 12%",
      onUpdate: (self) => setOpacity(1 - self.progress),
      onLeave: () => setPaused(true),
      onEnterBack: () => setPaused(false),
    });

    return () => {
      morph.kill();
      fade.kill();
      setOpacity(1);
    };
  }, [reducedMotion, count]);

  return (
    <div
      ref={wrapper}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      {/* Gradient backdrop — colours shift for light mode */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(ellipse 80% 60% at 50% 38%, rgba(164,80,10,0.07), transparent 70%), radial-gradient(ellipse 50% 40% at 50% 42%, rgba(185,60,11,0.05), transparent 60%)"
            : "radial-gradient(ellipse 80% 60% at 50% 38%, rgba(245,177,76,0.08), transparent 70%), radial-gradient(ellipse 50% 40% at 50% 42%, rgba(232,225,217,0.05), transparent 60%)",
        }}
      />
      {!reducedMotion && count !== null && count > 0 && (
        <HeroParticlesScene count={count} paused={paused} isLight={isLight} />
      )}
    </div>
  );
}
