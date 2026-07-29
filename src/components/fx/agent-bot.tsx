"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/lib/hooks";

const AgentBotScene = dynamic(
  () => import("./agent-bot-scene").then((m) => m.AgentBotScene),
  { ssr: false }
);

export function AgentBot() {
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const isTouch = useMediaQuery("(pointer: coarse)");
  // The scroll-driven floor mapping needs room — skip narrow viewports too.
  const desktop = useMediaQuery("(min-width: 1024px)");
  // Robot is OFF by default — visitors opt in with the [G] key.
  const [visible, setVisible] = useState(false);
  const [hintFaded, setHintFaded] = useState(false);
  // Render nothing until after mount so SSR and the first client render
  // always match — the ssr:false scene chunk can render synchronously on
  // warm reloads and cause an intermittent hydration mismatch otherwise.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate client-only mount gate (see comment above): flips state after hydration to keep SSR and first client render identical.
  useEffect(() => setMounted(true), []);

  // G key toggles the robot on/off
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "g" || e.key === "G") setVisible((v) => !v);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Fade the hint only after the robot is on (they've discovered [G]); while
  // it's off, keep the "wake" note up so the affordance stays discoverable.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setHintFaded(true), 6000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!mounted || reduced || isTouch || !desktop) return null;

  const hintOpacity = visible && hintFaded ? 0 : 1;

  return (
    <>
      {visible && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <AgentBotScene />
        </div>
      )}

      {/* Corner hint — invites the visitor to wake the robot while it's off,
          then fades once it's running. Always pointer-events-none. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 10,
          right: 14,
          zIndex: 40,
          pointerEvents: "none",
          opacity: hintOpacity,
          transition: "opacity 1.5s ease",
        }}
        className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60"
      >
        {visible
          ? "[G] ▸ DISMISS · DRIVEN BY SCROLL"
          : "PRESS [G] TO WAKE THE ROBOT ▸"}
      </div>
    </>
  );
}
