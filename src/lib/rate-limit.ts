import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for the contact API. Uses Upstash (distributed, survives
 * multiple serverless instances) when its env vars are present; otherwise
 * falls back to a per-instance in-memory sliding window. Both: 5 requests
 * per 60s per IP.
 */

const WINDOW_MS = 60_000;
const MAX_HITS = 5;

// --- in-memory fallback -------------------------------------------------
const hits = new Map<string, number[]>();
let lastSweep = Date.now();

/** Evict IPs whose newest hit has aged out, so the Map stays bounded to
 *  roughly one window's worth of active clients. */
function sweep(now: number): void {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [ip, times] of hits) {
    if (times.length === 0 || times[times.length - 1] <= now - WINDOW_MS) {
      hits.delete(ip);
    }
  }
}

function memoryLimited(ip: string): boolean {
  const now = Date.now();
  sweep(now);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

// --- Upstash (lazy, only if configured) --------------------------------
let upstash: Ratelimit | null = null;
function getUpstash(): Ratelimit | null {
  if (upstash) return upstash;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  upstash = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(MAX_HITS, "60 s"),
    prefix: "aizenvoid:contact",
  });
  return upstash;
}

/** Returns true if the IP is over the limit. */
export async function isRateLimited(ip: string): Promise<boolean> {
  const rl = getUpstash();
  if (rl) {
    try {
      const { success } = await rl.limit(ip);
      return !success;
    } catch {
      // Upstash unreachable — fail open to the in-memory limiter
      return memoryLimited(ip);
    }
  }
  return memoryLimited(ip);
}
