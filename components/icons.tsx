import { Handshake } from "lucide-react";
import type { ComponentType } from "react";

/**
 * Dock marks.
 *
 * Rebuilt after measuring the reference's own icon PNGs, which sit somewhere
 * very different from where we started:
 *
 *   · Tiles are FLAT and heavily saturated — 78–100% HSV saturation on seven of
 *     ten, with two deliberate near-black neutrals for contrast. Ours were pale
 *     20–35% gradients, which is why they read as chips rather than app icons.
 *   · Marks are SOLID FILLS, not outlines. Lucide's 2px stroke on a 24 grid
 *     disappears at 54px, and a hairline mark on a pastel tile has almost no
 *     presence.
 *   · Marks occupy roughly 10–30% of the tile — a confident shape with real
 *     breathing room around it.
 *   · Every tile carries a mark. Mixing pictograms with "IȘ"/"RH"/"RDK"
 *     monograms read as placeholder, because half of them were.
 *
 * So: every glyph below is drawn as filled geometry on a 24 grid, knocked out
 * of a saturated tile. currentColor is set by the tile.
 */

type Glyph = ComponentType;

const box = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: "false",
} as const;

/** product engineering — assembled blocks */
const Product: Glyph = () => (
  <svg {...box}>
    <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2.2" />
    <rect x="13" y="2.5" width="8.5" height="8.5" rx="4.25" />
    <rect x="2.5" y="13" width="8.5" height="8.5" rx="4.25" />
    <rect x="13" y="13" width="8.5" height="8.5" rx="2.2" />
  </svg>
);

/** freelance — a briefcase: engagements taken on for other teams */
const Freelance: Glyph = () => (
  <svg {...box}>
    <path d="M9.1 2.6h5.8a2.7 2.7 0 0 1 2.7 2.7v1.2h-2.4V5.5a.6.6 0 0 0-.6-.6H9.4a.6.6 0 0 0-.6.6v1H6.4V5.3A2.7 2.7 0 0 1 9.1 2.6Z" />
    <path d="M2 9.1c0-1.5 1.2-2.7 2.7-2.7h14.6c1.5 0 2.7 1.2 2.7 2.7v2.2c0 .5-.3.9-.7 1.1l-6.5 2.4v-1a1 1 0 0 0-1-1h-3.6a1 1 0 0 0-1 1v1L2.7 12.4a1.2 1.2 0 0 1-.7-1.1Z" />
    <path d="M2 14.6l7.2 2.7v.4a1 1 0 0 0 1 1h3.6a1 1 0 0 0 1-1v-.4L22 14.6v4.1a2.7 2.7 0 0 1-2.7 2.7H4.7A2.7 2.7 0 0 1 2 18.7Z" />
  </svg>
);

/** open source — contributions to other people's projects.
 *  This is Lucide's Handshake, not a hand-drawn path: it's a properly
 *  constructed, community-reviewed icon, and my own attempt at the same shape
 *  was unreadable at 54px. Feather (Lucide's parent) still has only an open
 *  request for a handshake, so Lucide is the good free source for it.
 *  Stroke is thickened well past the 2px default — at 25px rendered, the
 *  default hairline vanishes against a saturated tile. */
const OpenSource: Glyph = () => <Handshake strokeWidth={2.4} absoluteStrokeWidth />;

/** RelayHelp's own mark, from the product's marketing site.
 *  The rounded-square frame IS part of the icon — an earlier pass stripped it
 *  as redundant with the tile, which was wrong. Full mark, cropped to its own
 *  bounds so it fills the tile, and presented the way the brand presents it:
 *  brand red on white in light, and its official cream counterpart (#ecd6ae)
 *  on near-black in dark. Both source files share identical geometry, so the
 *  pair is a colour token rather than a second asset. */
const RelayHelp: Glyph = () => (
  <svg
    viewBox="295 265 551 550"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m570.49,808.91h-.09c-107.9,0-181.77-3.15-223.72-45.1-41.96-41.96-45.1-115.86-45.1-223.81s3.14-181.85,45.1-223.81c41.95-41.95,115.82-45.1,223.72-45.1h.09c107.9,0,181.77,3.15,223.72,45.1,41.96,41.96,45.1,115.86,45.1,223.81s-3.14,181.85-45.1,223.81c-41.95,41.95-115.82,45.1-223.72,45.1h0Zm-.05-488.93c-107.34,0-163.02,4.61-189.19,30.78-26.17,26.17-30.78,81.88-30.78,189.24s4.61,163.07,30.78,189.24c26.17,26.17,81.85,30.78,189.19,30.78s163.02-4.61,189.19-30.78c26.17-26.17,30.78-81.88,30.78-189.24s-4.61-163.07-30.78-189.24c-26.17-26.17-81.85-30.78-189.19-30.78Z" />
    <g>
      <rect x="410.85" y="492.28" width="198.82" height="71.72" rx="26.19" ry="26.19" transform="translate(-210.83 389.08) rotate(-35.07)" />
      <rect x="592.98" y="407.91" width="74.92" height="71.72" rx="26.19" ry="26.19" transform="translate(-140.52 442.82) rotate(-35.07)" />
      <rect x="531.22" y="516" width="198.82" height="71.72" rx="26.19" ry="26.19" transform="translate(-202.59 462.55) rotate(-35.07)" />
      <rect x="472.99" y="600.37" width="74.92" height="71.72" rx="26.19" ry="26.19" transform="translate(-272.9 408.82) rotate(-35.07)" />
    </g>
  </svg>
);

/** nullApt. Its own logo is a 192×56 wordmark — unusable in a square tile — so
 *  this is the same shell-prompt motif redrawn on a square grid, keeping the
 *  brand's dim slash and green. */
const NullApt: Glyph = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M4.5 7.5 8.7 12l-4.2 4.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="11.6" y="15" width="8" height="2.4" rx="1.2" fill="currentColor" opacity="0.55" />
  </svg>
);

/** GitHub's mark — Lucide dropped brand icons, so this is the official path. */
const GitHub: Glyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.24-.02-2.25-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
  </svg>
);

/** the undecided fourth slot */
const Next: Glyph = () => (
  <svg {...box}>
    <rect x="10.4" y="3" width="3.2" height="18" rx="1.6" />
    <rect x="3" y="10.4" width="18" height="3.2" rx="1.6" />
  </svg>
);

/** email — solid envelope */
const Email: Glyph = () => (
  <svg {...box}>
    <path d="M2 7.4c0-1.6 1.3-2.9 2.9-2.9h14.2c1.6 0 2.9 1.3 2.9 2.9v9.2c0 1.6-1.3 2.9-2.9 2.9H4.9A2.9 2.9 0 0 1 2 16.6Z" />
    <path
      d="m3.8 7.9 7.35 5.05a1.5 1.5 0 0 0 1.7 0L20.2 7.9"
      fill="none"
      stroke="var(--tile-bg, #fff)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/** YouTube's real mark. Lucide dropped its brand icons, and an approximated
 *  logo is worse than none — this is the official geometry from svgl.app. */
const YouTube: Glyph = () => (
  <svg viewBox="0 0 256 180" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z" />
    <path fill="var(--tile-bg, #fff)" d="m102.421 128.06 66.328-38.418-66.328-38.418z" />
  </svg>
);

export const dockIcons: Record<string, Glyph> = {
  product: Product,
  freelance: Freelance,
  opensource: OpenSource,
  relayhelp: RelayHelp,
  nullapt: NullApt,
  github: GitHub,
  next: Next,
  youtube: YouTube,
  email: Email,
};
