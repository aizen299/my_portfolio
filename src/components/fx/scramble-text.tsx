"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/lib/hooks";

const CIPHER = "!<>-_\\/[]{}—=+*^?#01";

/**
 * Cycles a list of strings with a decrypt/scramble transition between
 * each — characters churn through cipher glyphs before resolving. Nod to
 * an encrypted-chat UI. Reduced-motion users get a plain cross-fade of the words.
 */
export function ScrambleText({
  words,
  className = "",
  hold = 2200,
  scrambleMs = 700,
  start = true,
}: {
  words: readonly string[];
  className?: string;
  hold?: number;
  scrambleMs?: number;
  start?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const [index, setIndex] = useState(0);

  // plain rotation under reduced motion
  useEffect(() => {
    if (!reduced || !start) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      hold + scrambleMs
    );
    return () => window.clearInterval(id);
  }, [reduced, start, words.length, hold, scrambleMs]);

  useEffect(() => {
    if (reduced || !start) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let timeout = 0;
    let current = 0;
    let cancelled = false;

    const scrambleTo = (next: string) => {
      const prev = words[current];
      const len = Math.max(prev.length, next.length);
      const t0 = performance.now();

      const frame = (now: number) => {
        if (cancelled) return;
        const p = Math.min(1, (now - t0) / scrambleMs);
        // characters resolve left → right
        const resolved = Math.floor(p * len);
        let out = "";
        for (let i = 0; i < next.length; i++) {
          if (i < resolved) out += next[i];
          else if (next[i] === " ") out += " ";
          else out += CIPHER[Math.floor(Math.random() * CIPHER.length)];
        }
        el.textContent = out;
        if (p < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          el.textContent = next;
          timeout = window.setTimeout(() => {
            current = (current + 1) % words.length;
            setIndex(current);
            scrambleTo(words[current]);
          }, hold);
        }
      };
      raf = requestAnimationFrame(frame);
    };

    el.textContent = words[0];
    timeout = window.setTimeout(() => {
      current = 1 % words.length;
      setIndex(current);
      scrambleTo(words[current]);
    }, hold);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [reduced, start, words, hold, scrambleMs]);

  return (
    <span
      ref={ref}
      className={className}
      aria-live="polite"
      suppressHydrationWarning
    >
      {words[index]}
    </span>
  );
}
