import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { contactSchema, HONEYPOT } from "@/lib/contact-schema";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (await isRateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Give it a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  // honeypot: a filled field means a bot — accept silently, send nothing
  const honey = (body as Record<string, unknown>)?.[HONEYPOT];
  if (typeof honey === "string" && honey.trim() !== "") {
    return Response.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? "rainaaditya58@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL ?? "Aditya Raina <onboarding@resend.dev>";

  // No key configured (e.g. local dev) — don't fail the UX, just log.
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY unset — not delivering", {
      name,
      email,
    });
    return Response.json({ ok: true, delivered: false });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Signal from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
    });
    if (error) {
      console.error("[contact] resend error", error);
      return Response.json(
        { error: "Transmission failed. Email me directly." },
        { status: 502 }
      );
    }
    return Response.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] send threw", err);
    return Response.json(
      { error: "Transmission failed. Email me directly." },
      { status: 502 }
    );
  }
}
