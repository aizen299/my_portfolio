import type { ReactNode } from "react";

/**
 * Prose wrapper for blog post bodies. The `.blog-prose` class (globals.css)
 * styles child h2/h3/p/ul/li/a/code/pre/blockquote with the site's tokens,
 * so post bodies can use plain semantic HTML.
 */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="blog-prose">{children}</div>;
}

/**
 * Fenced code block. `label` is an optional file/lang tag shown in the
 * top bar (e.g. "route.ts", "bash").
 */
export function CodeBlock({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <figure className="dark-zone my-6 overflow-hidden rounded-lg border">
      {label && (
        <figcaption className="label-mono border-b px-4 py-2 text-[10px]">
          {label}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code className="font-mono text-foreground/90">{children}</code>
      </pre>
    </figure>
  );
}

/** Inline callout / aside. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-6 border-l-2 border-signal/50 pl-4 text-muted-foreground">
      {children}
    </blockquote>
  );
}
