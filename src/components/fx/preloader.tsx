"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GSAP_EASE } from "@/lib/motion";

const NAME = "DIVYANSH GUPTA";
const CIPHER = "!<>-_\\/[]{}—=+*^?#█▓▒░";

/* Matching jagged edge for the two halves — the "ice crack". */
const CRACK =
  "100% 52%, 88% 47%, 76% 53%, 64% 48%, 52% 54%, 40% 47%, 28% 52%, 16% 48%, 8% 53%, 0% 49%";
const TOP_CLIP = `polygon(0% 0%, 100% 0%, ${CRACK})`;
const BOTTOM_CLIP = `polygon(100% 100%, 0% 100%, ${[...CRACK.split(", ")]
  .reverse()
  .join(", ")})`;

/**
 * Preloader: mono counter 00→100 while the name decrypts through cipher
 * glyphs, then the overlay splits along a jagged clip-path edge — the
 * ice-crack reveal. Scroll is locked while active. Reduced-motion users
 * get a quick fade instead.
 */
const SESSION_KEY = "divi:loaded";

export function Preloader() {
  // Must start false to match the server-rendered overlay — reading
  // sessionStorage in the initializer made the client render null on
  // same-session reloads and caused an intermittent hydration mismatch.
  // The effect below skips out immediately when the key is already set.
  const [done, setDone] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const topHalf = useRef<HTMLDivElement>(null);
  const bottomHalf = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const name = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // signal the hero to play its intro once the overlay is gone
    const announce = () => {
      (window as Window & { __diviPreloaded?: boolean }).__diviPreloaded = true;
      window.dispatchEvent(new Event("divi:preloaded"));
    };

    // Already ran this session — unblock the hero and drop the overlay
    // right away (back-navigations, warm reloads).
    if (sessionStorage.getItem(SESSION_KEY)) {
      announce();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with an external system (sessionStorage): drop the intro overlay immediately on warm reloads / back-navigation.
      setDone(true);
      return;
    }

    if (!overlay.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.documentElement.classList.add("lenis-stopped");
    const unlock = () =>
      document.documentElement.classList.remove("lenis-stopped");

    const finish = () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      unlock();
      announce();
      setDone(true);
    };

    if (reduced) {
      const t = gsap.to(overlay.current, {
        opacity: 0,
        duration: 0.4,
        delay: 0.3,
        onComplete: finish,
      });
      return () => {
        t.kill();
        unlock();
      };
    }

    const progress = { value: 0 };
    const tl = gsap.timeline({ onComplete: finish });

    // rAF doesn't fire in background tabs — never leave the page locked
    // behind the overlay if the timeline can't run.
    const failsafe = window.setTimeout(() => {
      tl.kill();
      finish();
    }, 6000);

    tl.to(progress, {
      value: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        const p = Math.floor(progress.value);
        if (counter.current)
          counter.current.textContent = String(p).padStart(3, "0");
        if (name.current) {
          // decrypt left → right as the counter advances
          const resolved = Math.floor((p / 100) * NAME.length);
          name.current.textContent = NAME.split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < resolved) return ch;
              return CIPHER[Math.floor(Math.random() * CIPHER.length)];
            })
            .join("");
        }
      },
    })
      .to(content.current, { opacity: 0, duration: 0.25 })
      .to(
        topHalf.current,
        { yPercent: -100, duration: 1.1, ease: GSAP_EASE.inOut },
        "<+0.1"
      )
      .to(
        bottomHalf.current,
        { yPercent: 100, duration: 1.1, ease: GSAP_EASE.inOut },
        "<"
      );

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      unlock();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlay}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[200]"
    >
      <div
        ref={topHalf}
        className="absolute inset-0 bg-void"
        style={{ clipPath: TOP_CLIP }}
      />
      <div
        ref={bottomHalf}
        className="absolute inset-0 bg-void"
        style={{ clipPath: BOTTOM_CLIP }}
      />
      <div
        ref={content}
        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
      >
        <span
          ref={name}
          className="font-mono text-lg tracking-[0.3em] text-silver sm:text-2xl"
        >
          {"█".repeat(NAME.length)}
        </span>
        <span className="label-mono">decrypting identity</span>
      </div>
      <span
        ref={counter}
        className="absolute bottom-8 right-8 font-mono text-5xl tabular-nums text-ice"
      >
        000
      </span>
    </div>
  );
}
