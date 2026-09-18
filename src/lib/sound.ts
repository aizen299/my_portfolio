/**
 * Tiny Web Audio UI sound layer. Muted by default (opt-in), preference
 * persisted. Ticks are synthesized — no audio assets to load. The
 * AudioContext is created lazily on the first user gesture (enabling)
 * to satisfy browser autoplay policies.
 */

const KEY = "aizen-sound";
let enabled = false;
let ctx: AudioContext | null = null;

// --- external store (for useSyncExternalStore — avoids hydration drift) ---
const listeners = new Set<() => void>();
function notify(): void {
  for (const l of listeners) l();
}
export function subscribeSound(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
/** Client snapshot — the live module state. */
export function getSoundSnapshot(): boolean {
  return enabled;
}

export function loadSoundPref(): boolean {
  if (typeof window === "undefined") return false;
  const next = window.localStorage.getItem(KEY) === "on";
  if (next !== enabled) {
    enabled = next;
    notify();
  }
  return enabled;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, value ? "on" : "off");
  }
  if (value) ensureCtx();
  notify();
}

/** Short synthesized blip. No-op when muted. */
export function tick(freq = 660, dur = 0.04, gain = 0.025): void {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}
