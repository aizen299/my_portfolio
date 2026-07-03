"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SECTIONS, SITE } from "@/lib/content";
import { SoundToggle } from "@/components/fx/sound-toggle";
import { ThemeToggle } from "@/components/fx/theme-toggle";

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-void/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 z-[95] flex w-72 flex-col gap-0 bg-[#050507]/95 backdrop-blur-xl border-l border-border transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            navigation
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-signal"
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-1 flex-col px-6 py-8 gap-1">
          {SECTIONS.filter((s) => s.id !== "surface").map((section) => (
            <Link
              key={section.id}
              href={`/#${section.id}`}
              onClick={onClose}
              className="group flex items-center gap-4 rounded px-2 py-3 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-signal active:text-signal"
            >
              <span className="text-ice/50 text-xs group-hover:text-signal transition-colors">
                {section.index}
              </span>
              {section.label}
            </Link>
          ))}
        </nav>

        {/* Footer — Resume */}
        <div className="border-t border-border px-6 py-6">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded border border-ice/30 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ice transition-colors hover:border-signal hover:text-signal"
          >
            View Resume
            <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3">
              <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
              <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Primary"
          className="glass flex items-center justify-between border-x-0 border-t-0 px-6 py-4 lg:px-10"
        >
          <Link
            href="/"
            data-magnetic
            className="inline-block font-mono text-sm tracking-tight text-foreground transition-colors hover:text-signal"
          >
            {SITE.alias}
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {SECTIONS.filter((s) => s.id !== "surface").map((section) => (
              <li key={section.id}>
                <Link
                  href={`/#${section.id}`}
                  className="group whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-signal"
                >
                  <span className="text-ice/60 group-hover:text-signal">
                    {section.index}
                  </span>{" "}
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 whitespace-nowrap font-mono text-xs text-muted-foreground md:flex">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              {SITE.status}
            </div>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded border border-ice/30 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-ice transition-colors hover:border-signal hover:text-signal sm:flex"
            >
              Resume
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-3"
              >
                <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
                <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
              </svg>
            </a>
            <ThemeToggle />
            <SoundToggle />

            {/* Hamburger — mobile only */}
            <button
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-signal lg:hidden"
            >
              <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4.5h14M2 9h14M2 13.5h14" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
