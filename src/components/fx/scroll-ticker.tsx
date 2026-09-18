"use client";

import { useEffect, useRef } from "react";

const LINES = [
  "STATUS: ONLINE",
  "LOC: VIT // 12.97°N",
  "ROLE: SWE / DEVSECOPS",
  "STACK: GO / C++ / SOL",
  "CLEARANCE: K8S",
  "UPTIME: 24/7",
  "MODE: SHIP",
  "SIG: ENCRYPTED",
  "BUILD: 2028",
  "VOID: ACTIVE",
];

/**
 * A continuously-scrolling vertical status ticker. Driven by
 * requestAnimationFrame (not a CSS animation) so it always moves in a focused
 * tab — it won't silently freeze under the OS "reduce motion" setting the way
 * a CSS marquee does. The track is duplicated so the wrap is seamless.
 */
export function ScrollTicker() {
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    let raf = 0;
    let offset = 0;
    let last = performance.now();
    const SPEED = 46; // px per second

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      offset -= SPEED * dt;
      const half = el.scrollHeight / 2; // one full copy of the list
      if (half > 0 && -offset >= half) offset += half; // seamless wrap
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className="relative hidden h-[460px] w-12 shrink-0 overflow-hidden rounded-md border border-ice/25 bg-ice/[0.05] sm:block"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <ul
        ref={track}
        className="flex flex-col items-center gap-8 will-change-transform"
      >
        {[...LINES, ...LINES].map((line, i) => (
          <li
            key={`${line}-${i}`}
            className="whitespace-nowrap font-mono text-sm font-semibold uppercase tracking-[0.25em] text-ice/80 [writing-mode:vertical-rl]"
          >
            {line}
            <span className="mx-3 text-ice/50">✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
