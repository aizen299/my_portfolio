"use client";

import { useEffect } from "react";
import { SITE } from "@/lib/content";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Two easter eggs: a styled console signature for the devs who open the
 * inspector, and the Konami code → a brief screen "glitch" + a console
 * acknowledgement. Renders nothing.
 */
export function EasterEggs() {
  useEffect(() => {
    // console signature
    console.log(
      "%cAIZEN://VOID",
      "color:#22D3EE;font-size:22px;font-weight:bold;font-family:monospace;letter-spacing:3px;"
    );
    console.log(
      "%cInspecting the void? I like you already.\nType %csudo hire me%c in the vault terminal.",
      "color:#7DD3FC;font-family:monospace;",
      "color:#22D3EE;font-family:monospace;font-weight:bold;",
      "color:#7DD3FC;font-family:monospace;"
    );
    console.log(
      `%c→ ${SITE.email}`,
      "color:#8593A0;font-family:monospace;"
    );

    // konami code
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      idx = key === KONAMI[idx] ? idx + 1 : key === KONAMI[0] ? 1 : 0;
      if (idx === KONAMI.length) {
        idx = 0;
        document.documentElement.classList.add("konami");
        console.log(
          "%c[ACCESS GRANTED] you found the back door.",
          "color:#22D3EE;font-family:monospace;font-weight:bold;"
        );
        window.setTimeout(
          () => document.documentElement.classList.remove("konami"),
          1100
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
