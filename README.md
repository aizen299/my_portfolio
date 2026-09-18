# Aditya Raina

Personal portfolio of Aditya Raina — software engineer working across DevSecOps, distributed systems, and cross-chain blockchain protocols. Built as a single long-scroll experience with GPU-adaptive WebGL particle systems, GSAP scroll choreography, and a terminal-style AI chat widget.

**Live → [aditya-raina.vercel.app](https://aditya-raina.vercel.app)**

---

## Features

| Area | Detail |
|---|---|
| **WebGL particle field** | 18k–80k particles (GPU-tier adaptive) forming a crystal silhouette that morphs into a bust as you scroll into the About section — driven by a GLSL `uMorph` uniform, not CPU geometry swaps |
| **Fibonacci beacon** | Contact section's sphere built from a fibonacci-distributed particle cloud with a breathing pulse and slow rotation |
| **Smooth theme toggle** | Dark ↔ Light with zero geometry rebuild — both colour palettes are precomputed; `uColorMix` cross-fades them in the shader; CSS transitions via a scoped `.theme-transitioning` class window |
| **SSR theming** | `aizen-theme` cookie read server-side in the App Router layout so the correct `html.light` class is rendered before hydration — no flash, no mismatch |
| **Horizontal scroll** | GSAP `ScrollTrigger` pin + scrub drives the Projects section sideways; each panel has a WebGL ripple shader with RGB-shift at scroll velocity |
| **View transitions** | Shared-element morph between a project panel and its case-study page via the View Transitions API |
| **AI chat widget** | Terminal-style floating widget powered by Groq with per-IP rate limiting and a keep-warm cron |
| **Vault terminal** | Interactive shell in the Security section with real command responses |
| **Custom cursor** | Fine-pointer only; degrades gracefully on touch |
| **Easter eggs** | Konami code triggers a full-page glitch animation |
| **Resume** | View/download from the nav and hero — no account or form required |
| **Agent companion** | A small wireframe robot that traverses the whole page — Lenis scroll velocity drives it directly between a floor per section, WASD/Space add manual control, `G` toggles it off |

---

## Stack

**Framework**
- [Next.js 16](https://nextjs.org/) — App Router, server components, View Transitions
- [React 19](https://react.dev/) — `useSyncExternalStore` for the theme/sound stores

**3D / WebGL**
- [Three.js r184](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) — custom GLSL shaders, `AdditiveBlending` / `NormalBlending` per theme
- [detect-gpu](https://github.com/pmndrs/detect-gpu) — GPU tier → particle budget

**Animation**
- [GSAP 3](https://gsap.com/) + ScrollTrigger — scroll choreography, morph progress, parallax index numbers
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll; velocity fed to panel shaders

**Styling**
- [Tailwind CSS v4](https://tailwindcss.com/) — `@theme inline` tokens, `oklch` / `color-mix`
- [shadcn/ui](https://ui.shadcn.com/) components

**AI / Backend**
- [groq-sdk](https://github.com/groq/groq-typescript) — LLM backend for the chat widget
- [Groq SDK](https://groq.com/) — Llama 3.3 70B fallback
- [Upstash Redis + Ratelimit](https://upstash.com/) — per-IP rate limiting
- [Resend](https://resend.com/) — contact form emails

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables (see below)
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
# AI chat widget (Groq)
GROQ_API_KEY=

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Contact form emails (Resend)
RESEND_API_KEY=
CONTACT_TO_EMAIL=rainaaditya58@gmail.com
CONTACT_FROM_EMAIL="Aditya Raina <onboarding@resend.dev>"

# Canonical URL for metadata / OG tags (optional — on Vercel it defaults
# to the project's *.vercel.app production domain)
NEXT_PUBLIC_SITE_URL=
```

The site runs without any keys — the chat widget falls back gracefully and the contact form shows an error toast. WebGL, scroll animations, and theming are entirely client-side.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — SSR theme cookie, fonts, JSON-LD
│   ├── globals.css          # Design tokens, dark/light palettes, utilities
│   └── projects/[slug]/    # Case study pages with shared-element transitions
├── components/
│   ├── sections/            # 01 Surface → 07 Signal (one component per section)
│   ├── webgl/               # Particle field, project panel shader, beacon
│   ├── fx/                  # Chat widget, cursor, agent companion, easter eggs, view transition
│   ├── layout/              # Nav, section heading, footer
│   └── providers/           # Lenis smooth scroll provider
└── lib/
    ├── content.ts           # All site copy — projects, experience, skills
    ├── theme.ts             # Dark/light store (useSyncExternalStore pattern)
    └── hooks.ts             # useMediaQuery, reduced-motion query
```

---

## Sections

| # | ID | What it does |
|---|---|---|
| 01 | `surface` | Hero — WebGL crystal particle field, name, roles |
| 02 | `profile` | About — particles morph into a bust silhouette on scroll |
| 03 | `record` | Experience timeline |
| 04 | `systems` | Skills bento grid with marquee |
| 05 | `core` | Projects — pinned horizontal scroll, WebGL panel ripple |
| 06 | `vault` | Security — live terminal, decrypt-on-scroll philosophy, cert roadmap |
| 07 | `signal` | Contact — fibonacci sphere beacon, contact form |

---

## Deployment

Deployed on **Vercel** from the `main` branch of `aizen299/my_portfolio` — every push redeploys. `NEXT_PUBLIC_SITE_URL` is optional (it falls back to `VERCEL_PROJECT_PRODUCTION_URL`); all other env vars are runtime (API routes). `vercel.json` registers a daily cron that keeps `/api/chat` warm.

```bash
npm run build   # production build
npm run start   # production server
```

---

## License

[MIT](LICENSE) — feel free to use the architecture or visual ideas as inspiration. Please don't deploy it as-is with my name and content.

---

*Aditya Raina · [github.com/aizen299](https://github.com/aizen299) · [linkedin](https://www.linkedin.com/in/aditya-raina-ab3a69293) · rainaaditya58@gmail.com*
