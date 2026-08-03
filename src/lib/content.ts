/**
 * Site content — sourced from Divi's resume (overall.pdf), LinkedIn, and
 * GitHub. Project repo/live URLs and a couple of stats are still pending
 * confirmation (see the questions Divi was asked).
 */

export const SITE = {
  name: "Divyansh Gupta",
  alias: "DIVYANSH://VOID",
  email: "divyanshg2602@gmail.com",
  roles: ["security engineer", "blockchain auditor", "ai backend builder"],
  status: "open to work",
} as const;

/** Canonical site origin (no trailing slash). Override per-deploy. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-divi.vercel.app"
).replace(/\/$/, "");

export const SECTIONS = [
  { id: "surface", index: "01", label: "surface", title: "Hero" },
  { id: "profile", index: "02", label: "profile", title: "About" },
  { id: "record", index: "03", label: "record", title: "Experience" },
  { id: "systems", index: "04", label: "systems", title: "Skills" },
  { id: "core", index: "05", label: "core", title: "Projects" },
  { id: "vault", index: "06", label: "vault", title: "Security" },
  { id: "logs", index: "07", label: "logs", title: "Logs" },
  { id: "signal", index: "08", label: "signal", title: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const STATS = [
  { value: 3, suffix: "+", label: "years building" },
  { value: 3, suffix: "", label: "dev internships" },
  { value: 5, suffix: "", label: "certifications" },
  { value: 150, suffix: "+", label: "students mentored" },
] as const;

export const STACK_MARQUEE = [
  "Python",
  "JavaScript",
  "HTML",
  "CSS",
  "REST APIs",
  "SQL",
  "MySQL",
  "ElasticSearch",
  "Git",
  "GitHub Actions",
  "Linux",
  "Web Crawling",
  "OWASP Top 10",
  "Threat Modeling",
  "Solidity",
  "Ethereum",
] as const;

export interface Project {
  slug: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  links: { live?: string; repo?: string };
  accent: string;
  /** Optional screenshot served from /public/projects/. Falls back to accent gradient. */
  image?: string;
  /** Ordered architecture flow — drawn in on the case-study page. */
  architecture: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "civicshield",
    index: "01",
    title: "CivicShield",
    tagline: "AI threat-intelligence platform & vulnerability scanner",
    description:
      "AI-powered cybersecurity platform with a real-time global threat dashboard. Visualises active attack paths on a 3D globe, auto-classifies severity (Low→Critical), and streams live threat feeds for DDoS, ransomware, and phishing events. Full vulnerability scanner, attack-surface mapper, phishing detector, and API security analyser — backed by CivicShield AI for scan-derived intelligence insights. Hack Energy 2.0 Finalist.",
    stack: [
      "Python",
      "JavaScript",
      "AI/ML",
      "REST APIs",
      "Web Crawling",
      "3D Visualisation",
    ],
    metrics: [
      { value: "Finalist", label: "Hack Energy 2.0" },
      { value: "real-time", label: "global threat feed" },
      { value: "AI-powered", label: "scan intelligence" },
    ],
    links: {
      repo: "https://github.com/Divyansh2602/CivicShield_full",
      live: "https://civicshieldx.vercel.app/",
    },
    accent: "#34D399",
    image: "/projects/civicshield.png",
    architecture: [
      "Real-time threat feed — DDoS/ransomware/phishing events",
      "3D globe — curved cross-border attack-path arcs",
      "Vulnerability scanner — attack-surface mapper",
      "Phishing detection + API security analysis",
      "CivicShield AI — scan-derived intelligence",
    ],
  },
  {
    slug: "ciphermind",
    index: "02",
    title: "CipherMind",
    tagline: "End-to-end encrypted AI chat",
    description:
      "Encrypted AI chat where every message is AES-256-GCM ciphered before leaving the browser — zero plaintext in transit. Session keys are derived via PBKDF2 and integrity is guaranteed by HMAC-SHA512. The Groq Llama 3.3 70B backend runs server-side with the API key fully protected. Tracks encrypted/decrypted message counts, token usage, and HMAC checks per session.",
    stack: [
      "React",
      "TypeScript",
      "AES-256-GCM",
      "PBKDF2",
      "HMAC-SHA512",
      "Groq API",
    ],
    metrics: [
      { value: "AES-256", label: "GCM encryption" },
      { value: "zero", label: "plaintext in transit" },
      { value: "Llama 3.3 70B", label: "Groq backend" },
    ],
    links: {
      repo: "https://github.com/Divyansh2602/ciphermind",
      live: "https://ciphermind-frontend.vercel.app/",
    },
    accent: "#A78BFA",
    image: "/projects/ciphermind.png",
    architecture: [
      "PBKDF2 — session key derivation",
      "AES-256-GCM — message encryption in-browser",
      "HMAC-SHA512 — integrity verification",
      "Groq API — Llama 3.3 70B server-side",
      "Session store — encrypted history + export",
    ],
  },
  {
    slug: "smart-contract-auditor",
    index: "03",
    title: "ChainAudit",
    tagline: "Automated Solidity smart-contract security auditor",
    description:
      "Static analysis engine that parses Solidity smart contracts, extracts the AST, and runs a suite of vulnerability detectors — reentrancy, integer overflow/underflow, unchecked external calls, improper access control, and gas-griefing vectors. Generates structured audit reports with per-finding severity ratings (Critical → Low) and remediation guidance. Built on the blockchain security knowledge from the IBM auditing engagement.",
    stack: [
      "Solidity",
      "JavaScript",
      "AST Analysis",
      "Static Analysis",
      "Web3",
      "Ethereum",
    ],
    metrics: [
      { value: "6+", label: "vulnerability classes" },
      { value: "Critical→Low", label: "severity ratings" },
      { value: "automated", label: "audit reports" },
    ],
    links: {
      repo: "https://github.com/Divyansh2602/smart-contract-auditor",
      live: "https://chainaudit.vercel.app/",
    },
    accent: "#F59E0B",
    image: "/projects/smart-contract-auditor.png",
    architecture: [
      "Solidity parser — AST extraction",
      "Vulnerability detectors — reentrancy, overflow, access control",
      "Unchecked-call + gas-griefing scanners",
      "Severity classifier — Critical / High / Medium / Low",
      "Audit report — structured findings + remediation",
    ],
  },
  {
    slug: "accident-prediction-model",
    index: "04",
    title: "Accident Risk Model",
    tagline: "ML pipeline predicting 2026 road-accident severity & blackspots",
    description:
      "End-to-end machine learning pipeline that ingests road-accident records and predicts 2026 accident occurrences and geographic blackspots — high-risk locations where collisions are statistically concentrated. Exploratory data analysis surfaces hidden patterns; feature engineering extracts time-of-day, weather, road-condition, and vehicle-type signals. The trained classifier outputs risk-tier scores with per-feature importance breakdowns and pinpoints accident-prone zones for targeted intervention.",
    stack: [
      "Python",
      "scikit-learn",
      "pandas",
      "EDA",
      "Feature Engineering",
    ],
    metrics: [
      { value: "ML", label: "severity classifier" },
      { value: "multi-factor", label: "feature engineering" },
      { value: "interpretable", label: "risk-tier output" },
    ],
    links: {
      repo: "https://github.com/Divyansh2602/2026_accident_model",
    },
    accent: "#FB923C",
    image: "/projects/accident-model.png",
    architecture: [
      "Ingest — raw accident records dataset",
      "EDA — pattern & correlation analysis",
      "Feature engineering — time, weather, road, vehicle",
      "Classifier training — severity prediction model",
      "Output — risk-tier scores + feature importance",
    ],
  },
  {
    slug: "securescout",
    index: "05",
    title: "SecureScout",
    tagline: "Enterprise static security scanner for banking systems",
    description:
      "Production-grade security platform built for PSB Hackathon 2026 (UCO Bank × IIT Kharagpur). Detects vulnerable dependencies, hardcoded secrets, weak cryptography, injection flaws, and insecure configurations in Python projects. Ships a full Next.js dashboard with 5-tier RBAC, immutable audit logging, and a CI/CD gate that exits non-zero on Critical findings.",
    stack: [
      "Python",
      "TypeScript",
      "Next.js",
      "Express",
      "PostgreSQL",
      "Redis",
    ],
    metrics: [
      { value: "PSB 2026", label: "UCO Bank × IIT KGP" },
      { value: "5", label: "detector types" },
      { value: "5-tier", label: "RBAC system" },
    ],
    links: {
      repo: "https://github.com/Divyansh2602/securescout-",
      live: "https://securescout-web.vercel.app/",
    },
    accent: "#EF4444",
    image: "/projects/securescout.png",
    architecture: [
      "Python engine — CVE, secret, crypto, injection, config detectors",
      "Express REST API — JWT auth, Zod validation, rate limiting",
      "5-tier RBAC — Viewer → Super Admin per-route guards",
      "Next.js dashboard — scan management, findings, audit trail",
      "CI/CD gate — --fail-on-critical exit code for pipeline blocking",
    ],
  },
];

export interface Experience {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    role: "Backend Engineer",
    org: "XtraGrad",
    period: "1 Jun – 30 Jun 2026",
    points: [
      "Building the backend for an AI-powered HR platform — designing APIs, data models, and AI integration layers for automated recruitment and candidate workflows.",
      "Architecting scalable Python services and integrating LLM-driven features to automate HR decision pipelines end-to-end.",
    ],
  },
  {
    role: "Operations & Management Head",
    org: "VIT Blockchain Community Club",
    period: "2024 – Present",
    points: [
      "Lead general operations and management for the college blockchain community — coordinating events, teams, and technical initiatives across the chapter.",
      "Mentor 150+ students in software engineering, security, and decentralized systems, building a campus pipeline of blockchain and security talent.",
    ],
  },
  {
    role: "Blockchain Developer",
    org: "IBM",
    period: "May 2025 – Jun 2025",
    points: [
      "Audited Ethereum smart contracts for reentrancy, improper access control, and gas-misuse vulnerabilities.",
      "Applied secure coding and input validation to harden contract logic; ran iterative testing cycles to eliminate logic flaws pre-deployment.",
    ],
  },
  {
    role: "Frontend Developer",
    org: "1Stop.ai",
    period: "Jan 2024 – Mar 2024",
    points: [
      "Built and optimised responsive UIs with HTML, CSS, and JavaScript; restructured frontend architecture to cut load times and improve cross-device consistency.",
      "Enforced strict input validation and secure JavaScript patterns, reducing client-side attack surface and improving reliability.",
    ],
  },
];

export const SKILL_CARDS = [
  {
    id: "fullstack",
    title: "Full-Stack",
    blurb:
      "End-to-end platforms with responsive, validated UIs and clean REST APIs. HTML/CSS/JavaScript on the front, modular Python services behind — architected for load times and cross-device consistency.",
    items: ["JavaScript", "Python", "REST APIs", "Responsive UI"],
    featured: true,
  },
  {
    id: "security",
    title: "Security",
    blurb:
      "OWASP Top 10 and threat modeling by default. Smart-contract auditing (reentrancy, access control, gas misuse), parameter fuzzing for SQLi/XSS, and strict input validation to shrink the attack surface.",
    items: ["OWASP Top 10", "Threat modeling", "Smart-contract audit", "Fuzzing"],
    featured: false,
    terminal: true,
  },
  {
    id: "data",
    title: "Backend & Data",
    blurb:
      "Modular Python backends, distributed web crawlers, and data pipelines with per-stage validation and automated reporting — indexed in ElasticSearch for real-time querying.",
    items: ["Data pipelines", "Web crawling", "ElasticSearch", "SQL / MySQL"],
    featured: false,
  },
  {
    id: "blockchain",
    title: "Blockchain",
    blurb:
      "Ethereum smart-contract development and security auditing at IBM — secure coding, iterative testing, and logic-flaw elimination before deployment.",
    items: ["Ethereum", "Solidity", "Contract auditing", "Secure coding"],
    featured: false,
  },
] as const;

/** Beyond-the-code distinctions — surfaced as badges in the Profile section. */
export const DISTINCTIONS = [
  { label: "NPTEL Gold Medal", detail: "100 / 100 — Wildlife & Ecology" },
  { label: "State-Level Champion", detail: "Table Tennis" },
] as const;

export const VAULT_PHILOSOPHY =
  "Security is not a feature you bolt on — it is the substrate everything else runs on. Every system I ship assumes hostile input, least privilege, and an audit trail.";

export const CERT_ROADMAP = [
  { year: "2024", label: "Frontend Developer — 1Stop.ai", done: true },
  { year: "2025", label: "Blockchain Developer — IBM", done: true },
  { year: "2026", label: "Google Cybersecurity Professional — Coursera", done: true },
  { year: "2026", label: "Hack Energy 2.0 Finalist — CivicShield", done: true },
  { year: "2027", label: "B.Tech CSE — VIT (expected)", done: false },
] as const;

export const SOCIALS = [
  { label: "github", href: "https://github.com/Divyansh2602" },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/divyansh-gupta-485b04377/",
  },
  { label: "email", href: `mailto:${SITE.email}` },
] as const;
