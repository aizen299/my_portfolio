/**
 * Theme store — dark (default) | light.
 * Persisted in localStorage, applied as a class on <html>.
 * Follows the same useSyncExternalStore pattern as sound.ts.
 */

export type Theme = "dark" | "light";

const KEY = "aizen-theme";

// Initialise synchronously from cookie so the first React render already
// has the correct theme — prevents a bright-on-light particles flash.
function readCookieTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const m = document.cookie.match(/aizen-theme=(light|dark)/);
  return m?.[1] === "light" ? "light" : "dark";
}

let current: Theme = readCookieTheme();

const listeners = new Set<() => void>();
function notify() {
  for (const l of listeners) l();
}

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getThemeSnapshot(): Theme {
  return current;
}

function applyClass(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", t === "light");
}

function setCookie(t: Theme) {
  document.cookie = `${KEY}=${t};path=/;max-age=31536000;SameSite=Lax`;
}

let _transitionTimer: ReturnType<typeof setTimeout> | undefined;
function enableTransitions() {
  document.documentElement.classList.add("theme-transitioning");
  clearTimeout(_transitionTimer);
  _transitionTimer = setTimeout(
    () => document.documentElement.classList.remove("theme-transitioning"),
    450,
  );
}

export function loadThemePref(): void {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem(KEY) as Theme | null;
  if (saved === "light" || saved === "dark") {
    current = saved;
    // Migrate to cookie so the next server render applies the class — this
    // eliminates the SSR/client className mismatch going forward.
    setCookie(saved);
    applyClass(current);
    notify();
  }
}

export function setTheme(t: Theme): void {
  current = t;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, t);
    setCookie(t);
    enableTransitions();
  }
  applyClass(t);
  notify();
}
