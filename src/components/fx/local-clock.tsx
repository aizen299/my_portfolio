"use client";

import { useEffect, useState } from "react";

/**
 * Live local time in IST (UTC+5:30) — Aditya's timezone — ticking each
 * second. Renders a stable placeholder until mounted to avoid hydration
 * mismatch.
 */
export function LocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--:--"} IST
    </span>
  );
}
