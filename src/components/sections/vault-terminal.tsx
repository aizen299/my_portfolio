"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  PROJECTS,
  SITE,
  CERT_ROADMAP,
  SKILL_CARDS,
  SOCIALS,
} from "@/lib/content";

type Line = { kind: "in" | "out" | "sys"; text: string };

const BANNER = [
  `${SITE.alias} — vault shell v1.0`,
  "type 'help' for commands · 'sudo hire me' for the good stuff",
];

const HELP = [
  "available commands:",
  "  help        this list",
  "  whoami      operator identity",
  "  projects    declassified work",
  "  ctf         hackathons & community",
  "  skills      capability matrix",
  "  certs       certification roadmap",
  "  contact     how to reach me",
  "  clear       wipe the screen",
  "  …and a few hidden ones. go on, poke around.",
];

function run(raw: string): Line[] | "clear" {
  const cmd = raw.trim();
  const lower = cmd.toLowerCase();
  if (!cmd) return [];

  switch (lower) {
    case "help":
    case "?":
      return HELP.map((text) => ({ kind: "out", text }));
    case "whoami":
      return [
        { kind: "out", text: `${SITE.name} — ${SITE.roles.join(" · ")}` },
        { kind: "out", text: "VIT M.Tech SE '28 · ex-IBM DevOps · security-first" },
      ];
    case "projects":
      return [
        { kind: "out", text: "declassified work:" },
        ...PROJECTS.map((p) => ({
          kind: "out" as const,
          text: `  ${p.index}  ${p.title} — ${p.tagline}`,
        })),
        { kind: "sys", text: "→ scroll up to /core to open any case study" },
      ];
    case "ctf":
    case "hackathon":
      return [
        { kind: "out", text: "Chairman — VIT Blockchain Community (Web3 hackathons & workshops)" },
        { kind: "out", text: "focus: devsecops · fuzzing · smart-contract security" },
      ];
    case "skills":
      return SKILL_CARDS.map((c) => ({
        kind: "out" as const,
        text: `  ${c.title.padEnd(14)} ${c.items.join(", ")}`,
      }));
    case "certs":
      return CERT_ROADMAP.map((s) => ({
        kind: "out" as const,
        text: `  [${s.done ? "x" : " "}] ${s.year}  ${s.label}`,
      }));
    case "contact":
      return [
        { kind: "out", text: SITE.email },
        ...SOCIALS.map((s) => ({
          kind: "out" as const,
          text: `  ${s.label.padEnd(9)} ${s.href}`,
        })),
      ];
    case "ls":
      return [{ kind: "out", text: "projects/  certs/  skills/  flag.txt" }];
    case "cat flag.txt":
    case "cat flag":
      return [{ kind: "sys", text: "FLAG{th3_v0id_r3w4rds_th3_cur10us}" }];
    case "sudo":
      return [{ kind: "sys", text: "nice try. this user is not in the sudoers file." }];
    case "sudo hire me":
    case "hire me":
      return [
        { kind: "sys", text: "[ACCESS GRANTED] initiating hire sequence…" },
        { kind: "out", text: "candidate: principal-grade, security-first, ships fast." },
        { kind: "out", text: `reach the operator → ${SITE.email}` },
      ];
    case "exit":
    case "quit":
      return [{ kind: "sys", text: "there is no exit. only more shipping." }];
    case "matrix":
      return [{ kind: "sys", text: "wake up, Neo… (try the konami code ↑↑↓↓←→←→ b a)" }];
    case "coffee":
      return [{ kind: "sys", text: "brewing… ☕ 418: I'm a teapot." }];
    case "date":
      return [{ kind: "out", text: new Date().toString() }];
    case "rm -rf /":
    case "rm -rf /*":
      return [
        { kind: "sys", text: "permission denied — this portfolio cannot be deleted." },
        { kind: "sys", text: "(nice instinct, though.)" },
      ];
    case "clear":
      return "clear";
    default:
      if (lower.startsWith("echo "))
        return [{ kind: "out", text: cmd.slice(5) }];
      return [
        { kind: "sys", text: `command not found: ${cmd} — try 'help'` },
      ];
  }
}

/**
 * 05 — Vault. A real interactive shell: type commands, get responses,
 * with easter eggs (`sudo hire me`). Command history via ↑/↓. The
 * differentiator — no other portfolio ships a working security terminal.
 */
export function VaultTerminal() {
  const inputId = useId();
  const [lines, setLines] = useState<Line[]>(() => [
    ...BANNER.map((text) => ({ kind: "sys" as const, text })),
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = () => {
    const entry = value;
    const result = run(entry);
    const echo: Line = { kind: "in", text: entry };
    if (result === "clear") {
      setLines([]);
    } else {
      setLines((prev) => [...prev, echo, ...result]);
    }
    if (entry.trim()) setHistory((h) => [entry, ...h].slice(0, 50));
    setHIndex(null);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = hIndex === null ? 0 : Math.min(hIndex + 1, history.length - 1);
      setHIndex(next);
      setValue(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIndex === null) return;
      const next = hIndex - 1;
      if (next < 0) {
        setHIndex(null);
        setValue("");
      } else {
        setHIndex(next);
        setValue(history[next]);
      }
    }
  };

  return (
    <div
      className="flex h-[28rem] flex-col overflow-hidden rounded-lg border bg-void/80"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span aria-hidden className="size-2.5 rounded-full bg-silver/20" />
        <span aria-hidden className="size-2.5 rounded-full bg-silver/20" />
        <span aria-hidden className="size-2.5 rounded-full bg-silver/20" />
        <p className="ml-2 font-mono text-xs text-muted-foreground">
          {"aditya"}:~/vault
        </p>
      </div>

      <div
        ref={scrollRef}
        data-lenis-prevent
        className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-5 font-mono text-sm leading-relaxed [scrollbar-width:thin]"
      >
        {lines.map((line, i) => (
          <p
            key={i}
            className={
              line.kind === "in"
                ? "text-silver"
                : line.kind === "sys"
                  ? "text-signal/90"
                  : "text-ice/70"
            }
          >
            {line.kind === "in" && (
              <span aria-hidden className="mr-2 text-signal">
                ❯
              </span>
            )}
            <span className="whitespace-pre-wrap break-words">{line.text}</span>
          </p>
        ))}

        <div className="flex items-center text-silver">
          <span aria-hidden className="mr-2 text-signal">
            ❯
          </span>
          <label htmlFor={inputId} className="sr-only">
            Vault terminal command
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Vault terminal command input"
            className="flex-1 bg-transparent font-mono text-sm text-silver caret-signal outline-none"
          />
        </div>
      </div>
    </div>
  );
}
