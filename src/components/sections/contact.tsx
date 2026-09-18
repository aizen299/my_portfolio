import { SectionHeading } from "@/components/layout/section-heading";
import { ContactForm } from "./contact-form";
import { ContactBeacon } from "@/components/webgl/contact-beacon";
import { SITE } from "@/lib/content";

/**
 * 06 — Signal. The particle journey converges into a pulsing beacon
 * sphere here; the form validates with zod, posts to the Resend-backed
 * API (honeypot + rate-limited), and bursts particles on success.
 */
export function Contact() {
  return (
    <section
      id="signal"
      aria-label="Contact"
      className="relative overflow-hidden px-6 py-32 lg:px-10"
    >
      {/* Soft glow backdrop + reduced-motion fallback for the beacon */}
      <div
        aria-hidden
        className="absolute left-1/2 top-24 -z-20 size-[36rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,122,69,0.10), rgba(245,177,76,0.05) 40%, transparent 70%)",
        }}
      />
      <ContactBeacon />

      <SectionHeading index="08" label="signal" title="Signal" />

      <div className="mt-16 grid gap-16 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <h3 className="text-display text-4xl sm:text-5xl">
            initiate
            <br />
            contact<span className="text-signal">_</span>
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Open to internships, security work, and ambitious builds. Signal
            travels fastest by email — the form transmits straight to my
            inbox.
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="font-mono text-sm text-ice transition-colors hover:text-signal"
          >
            {SITE.email}
          </a>
        </div>

        {/* Glass panel — the form sits over the WebGL beacon, so it needs
            a frosted backdrop to stay readable (design-system rule). */}
        <div className="glass rounded-xl p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
