"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getSoundSnapshot,
  isSoundEnabled,
  loadSoundPref,
  setSoundEnabled,
  subscribeSound,
  tick,
} from "@/lib/sound";

const INTERACTIVE = "a, button, [role='button'], [data-magnetic]";

/**
 * Sound on/off toggle (nav). Plays soft synth ticks on hover over
 * interactive elements when enabled — muted by default. Wires a single
 * delegated listener that reads the live enabled state.
 */
export function SoundToggle() {
  // SSR + first client render both read `false`; localStorage is synced in
  // the effect below, after which the store notifies and we re-render.
  const on = useSyncExternalStore(subscribeSound, getSoundSnapshot, () => false);

  useEffect(() => {
    loadSoundPref();
  }, []);

  useEffect(() => {
    let last = 0;
    const onOver = (e: Event) => {
      if (!isSoundEnabled()) return;
      const target = e.target as HTMLElement;
      if (!target.closest?.(INTERACTIVE)) return;
      const now = performance.now();
      if (now - last < 45) return; // throttle
      last = now;
      tick(600 + Math.random() * 140, 0.035, 0.02);
    };
    document.addEventListener("mouseover", onOver, true);
    return () => document.removeEventListener("mouseover", onOver, true);
  }, []);

  const toggle = () => {
    const next = !on;
    setSoundEnabled(next); // notifies the store → re-render
    if (next) tick(880, 0.06, 0.03); // confirm blip
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute interface sounds" : "Enable interface sounds"}
      title={on ? "sound: on" : "sound: off"}
      className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-signal"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M11 5 6 9H2v6h4l5 4z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="m23 9-6 6M17 9l6 6" />
        )}
      </svg>
    </button>
  );
}
