export const site = {
  name: "Wave",
  handle: "wavedidwhat",
  title: ["Full-stack product", "& creative engineer"],
  /** words in `title` that get the highlighter swipe */
  highlight: ["product", "engineer"],
  blurb:
    "I build products end to end — design, code, automation — and ship them in public. Currently open to roles and collaborations.",
  email: "wavedidwhat@gmail.com",
  bubbles: [
    "shipping something right now",
    "yes, solo",
    "ask me about n8n",
    "built in public",
    "wave did what?",
  ],
};

export type ViewKind = "index" | "project" | "about";

/**
 * A piece of evidence for a project. Declaring one without a `src` renders a
 * labelled placeholder, so the layout can be right before the asset exists.
 */
export interface Media {
  kind:
    | "site"
    | "flow"
    | "video"
    | "figma"
    | "image"
    | "brand"
    /* for work with no screen to photograph */
    | "terminal"   // CLI sessions and build output
    | "api"        // a request/response pair
    | "chat"       // bot + AI conversations
    | "arch";      // how the pieces fit together
  /** screenshot, embed URL, or file. omit to show a "pending" slot. */
  src?: string;
  /** where the thing lives — makes the site showcase clickable */
  href?: string;
  /** caption, and the placeholder's description */
  label?: string;
  /** video poster frame */
  poster?: string;
  /**
   * kind "flow": ordered steps shown inside the device, so a visitor can walk
   * a short journey without the site being live. Each src is a screenshot.
   */
  steps?: { src?: string; label: string }[];
  /**
   * kind "site": which frame to draw around it. "phone" uses iPhone 17 Pro Max
   * proportions (1320×2868, ~19.6:9) with the Dynamic Island cut in.
   */
  device?: "browser" | "laptop" | "phone";
  /**
   * kind "site": embed the real page in the device rather than a screenshot.
   * Only works where the target allows framing — for your own sites that means
   * serving `Content-Security-Policy: frame-ancestors` including this origin.
   * Third-party sites (e.g. the VS Code marketplace) will refuse and render
   * blank, so leave this off for them.
   */
  live?: boolean;
  /** kind "terminal": lines of a session. `out` renders as muted output. */
  lines?: { cmd?: string; out?: string; comment?: string }[];
  /** kind "api": the call and what comes back */
  request?: { method: string; path: string; body?: string };
  response?: { status: number; body?: string; note?: string };
  /** kind "chat": a conversation, in order */
  messages?: { from: "user" | "bot" | "tool"; text: string; meta?: string }[];
  /** kind "arch": nodes grouped into tiers, drawn left to right */
  tiers?: { label: string; nodes: string[] }[];
}

/** a row on an index page — points at another view, or straight out to the web */
export interface Entry {
  title: string;
  blurb: string;
  meta: string;
  /** filter bucket on index pages — these lists are going to get long */
  group?: string;
  /** id of the view this row opens */
  view?: string;
  href?: string;
}

/** A deeper narrative for a project: numbered chapters, each able to carry its
 *  own evidence. Optional — a project without one just shows its summary. */
export interface CaseStudy {
  /** one line under the heading, framing why this is worth reading */
  premise: string;
  chapters: {
    label: string;
    title: string;
    body: string[];
    media?: Media[];
  }[];
}

export interface View {
  id: string;
  kind: ViewKind;
  /** dock tooltip */
  label: string;
  /** 1–2 characters drawn in the dock tile */
  mark: string;
  /** false for views reachable only from an index or the header */
  dock: boolean;
  /** dock tile face — flat and saturated, like a real app icon */
  tile: string;
  /** the colour that identifies the project, used to tint the curtain.
   *  defaults to `tile`; set explicitly where the tile face isn't the brand
   *  colour (RelayHelp's tile is white, but the brand is red). */
  brand?: string;
  /** a project's own app icon — a complete square icon, drawn full-bleed */
  appIcon?: string;
  /** a project's glyph-only logo — sits ON the brand tile, contained not cropped.
   *  Use this for non-square logotypes; appIcon stretches them. */
  markSrc?: string;
  /** evidence: screenshots, walkthroughs, Figma files, brand sheets */
  media?: Media[];
  /** softer gradient, used by the About showcase cards */
  gradient: [string, string, string];
  /** curtain fill, per theme */
  tint: { light: string; dark: string };
  kicker: string;
  title: string;
  role?: string;
  period?: string;
  body: string[];
  outcomes?: { value: string; label: string }[];
  stack?: string[];
  entries?: Entry[];
  links?: { label: string; href: string }[];
  /** the long version */
  caseStudy?: CaseStudy;
}

export const views: View[] = [
  // ── dock slot 1 ──────────────────────────────────────────────── index
  {
    id: "product",
    kind: "index",
    label: "Product engineering",
    mark: "PE",
    dock: true,
    gradient: ["#7EB7AA", "#A9D1C6", "#DCEBE4"],
    tile: "#0E7C86",
    brand: "#0E7C86",
    tint: { light: "#8FB89A", dark: "#485C4D" },
    kicker: "Product engineering",
    title: "Things I built as a product engineer",
    period: "2025 — now",
    body: [
      "Own the whole thing or don't take it. Most of what's below went from an empty repo to something running in production — research, design system, schema, frontend, automation, deploy.",
    ],
    entries: [
      {
        title: "RelayHelp",
        group: "Products",
        blurb: "Discord-native support desk. Live, with paying communities.",
        meta: "2025 — now",
        view: "relayhelp",
      },
      {
        title: "Ișę",
        group: "Products",
        blurb: "Jobs platform connecting African talent with global work.",
        meta: "2026",
        view: "ise",
      },
      {
        title: "Collabo",
        group: "Products",
        blurb: "The missing layer that matches creatives with each other.",
        meta: "2025 — now",
        view: "collabo",
      },
      {
        title: "wavedidwhat HQ",
        group: "Internal",
        blurb: "Personal ops PWA that replaced thirty browser tabs.",
        meta: "2026 — now",
        view: "hq",
      },
      {
        title: "Remote Dev Kit",
        group: "Tooling",
        blurb: "VS Code extension that deploys a project in two commands.",
        meta: "2026 — now",
        view: "rdk",
      },
      {
        title: "CourierX",
        group: "Infrastructure",
        blurb: "Email delivery across six providers with automatic failover.",
        meta: "2026",
        view: "courierx",
      },
      {
        title: "MESH",
        group: "Infrastructure",
        blurb: "Real-time event ingestion across multiple chat platforms.",
        meta: "2026",
        view: "syncline",
      },
      {
        title: "Tiximo",
        group: "Products",
        blurb: "Event discovery bot across Telegram, WhatsApp and Discord.",
        meta: "2026",
        view: "tiximo",
      },
      {
        title: "Peeksy",
        group: "Products",
        blurb: "Marketing, dashboard and studio apps in one monorepo.",
        meta: "2026",
        view: "peeksy",
      },
      {
        title: "nullApt",
        group: "Tooling",
        blurb: "Signed, WASM-sandboxed skills and a registry to publish them.",
        meta: "2026",
        view: "nullapt",
      },
      {
        title: "Pulse",
        group: "Products",
        blurb: "Description pending.",
        meta: "2026",
        view: "pulse",
      },
    ],
  },

  // ── dock slot 2 ──────────────────────────────────────────────── index
  {
    id: "freelance",
    kind: "index",
    label: "Freelance",
    mark: "FL",
    dock: true,
    gradient: ["#B98C45", "#D7B06A", "#EFE2BF"],
    tile: "#D9822B",
    brand: "#D9822B",
    tint: { light: "#E8B86D", dark: "#745C37" },
    kicker: "Freelance + contract",
    title: "Work I do for other people",
    period: "Available now",
    body: [
      "Contract and employed engineering for other teams — backend, integrations and automation, on products I don't own.",
      "Kept separate from the projects I built myself, because they're different claims and shouldn't be read as the same one.",
    ],
    entries: [
      {
        title: "GIGA",
        group: "Contract",
        blurb: "Contract engineer — microservices behind one API gateway.",
        meta: "2026",
        view: "giga",
      },
      {
        title: "Mintro",
        group: "Contract",
        blurb: "Contract backend + AI engineer — Plaid, QuickBooks, categorisation.",
        meta: "2026",
        view: "mintro",
      },
      {
        title: "Bean Studio",
        group: "Contract",
        blurb: "Bot and backend engineer — mint drop tooling and services.",
        meta: "TBC",
        view: "beanstudio",
      },
      {
        title: "Shipper.now",
        group: "Contract",
        blurb: "Full-stack backend contractor on an AI app builder.",
        meta: "a few months",
        view: "shipper",
      },
      {
        title: "Honeybyte",
        group: "Contract",
        blurb: "Senior backend engineer on a digital-safety learning app.",
        meta: "2026",
        view: "honeybyte",
      },
    ],
  },

  // ── dock slot 3 ─────────────────────────────────────────────────── index
  {
    id: "opensource",
    kind: "index",
    label: "Open source",
    mark: "OS",
    dock: true,
    gradient: ["#5B7C99", "#8FA9BF", "#D3DFE8"],
    tile: "#2F6F4E",
    brand: "#2F6F4E",
    tint: { light: "#7FA98F", dark: "#3E5A49" },
    kicker: "Open source",
    title: "Contributions",
    period: "ongoing",
    body: [
      "Work on other people's projects — issues, patches and the unglamorous maintenance that keeps tools usable.",
      "PLACEHOLDER: I don't know which repos you contribute to. Send me the list (or your GitHub handle) and I'll replace these rows with real ones.",
    ],
    entries: [
      {
        title: "Project name",
        blurb: "What you contributed — the PR, the fix, the feature.",
        meta: "TBC",
      },
      {
        title: "Project name",
        blurb: "What you contributed — the PR, the fix, the feature.",
        meta: "TBC",
      },
    ],
  },

  // ── dock slots 4–7 ────────────────────────────────────────── projects
  {
    id: "ise",
    kind: "project",
    label: "Ișę",
    mark: "IȘ",
    dock: true,
    gradient: ["#B46F67", "#CD938B", "#E9C9C1"],
    tile: "#C2452D",
    brand: "#EE1E25",
    appIcon: "/icons/ise.svg",
    tint: { light: "#D4867D", dark: "#6A433F" },
    kicker: "Product — in build",
    title: "Ișę",
    role: "Founder, research → engineering",
    period: "2026",
    outcomes: [
      { value: "Pan-African", label: "talent pipeline" },
      { value: "Automation", label: "first architecture" },
    ],
    body: [
      "Ișę means “work” in Yoruba. It connects African talent with global opportunities — because the talent was never the missing piece, the pipeline was.",
      "Founder mode across the whole stack: research, design, engineering, automation. n8n pipelines handle discovery and enrichment so humans only handle decisions.",
    ],
    stack: ["Next.js", "Supabase", "n8n", "Playwright"],
    media: [{ kind: "site", href: "https://studio.wavedidwhat.com/work/ise", label: "the platform" }],
    links: [{ label: "case study", href: "https://studio.wavedidwhat.com/work/ise" }],
  },
  {
    id: "relayhelp",
    kind: "project",
    label: "RelayHelp",
    mark: "RH",
    dock: true,
    gradient: ["#7E96BC", "#AFC0DB", "#DFE8F3"],
    tile: "#FFFFFF",
    brand: "#CE203A",
    tint: { light: "#B4C9DF", dark: "#5A6570" },
    kicker: "Product — live",
    title: "RelayHelp",
    role: "Founder, design + engineering",
    period: "2025 — now",
    outcomes: [
      { value: "Live", label: "in production" },
      { value: "Solo", label: "end-to-end build" },
      { value: "0→1", label: "paying communities" },
    ],
    body: [
      "Communities were paying for support portals their members never opened. RelayHelp puts the whole desk inside Discord, where they already are.",
      "I designed and shipped all of it alone — ticket threads, staff tooling, analytics, billing. Next.js and Supabase underneath, the Discord API doing the heavy lifting at the edge.",
    ],
    stack: ["Next.js", "Supabase", "Discord API", "Postgres"],
    media: [
      { kind: "site", device: "laptop", href: "https://relayhelp.com", label: "the live support desk" },
      { kind: "site", device: "phone", label: "and on a phone" },
      {
        kind: "flow",
        label: "raising a ticket, end to end",
        steps: [
          { label: "member hits /help in Discord" },
          { label: "a private thread opens" },
          { label: "staff triage from the dashboard" },
          { label: "resolved, and logged to analytics" },
        ],
      },
    ],
    caseStudy: {
      premise:
        "A support desk nobody visits is just a ticket graveyard. The fix wasn't a better portal — it was not having one.",
      chapters: [
        {
          label: "the problem",
          title: "Support that lived where nobody was",
          body: [
            "Community managers were paying for helpdesk software their members never opened. The members were in Discord all day; the support portal was a link in a pinned message that got scrolled past.",
            "So tickets arrived as DMs to whoever was online, got answered from memory, and vanished. No history, no ownership, no idea what kept breaking.",
          ],
        },
        {
          label: "the approach",
          title: "Put the desk inside the room",
          body: [
            "Rather than pull people to a portal, RelayHelp opens a private thread in the server they're already in. Members type one command; staff get structure without leaving Discord either.",
            "The hard part isn't the bot — it's making threads behave like tickets. Ownership, status, SLA timers and audit history all have to survive a medium that was never designed to carry them.",
          ],
          media: [
            {
              kind: "chat",
              label: "what a member sees",
              messages: [
                { from: "user", text: "/help my payout is stuck" },
                { from: "tool", text: "thread opened · #ticket-4182 · assigned: unclaimed", meta: "system" },
                { from: "bot", text: "Thread created — only you and staff can see this. Someone will pick it up shortly." },
                { from: "tool", text: "claimed by @mod_kemi · SLA 4h", meta: "system" },
              ],
            },
          ],
        },
        {
          label: "the outcome",
          title: "Live, and paid for",
          body: [
            "Shipped solo end to end: ticket threads, staff tooling, analytics and billing. Communities pay for it, which is the only review that counts.",
            "The analytics turned out to matter more than expected — once you can see what people ask repeatedly, most of the support load becomes a documentation problem.",
          ],
        },
      ],
    },
  },
  {
    id: "rdk",
    kind: "project",
    label: "RDK",
    mark: "RDK",
    dock: true,
    gradient: ["#C69A7A", "#DDB599", "#F0E5D8"],
    tile: "#1A1917",
    brand: "#4EC9B0",
    appIcon: "/icons/rdk.svg",
    tint: { light: "#D4AF8F", dark: "#6B5D4F" },
    kicker: "Developer tooling — shipped",
    title: "Remote Dev Kit",
    role: "Design + engineering",
    period: "2026 — now",
    outcomes: [
      { value: "Published", label: "vs code marketplace" },
      { value: "One file", label: "per project config" },
      { value: "Auto TLS", label: "traefik + let's encrypt" },
    ],
    body: [
      "Shipping a side project used to mean an afternoon of Docker, DNS and certificate archaeology. RDK turns it into two commands and a panel in your editor.",
      "It's a VS Code extension with a CLI underneath. One per-project file drives both — the extension picks up edits on save, and the same config runs `rdk connect` once and `rdk up` from then on. It builds the image on the VPS, attaches the container to the proxy network and issues the certificate, with an optional reaper that stops idle stacks and keeps their volumes.",
    ],
    stack: ["VS Code API", "TypeScript", "Docker", "Traefik", "Let's Encrypt"],
    links: [
      {
        label: "marketplace",
        href: "https://marketplace.visualstudio.com/items?itemName=wavestudio.remote-dev-kit",
      },
      { label: "github", href: "https://github.com/Enochthedev/remote-dev-kit-vscode" },
    ],
    media: [
      {
        kind: "site",
        device: "laptop",
        href: "https://marketplace.visualstudio.com/items?itemName=wavestudio.remote-dev-kit",
        label: "on the VS Code Marketplace",
      },
      {
        kind: "terminal",
        label: "first deploy, start to finish",
        lines: [
          { comment: "one-time: point the project at a host" },
          { cmd: "rdk connect" },
          { out: "✓ context remote-v2portfolio\n✓ wrote .env.remote" },
          { comment: "every deploy after that" },
          { cmd: "rdk up" },
          { out: "[+] Building 31.9s (19/19) FINISHED\n✓ attached to proxy network\n✓ certificate issued — wave.dev.wavedidwhat.com\n✓ live in 48s" },
        ],
      },
    ],
  },
  {
    id: "next",
    kind: "project",
    label: "Next thing",
    mark: "?",
    dock: true,
    gradient: ["#8f8f8f", "#b5b5b5", "#e4e4e4"],
    tile: "#6B665C",
    brand: "#6B665C",
    tint: { light: "#BDBAB4", dark: "#5F5D5A" },
    kicker: "In progress",
    title: "Undecided",
    role: "—",
    period: "2026",
    outcomes: [{ value: "TBD", label: "you haven't picked yet" }],
    body: [
      "Placeholder for the fourth showcase slot. Swap the title, copy and tile gradient in data/site.ts and it drops straight into the dock.",
    ],
    stack: [],
  },

  // ── reachable from an index, not the dock ───────────────────── projects
  {
    id: "collabo",
    kind: "project",
    label: "Collabo",
    mark: "CO",
    dock: false,
    appIcon: "/icons/collabo.png",
    gradient: ["#7E96BC", "#AFC0DB", "#DFE8F3"],
    tile: "#3B5BDB",
    brand: "#3B5BDB",
    tint: { light: "#B4C9DF", dark: "#5A6570" },
    kicker: "Product — MVP",
    title: "Collabo",
    role: "Founder, product + full-stack",
    period: "2025 — now",
    outcomes: [
      { value: "MVP", label: "shipped" },
      { value: "Waitlist", label: "and growing" },
    ],
    body: [
      "Gig platforms match you with work. Nothing matched creatives with each other. Collabo is the missing “let's make something together” layer.",
      "Product design, data model and full-stack build: profiles, portfolios, and project rooms where collaborations actually happen instead of dying in DMs.",
    ],
    stack: ["Next.js", "Supabase", "Postgres"],
    media: [{ kind: "site", label: "the MVP" }],
    links: [{ label: "case study", href: "https://studio.wavedidwhat.com/work/collabo" }],
  },
  {
    id: "hq",
    kind: "project",
    label: "HQ",
    mark: "HQ",
    dock: false,
    gradient: ["#B98C45", "#D7B06A", "#EFE2BF"],
    tile: "#B8860B",
    brand: "#B8860B",
    tint: { light: "#E8B86D", dark: "#745C37" },
    kicker: "Internal — daily driver",
    title: "wavedidwhat HQ",
    role: "Architect + sole engineer",
    period: "2026 — now",
    outcomes: [
      { value: "30 → 1", label: "tabs replaced by one app" },
      { value: "Daily", label: "runs the whole operation" },
    ],
    body: [
      "Running products, content, a job hunt and a life used to mean thirty browser tabs. Now it's one installable PWA that runs itself.",
      "Content pipelines, job-hunt automation, a learning tracker and OSINT tooling — Supabase as the spine, n8n as the nervous system, Postiz for distribution.",
    ],
    stack: ["Next.js PWA", "Supabase", "n8n", "Postiz"],
    media: [{ kind: "site", label: "the ops PWA" }],
    links: [{ label: "case study", href: "https://studio.wavedidwhat.com/work/wave-hq" }],
  },


  // ── library only: reachable from an index, never in the dock ────────────
  {
    id: "peeksy",
    kind: "project",
    label: "Peeksy",
    mark: "PK",
    dock: false,
    tile: "#4B3BD6",
    brand: "#4B3BD6",
    appIcon: "/icons/peeksy.svg",
    gradient: ["#6E5DE8", "#9E93F0", "#DCD8FA"],
    tint: { light: "#8578E4", dark: "#3A2E9E" },
    kicker: "Product",
    title: "Peeksy",
    role: "Design + engineering",
    period: "2026",
    body: [
      "PLACEHOLDER: a monorepo with marketing, dashboard and studio apps — but no README, so I haven't guessed at what it does. One line from you and I'll write this properly.",
    ],
    stack: ["Next.js", "TypeScript"],
  },
  {
    id: "nullapt",
    kind: "project",
    label: "nullApt",
    mark: "NA",
    dock: false,
    tile: "#161616",
    brand: "#5CE1B6",
    gradient: ["#2B2B2B", "#5C5C5C", "#C8C8C8"],
    tint: { light: "#7FD9BE", dark: "#1E4A3E" },
    kicker: "Tooling",
    title: "nullApt",
    role: "Design + engineering",
    period: "2026",
    body: [
      "PLACEHOLDER: it has a web app and a registry, and there's a nullapt CLI on this machine for signing and publishing WASM-sandboxed skills — but I'd rather you describe it than have me infer it from tooling.",
    ],
    stack: ["Rust", "WASM", "TypeScript"],
  },
  {
    id: "courierx",
    kind: "project",
    label: "CourierX",
    mark: "CX",
    dock: false,
    tile: "#1F6FEB",
    brand: "#1F6FEB",
    appIcon: "/icons/courierx.svg",
    gradient: ["#3B82F6", "#7DAEF9", "#D6E6FD"],
    tint: { light: "#6FA6F5", dark: "#154A9E" },
    kicker: "Infrastructure",
    title: "CourierX",
    role: "Design + engineering",
    period: "2026",
    body: [
      "Email delivery breaks in the least convenient way: a provider degrades and you hear about it from your users. CourierX routes across six — SendGrid, Mailgun, SES, Postmark, Resend and raw SMTP — with priority-based selection and automatic failover.",
      "Webhook processing keeps delivery status current in real time, so a bounce is a signal rather than a surprise.",
    ],
    stack: ["Node.js", "Postgres", "Webhooks"],
    media: [
      { kind: "site", device: "laptop", href: "https://courierx.dev", label: "the routing API" },
      {
        kind: "api",
        label: "one call, whichever provider is healthy",
        request: {
          method: "POST",
          path: "/v1/send",
          body: '{\n  "to": "user@example.com",\n  "template": "welcome",\n  "strategy": "failover"\n}',
        },
        response: {
          status: 202,
          note: "queued",
          body: '{\n  "id": "msg_8f21c",\n  "provider": "sendgrid",\n  "attempt": 1,\n  "fallbacks": ["ses", "mailgun"]\n}',
        },
      },
    ],
    links: [{ label: "courierx.dev", href: "https://courierx.dev" }],
  },
  {
    id: "giga",
    kind: "project",
    label: "GIGA",
    mark: "GG",
    dock: false,
    tile: "#B0472B",
    brand: "#B0472B",
    gradient: ["#D4653F", "#E6997D", "#F7DCD1"],
    tint: { light: "#D98668", dark: "#7A3020" },
    kicker: "Role — contract",
    title: "GIGA",
    role: "Contract engineer",
    period: "2026",
    body: [
      "A multi-service platform behind a single API gateway, with an admin dashboard over the top and documented flows for the teams consuming it.",
      "The interesting part is the seam: microservices are easy to draw and hard to operate, so most of the work is in the gateway and in the docs that keep frontend and mobile developers unblocked.",
      "Contract engagement — I engineered on this, I don't own it.",
    ],
    stack: ["API Gateway", "Microservices", "Docker"],
  },
  {
    id: "mintro",
    kind: "project",
    label: "Mintro",
    mark: "MN",
    dock: false,
    tile: "#FFFFFF",
    brand: "#0F8A5F",
    markSrc: "/icons/mintro.svg",
    gradient: ["#22A877", "#6ECBA6", "#D2EFE3"],
    tint: { light: "#63C4A1", dark: "#0B5C41" },
    kicker: "Role — contract",
    title: "Mintro",
    role: "Contract backend + AI engineer",
    period: "2026",
    body: [
      "A financial dashboard for contractors and small businesses — categorising transactions and turning them into a profitability picture rather than a pile of receipts.",
      "I was the contract backend and AI engineer: the integration surface with QuickBooks and Plaid, and the categorisation that has to be right often enough to be trusted with someone's books. Supabase edge functions and migrations underneath, so that logic sits next to the data.",
      "Contract engagement — not my product.",

    ],
    stack: ["Supabase", "Deno", "Postgres", "Plaid", "QuickBooks"],
    media: [{ kind: "site", device: "laptop", href: "https://mintro-pi.vercel.app", label: "the dashboard" }],
    links: [{ label: "mintro-pi.vercel.app", href: "https://mintro-pi.vercel.app" }],
  },
  {
    id: "syncline",
    kind: "project",
    label: "MESH",
    mark: "MS",
    dock: false,
    tile: "#6741C9",
    brand: "#6741C9",
    gradient: ["#8560E0", "#B49BEE", "#E4DBFA"],
    tint: { light: "#9C7FE6", dark: "#452A8C" },
    kicker: "Infrastructure",
    title: "MESH",
    role: "Architecture + engineering",
    period: "2026",
    body: [
      "Multi-platform Event Stream Hub: real-time message ingestion that connects several communication platforms into one processing pipeline.",
      "FastAPI with workers behind it — the kind of system where the hard part is ordering and back-pressure, not the endpoints.",
    ],
    stack: ["FastAPI", "Python", "Workers"],
    media: [
      {
        kind: "arch",
        label: "ingest, normalise, fan out",
        tiers: [
          { label: "sources", nodes: ["Telegram", "WhatsApp", "Discord", "Slack"] },
          { label: "ingest", nodes: ["FastAPI webhooks", "signature verify"] },
          { label: "process", nodes: ["queue", "workers", "dedupe"] },
          { label: "sinks", nodes: ["Postgres", "analytics", "subscribers"] },
        ],
      },
    ],
  },
  {
    id: "honeybyte",
    kind: "project",
    label: "Honeybyte",
    mark: "HB",
    dock: false,
    tile: "#C99A16",
    brand: "#C99A16",
    appIcon: "/icons/honeybyte.png",
    gradient: ["#E0B637", "#EFD284", "#FAF0D2"],
    tint: { light: "#E5C05C", dark: "#8A6A0F" },
    kicker: "Role — senior engineer",
    title: "Honeybyte",
    role: "Senior Engineer (backend)",
    period: "current",
    outcomes: [
      { value: "Senior", label: "backend engineer" },
      { value: "Not mine", label: "someone else's product" },
    ],
    body: [
      "Honeybyte teaches digital safety habits to kids, teens and adults through bite-size lessons, games and real-world simulations, guided by a companion character called Hexa. Duolingo, but for not getting got online.",
      "I'm the senior backend engineer on it — the Django services behind the lessons, accounts and progress, rather than the product itself. This one isn't mine; I work on it.",
    ],
    stack: ["Django", "Python", "Postgres"],
    media: [{ kind: "site", device: "phone", href: "https://www.honeybyteapp.com", label: "the app" }],
    links: [{ label: "honeybyteapp.com", href: "https://www.honeybyteapp.com" }],
  },
  {
    id: "pulse",
    kind: "project",
    label: "Pulse",
    mark: "PL",
    dock: false,
    tile: "#C2265B",
    brand: "#C2265B",
    gradient: ["#DB4B7C", "#EC90AE", "#FBDCE6"],
    tint: { light: "#E0799C", dark: "#8A1740" },
    kicker: "Product",
    title: "Pulse",
    role: "Design + engineering",
    period: "2026",
    body: [
      "PLACEHOLDER: no README in the repo, so I have written nothing rather than invent it. Tell me what Pulse is and I'll write this to match the others.",
    ],
    stack: [],
  },

  {
    id: "beanstudio",
    kind: "project",
    label: "Bean Studio",
    mark: "BN",
    dock: false,
    tile: "#E8B84B",
    brand: "#E8B84B",
    appIcon: "/icons/beanstudio.svg",
    gradient: ["#F0C95F", "#F5DC9A", "#FBF1D8"],
    tint: { light: "#EFCE72", dark: "#8A6A1E" },
    kicker: "Role — bot + backend",
    title: "Bean Studio",
    role: "Bot and backend engineer",
    period: "TBC",
    outcomes: [
      { value: "Bots", label: "backend + automation" },
      { value: "Mint", label: "drop tooling" },
    ],
    body: [
      "Bot and backend engineering — the services behind the product rather than the surface, and the automation that had to keep working while a drop was live.",
      "That included mint bots: tooling that watches for a drop, manages wallets and nonces, prices gas against the current block and submits in time to actually land an allocation. Minting is a latency problem wearing a web3 costume — most of the engineering is queueing, retries and not getting rate-limited.",
      "PLACEHOLDER: I've written this from what you told me — bot and backend engineer, mint bots. I don't have dates, a link, or which parts were yours, so check the wording before this goes anywhere near a recruiter.",
    ],
    stack: ["Node.js", "Web3", "Queues", "Backend"],
    media: [{ kind: "site", device: "laptop", href: "https://beanstudio.xyz", label: "the studio site" }],
    links: [{ label: "beanstudio.xyz", href: "https://beanstudio.xyz" }],
  },

  {
    id: "shipper",
    kind: "project",
    label: "Shipper.now",
    mark: "SH",
    dock: false,
    tile: "#111827",
    brand: "#6366F1",
    appIcon: "/icons/shipper.png",
    gradient: ["#4F46E5", "#8B87F0", "#DAD8FA"],
    tint: { light: "#8B87F0", dark: "#312B8A" },
    kicker: "Role — contract",
    title: "Shipper.now",
    role: "Full-stack backend contractor",
    period: "a few months",
    outcomes: [
      { value: "Contract", label: "full-stack backend" },
      { value: "AI", label: "build apps by messaging" },
    ],
    body: [
      "Shipper.now builds complete apps from a messaging interface — you describe what you want and it ships it.",
      "I contracted on the backend for a few months. Contract engagement, not my product.",
      "PLACEHOLDER: dates and which parts were yours — tell me and I'll tighten this.",
    ],
    stack: ["Node.js", "Backend", "AI"],
    media: [{ kind: "site", device: "laptop", href: "https://shipper.now", label: "the product" }],
    links: [{ label: "shipper.now", href: "https://shipper.now" }],
  },

  {
    id: "tiximo",
    kind: "project",
    label: "Tiximo",
    mark: "TX",
    dock: false,
    tile: "#7C3AED",
    brand: "#7C3AED",
    gradient: ["#9457F5", "#BE9BF9", "#E7DCFD"],
    tint: { light: "#A97BF7", dark: "#4C1D95" },
    kicker: "Product",
    title: "Tiximo",
    role: "Design + engineering",
    period: "2026",
    outcomes: [
      { value: "3 platforms", label: "telegram, whatsapp, discord" },
      { value: "Nigeria+", label: "events near you" },
    ],
    body: [
      "Event discovery that lives where people already talk. Tiximo is a bot across Telegram, WhatsApp and Discord that finds concerts, parties and events near you — Nigeria first, and beyond.",
      "Platform adapters normalise three very different messaging APIs into one engine, so a flow is written once and rendered per platform. Neon and Drizzle for the data, ClickHouse for analytics, Redis for cache, and cheap models routed through OpenRouter for intent parsing and event summaries — the AI is a component, not the pitch.",
    ],
    stack: ["TypeScript", "grammy", "Hono", "Neon", "ClickHouse", "Redis"],
    media: [
      {
        kind: "chat",
        label: "the same flow renders on Telegram, WhatsApp and Discord",
        messages: [
          { from: "user", text: "any afrobeats shows in Lagos this weekend?" },
          { from: "tool", text: "intent: find_events · city=Lagos · genre=afrobeats · window=weekend", meta: "parsed" },
          { from: "bot", text: "Three near you this weekend — Sat: Alté Cruise, Victoria Island. Sun: Palmwine Sessions, Lekki. Sun: Detty Rave warm-up, Ikeja." },
          { from: "user", text: "remind me about the first one" },
          { from: "bot", text: "Done — I'll ping you Saturday at 4pm, two hours before doors." },
        ],
      },
    ],
  },

  // ── header only ────────────────────────────────────────────────── about
  {
    id: "about",
    kind: "about",
    label: "About",
    mark: "W",
    dock: false,
    gradient: ["#8A8A8A", "#B5B5B5", "#E4E4E4"],
    tile: "#5F5D5A",
    brand: "#5F5D5A",
    tint: { light: "#BDBAB4", dark: "#5F5D5A" },
    kicker: "About",
    title: "Wave",
    role: "Developer / designer / everything else",
    period: "Available now",
    outcomes: [
      { value: "Full-stack", label: "product engineering" },
      { value: "Automation", label: "n8n, agents, pipelines" },
      { value: "Design", label: "systems + motion" },
    ],
    body: [
      "I'm a product engineer who doesn't hand off. I do the research, the design system, the schema, the frontend, the automation and the deploy — then I stream the whole thing so people can see how it was actually made.",
      "Most of what's here is solo work taken from a blank repo to something running in production with real users. I like problems where the interesting part is the plumbing nobody sees.",
      "Open to full-time roles, contract work and collaborations.",
    ],
    stack: ["TypeScript", "Next.js", "Supabase", "Postgres", "n8n", "Docker", "GSAP"],
    links: [
      { label: "email", href: "mailto:wavedidwhat@gmail.com" },
      { label: "youtube", href: "https://youtube.com/@wavedidwhat" },
    ],
  },
];

export const dockViews = views.filter((v) => v.dock);
export const getView = (id: string) => views.find((v) => v.id === id);

/** pills that burst out of the hero mark when you poke it */
export const skills = [
  "TypeScript",
  "Next.js",
  "React",
  "Supabase",
  "Postgres",
  "n8n",
  "Docker",
  "GSAP",
  "Playwright",
  "MCP",
  "Tailwind",
  "Python",
];

/** dock tail — external links, after the divider */
export const socials = [
  { id: "github", label: "GitHub", mark: "GH", href: "https://github.com/Enochthedev", tile: "#181717", gradient: ["#2b2b2b", "#5c5c5c", "#c8c8c8"] },
  { id: "youtube", label: "YouTube", mark: "YT", href: "https://youtube.com/@wavedidwhat", tile: "#FF0000", gradient: ["#c9524a", "#e07a70", "#f3bdb6"] },
  { id: "email", label: "Email", mark: "@", href: "mailto:wavedidwhat@gmail.com", tile: "#2B7FFF", gradient: ["#5c5a54", "#8c887f", "#cec9bd"] },
] as const;
