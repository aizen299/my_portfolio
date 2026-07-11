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
  const [visible, setVisible] = useState(true);
  const [hintOpacity, setHintOpacity] = useState(1);
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

  // Hint fades out after 6 s
  useEffect(() => {
    const t = setTimeout(() => setHintOpacity(0), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || reduced || isTouch || !desktop) return null;

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

      {/* Keyboard hint — fades after 6 s, always pointer-events-none */}
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
        className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/50"
      >
        [G] TOGGLE AGENT · DRIVEN BY SCROLL
      </div>
    </>
  );
}
