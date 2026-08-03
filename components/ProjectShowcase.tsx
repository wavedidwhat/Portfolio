"use client";

import { useState } from "react";
import { useContent } from "@/lib/content-context";
import { haptic, playTone } from "@/lib/feedback";
import { ProjectMark } from "./ProjectMark";

/**
 * Expand-on-hover strip, adapted from the 21st.dev "Expand On Hover Cards"
 * component. Four deliberate departures from the original:
 *
 *  · No <img>. The original hotlinks nine twimg URLs; we have no project
 *    photography, and pointing at someone else's CDN for decoration is fragile.
 *    Cards are gradient panels carrying the project's own tile colours, so the
 *    strip stays consistent with the dock.
 *  · Semantic classes, not Tailwind utilities. Every other component here styles
 *    from globals.css; utility soup in one file would read as foreign.
 *  · Keyboard reachable. The original expands on mouseenter only, which makes
 *    the content unreachable without a pointer. Focus expands too, and each card
 *    opens its project.
 *  · The original's `idx + 1` indexing left card 0 unable to be the initial
 *    expansion; indices are plain here.
 */

const FEATURED = ["relayhelp", "ise", "collabo", "hq", "rdk"];

/** the card the strip rests on when nobody is pointing at it */
const RESTING = 0;

export function ProjectShowcase({ onOpen }: { onOpen: (id: string) => void }) {
  const { views } = useContent();
  const cards = FEATURED.map((id) => views.find((v) => v.id === id)).filter(
    (v): v is NonNullable<typeof v> => Boolean(v),
  );
  const [expanded, setExpanded] = useState(RESTING);

  return (
    <div
      className="showcase"
      role="list"
      /* Leaving the strip settles it back to its resting card instead of
         stranding whichever one the cursor happened to exit over — the section
         has one composed state it always returns to. Focus is excluded: tabbing
         out shouldn't yank the card someone just navigated to. */
      onMouseLeave={() => setExpanded(RESTING)}
    >
      {cards.map((v, i) => (
        <button
          key={v.id}
          type="button"
          role="listitem"
          className="showcase__card"
          data-expanded={i === expanded}
          style={
            {
              // brand colour, not the washed pastel gradient — these should read
              // as the same projects the dock shows
              "--brand": v.brand ?? v.tile,
            } as React.CSSProperties
          }
          onMouseEnter={() => {
            setExpanded(i);
            playTone("dock");
          }}
          onFocus={() => setExpanded(i)}
          onClick={() => {
            haptic();
            onOpen(v.id);
          }}
          aria-label={`${v.title} — ${v.kicker}`}
        >
          {/* the mark shows in both states, so a collapsed card is still
              identifiable rather than a coloured sliver with sideways text */}
          <ProjectMark view={v} className="pmark--card" />
          <span className="showcase__spine">{v.title}</span>
          <span className="showcase__body">
            <span className="mono showcase__kicker">{v.kicker}</span>
            <span className="showcase__title">{v.title}</span>
            <span className="showcase__blurb">{v.body[0]}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
