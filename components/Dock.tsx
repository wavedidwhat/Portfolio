"use client";

import { Fragment, useState } from "react";
import { dockViews, socials } from "@/data/site";
import { playTone, haptic } from "@/lib/feedback";
import { dockIcons } from "./icons";

/**
 * macOS-style dock. The reference does the magnification with classes rather
 * than pointer maths — the hovered item goes to 1.24×, its immediate
 * neighbours to 1.12×, the next pair to 1.04× — so width transitions can do
 * all the easing. Touch devices skip it entirely.
 */
function magnitude(index: number, active: number | null) {
  if (active === null) return undefined;
  const distance = Math.abs(index - active);
  if (distance === 0) return "hover";
  if (distance === 1) return "close";
  if (distance === 2) return "far";
  return undefined;
}

/* Flat saturated face with a white mark, as the reference does it. --tile-bg is
   read by the glyphs that knock shapes out of themselves (envelope flap, the
   YouTube play triangle, terminal chevron). */
function tileStyle(tile: string) {
  // NB: no `color` here. An inline colour would beat the stylesheet, and the
  // per-brand dark-mode overrides in globals.css need to win.
  return {
    backgroundColor: tile,
    "--tile-bg": tile,
  } as React.CSSProperties;
}

export function Dock({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (id: string) => void;
}) {
  const [active, setActive] = useState<number | null>(null);

  const items = [
    ...dockViews.map((v) => ({ ...v, itemKind: "view" as const })),
    ...socials.map((s) => ({ ...s, itemKind: "link" as const })),
  ];

  return (
    <nav className="dock" aria-label="Primary">
      <div className="dock__glass">
        <ul className="dock__track">
          {items.map((item, index) => {
            const isDividerBefore = index === dockViews.length;
            const mag = magnitude(index, active);

            const hover = () => {
              setActive(index);
              playTone("dock");
            };

            // three kinds of face, in order of preference:
            //  1. the project's own app icon, drawn full-bleed
            //  2. a designed mark knocked out of a flat saturated tile
            //  3. the monogram, for anything still lacking both
            const art = "appIcon" in item ? item.appIcon : undefined;
            const glyphSrc = "markSrc" in item ? item.markSrc : undefined;
            const Icon = dockIcons[item.id];
            const tile = (
              <>
                {art ? (
                  <span className="dock__tile dock__tile--art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={art} alt="" />
                  </span>
                ) : (
                  <span
                    className="dock__tile"
                    data-icon={item.id}
                    style={tileStyle(item.tile)}
                  >
                    {glyphSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="dock__glyph" src={glyphSrc} alt="" />
                    ) : (
                      // every dock item has a real mark; nothing is invented here
                      Icon && <Icon />
                    )}
                  </span>
                )}
                <span className="dock__label">{item.label}</span>
              </>
            );

            return (
              <Fragment key={item.id}>
                {isDividerBefore && (
                  <li className="dock__divider" aria-hidden="true">
                    <span />
                  </li>
                )}
                <li
                  className="dock__item"
                  data-mag={mag}
                  onMouseEnter={hover}
                  onMouseLeave={() => setActive(null)}
                  onFocus={hover}
                  onBlur={() => setActive(null)}
                >
                  {item.itemKind === "view" ? (
                    <button
                      type="button"
                      className="dock__link"
                      aria-label={item.label}
                      aria-current={current === item.id}
                      onClick={() => {
                        haptic();
                        onSelect(item.id);
                      }}
                    >
                      {tile}
                    </button>
                  ) : (
                    <a
                      className="dock__link"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={item.label}
                      onClick={() => haptic()}
                    >
                      {tile}
                    </a>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
