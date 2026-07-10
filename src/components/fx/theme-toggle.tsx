"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getThemeSnapshot,
  loadThemePref,
  setTheme,
  subscribeTheme,
} from "@/lib/theme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => "dark" as const
  );

  useEffect(() => {
    loadThemePref();
  }, []);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "light mode" : "dark mode"}
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
        {isLight ? (
          /* Moon — click to go dark */
          <>
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </>
        ) : (
          /* Sun — click to go light */
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        )}
      </svg>
    </button>
  );
}
