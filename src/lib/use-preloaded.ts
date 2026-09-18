"use client";

import { useEffect, useState } from "react";

/**
 * Resolves true once the preloader has finished (it dispatches
 * `aizen:preloaded` and sets a global flag). Components keyed off this
 * hold their intro animation until the ice-crack reveal completes. Under
 * reduced motion the preloader still fires the event after its quick fade.
 */
export function usePreloaded(): boolean {
  const [ready, setReady] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window as Window & { __aizenPreloaded?: boolean }).__aizenPreloaded
  );

  useEffect(() => {
    if (ready) return;
    // On a warm reload the preloader announces synchronously on mount — it sets
    // the flag AND dispatches the event before this effect attaches its
    // listener, so the event is already gone. Re-check the flag so we resolve
    // immediately instead of waiting for the safety-net timeout (which left the
    // hero name hidden below its mask on every reload).
    if ((window as Window & { __aizenPreloaded?: boolean }).__aizenPreloaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with an external system (the preloader's window flag): the signal already fired before this effect ran, so resolve immediately instead of hanging until the safety-net timeout.
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener("aizen:preloaded", onReady, { once: true });
    // safety net in case the event is missed
    const t = window.setTimeout(() => setReady(true), 4000);
    return () => {
      window.removeEventListener("aizen:preloaded", onReady);
      window.clearTimeout(t);
    };
  }, [ready]);

  return ready;
}
