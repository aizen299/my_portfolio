"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, HONEYPOT, type ContactInput } from "@/lib/contact-schema";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const honeyRef = useRef<HTMLInputElement>(null);

  const fireBurst = useCallback(() => {
    const host = burstRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const dots: HTMLSpanElement[] = [];
    for (let i = 0; i < 22; i++) {
      const d = document.createElement("span");
      d.className =
        "pointer-events-none absolute left-1/2 top-1/2 size-1.5 rounded-full bg-signal";
      host.appendChild(d);
      dots.push(d);
    }
    dots.forEach((d, i) => {
      const a = (i / dots.length) * Math.PI * 2;
      gsap.fromTo(
        d,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: Math.cos(a) * (60 + Math.random() * 80),
          y: Math.sin(a) * (60 + Math.random() * 80),
          opacity: 0,
          scale: 0,
          duration: 0.9 + Math.random() * 0.4,
          ease: "power3.out",
          onComplete: () => d.remove(),
        }
      );
    });
  }, []);

  // Fire the burst only after the success view has actually mounted —
  // calling it inline in onSubmit ran before burstRef was attached.
  useEffect(() => {
    if (status === "sent") fireBurst();
  }, [status, fireBurst]);

  const onSubmit = async (data: ContactInput) => {
    setStatus("sending");
    setServerError(null);
    const honey = honeyRef.current?.value ?? "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, [HONEYPOT]: honey }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setServerError(j.error ?? "Transmission failed.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      reset();
    } catch {
      setServerError("Network error. Email me directly.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        ref={burstRef}
        className="relative flex min-h-[320px] flex-col items-start justify-center gap-4"
      >
        <p className="label-mono text-signal">{"//"} transmission received</p>
        <p className="text-display text-3xl sm:text-4xl">Signal locked in.</p>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks — your message landed straight in my
          inbox. I&apos;ll reply soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-ice transition-colors hover:text-signal"
        >
          send another →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      className="flex flex-col gap-6"
      aria-label="Contact form"
    >
      {/* honeypot — hidden from humans and (via display:none + a
          non-semantic name) from autofill, off the tab order */}
      <div aria-hidden className="hidden">
        <label htmlFor={HONEYPOT}>Leave this field empty</label>
        <input
          ref={honeyRef}
          id={HONEYPOT}
          name={HONEYPOT}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="label-mono">
            name
          </Label>
          <Input id="name" placeholder="your name" {...register("name")} />
          {errors.name && (
            <p className="font-mono text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="label-mono">
            email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@domain.tld"
            {...register("email")}
          />
          {errors.email && (
            <p className="font-mono text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message" className="label-mono">
          message
        </Label>
        <Textarea
          id="message"
          placeholder="what are we building?"
          rows={6}
          {...register("message")}
        />
        {errors.message && (
          <p className="font-mono text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="font-mono text-xs text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        data-magnetic
        disabled={status === "sending"}
        className="w-fit font-mono uppercase tracking-[0.25em]"
      >
        {status === "sending" ? "transmitting…" : "transmit →"}
      </Button>
    </form>
  );
}
