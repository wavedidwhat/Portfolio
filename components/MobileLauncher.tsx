"use client";

import { dockViews, socials } from "@/data/site";
import { dockIcons } from "./icons";
import { haptic } from "@/lib/feedback";

/**
 * The dock, re-thought for a phone.
 *
 * Ten 44px tiles plus gaps need ~530px — a horizontal scroller on a 390px
 * screen hides most of the site behind a swipe people won't discover. So on
 * mobile the dock is replaced by a grid laid into the home screen, which is
 * also what the reference does. Every destination is visible at once, tiles are
 * comfortably past the 44px touch minimum, and labels are readable instead of
 * living in hover tooltips that touch can never trigger.
 */
export function MobileLauncher({ onSelect }: { onSelect: (id: string) => void }) {
  const items = [
    ...dockViews.map((v) => ({ ...v, itemKind: "view" as const })),
    ...socials.map((s) => ({ ...s, itemKind: "link" as const })),
  ];

  return (
    <>
      {/* a labelled, ruled section — the grid stops floating in dead space */}
      <div className="m-sect" aria-hidden="true">
        <span className="mono">Everything</span>
        <span className="m-sect__n">{String(items.length).padStart(2, "0")}</span>
      </div>

      <nav className="launcher" aria-label="Sections">
      {items.map((item) => {
        const art = "appIcon" in item ? item.appIcon : undefined;
        const glyphSrc = "markSrc" in item ? item.markSrc : undefined;
        const Icon = dockIcons[item.id];

        const face = art ? (
          <span className="launcher__tile launcher__tile--art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={art} alt="" />
          </span>
        ) : (
          <span
            className="launcher__tile"
            data-icon={item.id}
            style={
              { backgroundColor: item.tile, "--tile-bg": item.tile } as React.CSSProperties
            }
          >
            {glyphSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="launcher__glyph" src={glyphSrc} alt="" />
            ) : (
              Icon && <Icon />
            )}
          </span>
        );

        const label = <span className="launcher__label">{item.label}</span>;

        return item.itemKind === "view" ? (
          <button
            key={item.id}
            type="button"
            className="launcher__item"
            onClick={() => {
              haptic();
              onSelect(item.id);
            }}
          >
            {face}
            {label}
          </button>
        ) : (
          <a
            key={item.id}
            className="launcher__item"
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => haptic()}
          >
            {face}
            {label}
          </a>
        );
      })}
      </nav>
    </>
  );
}
