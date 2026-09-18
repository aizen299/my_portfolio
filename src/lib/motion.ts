/**
 * Aditya Raina — single source of truth for motion.
 *
 * Every animation on the site pulls from these tokens so the whole page
 * moves as one system: `expo.out` for entrances, `power3.inOut` for
 * transitions (GSAP names), with cubic-bezier equivalents for Framer
 * Motion / CSS.
 */

export const EASE = {
  /** Entrances: fast start, long settle. GSAP `expo.out`. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Transitions between states/sections. GSAP `power3.inOut`. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Exits. GSAP `power3.in`. */
  in: [0.55, 0, 1, 0.45] as const,
} as const;

export const GSAP_EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  in: "power3.in",
} as const;

/** Durations in seconds. */
export const DURATION = {
  /** Micro-interactions: hovers, cursor states. */
  fast: 0.3,
  /** Standard element reveals. */
  base: 0.8,
  /** Section-level reveals, large masks. */
  slow: 1.2,
  /** Page transitions, preloader lift. */
  page: 1.6,
} as const;

/** Stagger intervals in seconds. */
export const STAGGER = {
  chars: 0.02,
  lines: 0.08,
  items: 0.1,
} as const;

/** Lenis smooth-scroll config. */
export const SCROLL = {
  /** Higher = snappier (less glide latency). 0.1 felt laggy; keep ≥ 0.14. */
  lerp: 0.16,
  wheelMultiplier: 1,
  /** Max skew (deg) applied to the page at high scroll velocity. */
  maxSkew: 3,
} as const;
