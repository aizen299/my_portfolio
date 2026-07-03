"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import type Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL } from "@/lib/motion";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/lib/hooks";

/**
 * Lenis smooth-scroll backbone. Disabled on touch/coarse-pointer devices so
 * native iOS/Android momentum scroll is used — Lenis event listeners can
 * swallow touchstart events and break link taps on mobile. Also disabled for
 * prefers-reduced-motion. GSAP ScrollTrigger animations still run on mobile;
 * they sync to the native scroll position via the window scroll event.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  // coarse pointer = touch/mobile; skip Lenis so native momentum scroll works
  const isTouch = useMediaQuery("(pointer: coarse)");
  const disabled = reducedMotion || isTouch;

  // Drive Lenis via GSAP ticker (only when Lenis is active).
  useEffect(() => {
    if (disabled) return;
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [disabled]);

  // Keep ScrollTrigger in sync regardless of whether Lenis is running.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (disabled) {
      // On touch/mobile/reduced-motion: sync to the native scroll event.
      window.addEventListener("scroll", ScrollTrigger.update, { passive: true });
      return () => window.removeEventListener("scroll", ScrollTrigger.update);
    }

    // On desktop with Lenis: sync to Lenis' scroll event so ScrollTrigger
    // updates on every smooth frame, not just on native scroll ticks.
    let bound: Lenis | null = null;
    const tryBind = () => {
      const lenis = lenisRef.current?.lenis;
      if (lenis && !bound) {
        bound = lenis;
        lenis.on("scroll", ScrollTrigger.update);
      }
      return !!bound;
    };
    // Lenis instance is created in ReactLenis' own effect — poll briefly.
    let interval: number | undefined;
    if (!tryBind()) {
      interval = window.setInterval(() => {
        if (tryBind()) window.clearInterval(interval);
      }, 50);
    }
    return () => {
      window.clearInterval(interval);
      bound?.off("scroll", ScrollTrigger.update);
    };
  }, [disabled]);

  if (disabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: SCROLL.lerp,
        wheelMultiplier: SCROLL.wheelMultiplier,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
