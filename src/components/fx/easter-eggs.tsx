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
      "%cAditya Raina",
      "color:#ff7a45;font-size:22px;font-weight:bold;font-family:monospace;letter-spacing:3px;"
    );
    console.log(
      "%cInspecting the source? I like you already.\nType %csudo hire me%c in the vault terminal.",
      "color:#f5b14c;font-family:monospace;",
      "color:#ff7a45;font-family:monospace;font-weight:bold;",
      "color:#f5b14c;font-family:monospace;"
    );
    console.log(
      `%c→ ${SITE.email}`,
      "color:#9A8C7C;font-family:monospace;"
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
          "color:#ff7a45;font-family:monospace;font-weight:bold;"
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
