/**
 * Site content — sourced from Aditya's resume, LinkedIn, and GitHub
 * (github.com/aizen299).
 */

export const SITE = {
  name: "Aditya Raina",
  alias: "AIZEN://VOID",
  email: "rainaaditya58@gmail.com",
  roles: ["software engineer", "devsecops builder", "blockchain engineer"],
  status: "open to work",
} as const;

/**
 * Canonical site origin (no trailing slash). An explicit NEXT_PUBLIC_SITE_URL
 * wins; otherwise use the free *.vercel.app production domain Vercel injects.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://my-portfolio-tau-inky-70.vercel.app")
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
  { value: 2, suffix: "", label: "internships" },
  { value: 5, suffix: "", label: "systems" },
  { value: 900, suffix: "+", label: "tests" },
  { value: 3, suffix: "", label: "certs" },
] as const;

export const STACK_MARQUEE = [
  "Go",
  "C/C++",
  "Python",
  "Java",
  "Rust",
  "TypeScript",
  "Solidity",
  "Next.js",
  "FastAPI",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "GitHub Actions",
  "Kafka",
  "Prometheus",
  "Grafana",
  "Foundry",
  "Anchor",
  "Noir",
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
  /** Ordered architecture flow — drawn in on the case-study page. */
  architecture: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "secureops",
    index: "01",
    title: "SecureOps",
    tagline: "Contextual DevSecOps security platform",
    description:
      "Go/Chi platform that orchestrates six scanners — Gitleaks, Syft, Grype, Semgrep, Trivy, and OWASP ZAP — behind one adapter interface. Output is normalised into a canonical finding model keyed by a collision-resistant SHA-256 fingerprint, correlated across security domains into contextual issues, and scored by a deterministic 5-factor risk engine. Shipped four ways from one codebase: REST API, Next.js dashboard, a CI client with a three-value exit contract, and a GitHub Action — hardened with Argon2id accounts, project-scoped RBAC, transactional append-only audit logging, and a Helm chart that refuses any image not pinned by digest.",
    stack: ["Go", "Chi", "Next.js", "PostgreSQL", "Helm", "GitHub Actions"],
    metrics: [
      { value: "6", label: "scanners unified" },
      { value: "5-factor", label: "risk engine" },
      { value: "4", label: "delivery surfaces" },
    ],
    links: { repo: "https://github.com/aizen299/secure-dev" },
    accent: "#34D399",
    architecture: [
      "Scanner adapters — Gitleaks, Syft, Grype, Semgrep, Trivy, ZAP",
      "Canonical finding model — SHA-256 fingerprint dedup",
      "Cross-domain correlation — findings → contextual issues",
      "Deterministic 5-factor risk scoring",
      "Delivery — REST API, dashboard, CI client, GitHub Action",
    ],
  },
  {
    slug: "chainaudit",
    index: "02",
    title: "ChainAudit",
    tagline: "Multi-chain smart-contract security platform",
    description:
      "Smart-contract security scanner that maps 51 Slither detectors to 30 CVSS-scored rules and adds 23 Solana/Rust pattern rules, with automatic chain detection across 7 EVM networks and Solana. A Random Forest model ranks findings by exploitability (88% accuracy). Shipped three ways from one codebase — a PyPI CLI, a GitHub Marketplace Action, and a Next.js/FastAPI web app — hardened with ES256/JWKS token verification, Postgres row-level security, and a blocking CI gate that fails builds on CRITICAL findings.",
    stack: ["Python", "Slither", "FastAPI", "Next.js", "scikit-learn", "PostgreSQL"],
    metrics: [
      { value: "53", label: "detection rules" },
      { value: "8", label: "chains supported" },
      { value: "88%", label: "exploitability model" },
    ],
    links: {
      repo: "https://github.com/aizen299/smart-contract-auditor",
      live: "https://chainaudit.vercel.app",
    },
    accent: "#F59E0B",
    architecture: [
      "Chain detection — 7 EVM networks + Solana",
      "Slither detectors → 30 CVSS-scored rules",
      "Solana/Rust pattern engine — 23 rules",
      "Random Forest — exploitability ranking",
      "Delivery — PyPI CLI, Marketplace Action, web app",
    ],
  },
  {
    slug: "self-healing-iot",
    index: "03",
    title: "Self-Healing IoT Fleet",
    tagline: "Edge fleet with Kubernetes-operator auto-recovery",
    description:
      "Java 21 self-healing edge/IoT platform across 5 Maven modules and 279 tests. Fifty simulated MQTT devices are monitored by a gateway with dual-path failure detection — broker Last Will plus heartbeat timeout — streaming to Kafka and persisting to a time-series store. A 300-line Kubernetes operator replaces dead pods idempotently using an API-server-enforced SHA-256 recovery id, measured at 1332 ms median MTTR across 20 samples with a 20/20 success rate.",
    stack: ["Java 21", "MQTT", "Kafka", "Kubernetes", "Prometheus", "Grafana"],
    metrics: [
      { value: "1332 ms", label: "median MTTR" },
      { value: "20/20", label: "recovery success" },
      { value: "279", label: "tests" },
    ],
    links: { repo: "https://github.com/aizen299/self-healing-iot" },
    accent: "#A78BFA",
    architecture: [
      "Device simulator — 50 MQTT edge devices",
      "Gateway — Last Will + heartbeat failure detection",
      "Kafka — telemetry and failure event streams",
      "Time-series store — fleet history",
      "Kubernetes operator — idempotent pod recovery",
    ],
  },
  {
    slug: "deep-packet-inspection",
    index: "04",
    title: "Deep Packet Inspection",
    tagline: "Multi-threaded C++ DPI engine with ML anomaly detection",
    description:
      "Multi-threaded C++17 deep packet inspection engine using 5-tuple hash routing for flow affinity. Parses Ethernet/IP/TCP/UDP and extracts TLS SNI, HTTP Host, and DNS metadata to classify traffic by application; the parsers are hardened against untrusted input with a fuzzing harness validating 85,000+ malformed packets under ASan, UBSan, and TSan. A FastAPI Isolation Forest service provides percentile-calibrated risk scoring, served via a Node.js/Express control plane to a Next.js WebSocket dashboard, containerised with Docker Compose and gated by a five-stage CI pipeline.",
    stack: ["C++17", "FastAPI", "scikit-learn", "Node.js", "Next.js", "Docker"],
    metrics: [
      { value: "85k+", label: "fuzzed packets" },
      { value: "3", label: "sanitizers clean" },
      { value: "5-stage", label: "CI pipeline" },
    ],
    links: {
      repo: "https://github.com/aizen299/Deep_Packet_Inspection_V2",
      live: "https://dpi-dashboard-9gk9.onrender.com/",
    },
    accent: "#FB923C",
    architecture: [
      "PCAP ingest — 5-tuple hash routing to worker threads",
      "Protocol parsers — Ethernet / IP / TCP / UDP",
      "Metadata extraction — TLS SNI, HTTP Host, DNS",
      "Isolation Forest — calibrated anomaly risk scores",
      "Express control plane → Next.js WebSocket dashboard",
    ],
  },
  {
    slug: "aegis-protocol",
    index: "05",
    title: "Aegis Protocol",
    tagline: "Modular cross-chain DeFi & Web3 infrastructure",
    description:
      "Modular DeFi protocol spanning Arbitrum and Solana — vault, oracle network, DAO governance, and zk privacy — in Solidity, Rust/Anchor, Go, and Noir. Cross-chain governance runs over Wormhole: proposals passed on Arbitrum execute on Solana behind a timelock, a program allowlist, and caps on measured treasury outflow. UUPS-upgradeable contracts are checked for storage-layout safety, a chain-agnostic Go indexer is idempotent and reorg-safe, and zk proofs run in-browser. Covered by 900+ automated tests, including 45 end-to-end tests against real local chains, mutation testing, and Slither, enforced through per-layer CI.",
    stack: ["Solidity", "Rust/Anchor", "Go", "Noir", "Wormhole", "Foundry"],
    metrics: [
      { value: "900+", label: "automated tests" },
      { value: "2", label: "chains bridged" },
      { value: "45", label: "e2e tests" },
    ],
    links: { repo: "https://github.com/aizen299/aegis-protocol" },
    accent: "#EF4444",
    architecture: [
      "Vault — UUPS-upgradeable, storage-layout checked",
      "Oracle network — decentralized price feeds",
      "DAO governance — Arbitrum proposals via Wormhole",
      "Solana execution — timelock, allowlist, outflow caps",
      "Go indexer — idempotent, reorg-safe; in-browser zk proofs",
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
    role: "DevOps Intern",
    org: "IBM",
    period: "May 2026 – Jul 2026",
    points: [
      "Built and maintained CI/CD pipelines using Jenkins, GitHub Actions, and containerised services with Docker/Kubernetes to automate and streamline deployment workflows.",
      "Provisioned cloud infrastructure with Terraform and Ansible, and configured Grafana and Nagios dashboards for monitoring system health and pipeline performance.",
    ],
  },
  {
    role: "Chairman",
    org: "VIT Blockchain Community",
    period: "Leadership",
    points: [
      "Organised Web3 workshops, hackathons, and smart-contract development programs across the Ethereum and Solana ecosystems.",
    ],
  },
  {
    role: "AI/ML Intern",
    org: "Coratia Technologies",
    period: "Dec 2023 – Feb 2024",
    points: [
      "Built an NLP-based sentiment analysis system in Python, classifying user sentiment across large-scale text datasets using supervised machine-learning models.",
      "Engineered preprocessing pipelines (tokenisation, vectorisation) and tuned model evaluation metrics, improving classification accuracy.",
    ],
  },
];

export const SKILL_CARDS = [
  {
    id: "fullstack",
    title: "Backend & Web",
    blurb:
      "Production services in Go, Python, and TypeScript — REST APIs, Next.js dashboards, and one codebase shipped as API, CLI, CI client, and GitHub Action.",
    items: ["Go", "Next.js", "FastAPI", "Node.js"],
    featured: true,
  },
  {
    id: "security",
    title: "Security",
    blurb:
      "DevSecOps pipelines that correlate scanner output into real risk, smart-contract auditing, and parsers fuzzed against hostile input under sanitizers.",
    items: ["DevSecOps", "Smart-contract security", "Fuzzing", "Network security"],
    featured: false,
    terminal: true,
  },
  {
    id: "data",
    title: "Cloud & DevOps",
    blurb:
      "CI/CD with Jenkins, GitHub Actions, and Argo CD; infrastructure as code with Terraform and Ansible; Kubernetes operators and Prometheus/Grafana observability.",
    items: ["Kubernetes", "Terraform", "Argo CD", "Prometheus"],
    featured: false,
  },
  {
    id: "blockchain",
    title: "Blockchain",
    blurb:
      "Cross-chain protocols on Ethereum and Solana — ERC-20/721, Anchor programs, Wormhole governance, Noir zk circuits, tested with Foundry and Slither.",
    items: ["Solidity", "Anchor", "Wormhole", "Noir"],
    featured: false,
  },
] as const;

/** Beyond-the-code distinctions — surfaced as badges in the Profile section. */
export const DISTINCTIONS = [
  { label: "Chairman", detail: "VIT Blockchain Community" },
  { label: "Published tooling", detail: "ChainAudit on PyPI & GitHub Marketplace" },
] as const;

export const VAULT_PHILOSOPHY =
  "Security is not a stage at the end of the pipeline — it is the pipeline. Every system I ship assumes hostile input, pins what it runs, and leaves an audit trail.";

export const CERT_ROADMAP = [
  { year: "2023", label: "AI/ML Intern — Coratia Technologies", done: true },
  { year: "cert", label: "IBM Full Stack Software Developer — Coursera", done: true },
  { year: "cert", label: "100xDevs Cohort — Web, Blockchain, DevOps", done: true },
  { year: "cert", label: "IBM DevOps, Agile & Design Thinking", done: true },
  { year: "2026", label: "DevOps Intern — IBM", done: true },
  { year: "2028", label: "M.Tech (Integrated) Software Engineering — VIT (expected)", done: false },
] as const;

export const SOCIALS = [
  { label: "github", href: "https://github.com/aizen299" },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/aditya-raina-ab3a69293",
  },
  { label: "email", href: `mailto:${SITE.email}` },
] as const;
