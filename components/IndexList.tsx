"use client";

import { useMemo, useState } from "react";
import type { Entry, View } from "@/data/site";
import { useContent } from "@/lib/content-context";
import { dockIcons } from "./icons";
import { haptic, playTone } from "@/lib/feedback";

/**
 * The library list on an index page.
 *
 * Built to grow: these pages are meant to hold a lot of projects eventually, so
 * there's a filter row across the top rather than one flat scroll. Filters only
 * appear once there is more than one group and enough rows to be worth it —
 * chips over a four-item list are just noise.
 *
 * Each row wears the target project's own dock face, so the library and the
 * dock read as the same set of things.
 */
/** does this project have a mark of its own? */
const hasIcon = (v: View | undefined) =>
  Boolean(v && (v.appIcon || v.markSrc || dockIcons[v.id]));

export function IndexList({
  entries,
  onOpen,
}: {
  entries: Entry[];
  onOpen: (id: string) => void;
}) {
  const { getView } = useContent();

  const groups = useMemo(() => {
    const seen: string[] = [];
    for (const e of entries) if (e.group && !seen.includes(e.group)) seen.push(e.group);
    return seen;
  }, [entries]);

  const [filter, setFilter] = useState<string | null>(null);
  const worthFiltering = groups.length > 1 && entries.length > 4;

  /**
   * Projects with a real mark sort above those without.
   *
   * The alternative — generating an abstract glyph for anything missing one —
   * fills the gap with invented identity, which is worse than an honest blank.
   * These simply sit lower and render without a mark, in a fixed-width slot so
   * every title still lines up. Filtering still surfaces them the moment
   * they're relevant; they just don't compete for the top of the list.
   */
  const ordered = useMemo(() => {
    const hasMark = (e: Entry) => {
      const v = e.view ? getView(e.view) : undefined;
      return Boolean(v && (v.appIcon || v.markSrc || dockIcons[v.id]));
    };
    return [...entries].sort((a, b) => Number(hasMark(b)) - Number(hasMark(a)));
  }, [entries, getView]);

  const shown = filter ? ordered.filter((e) => e.group === filter) : ordered;

  return (
    <>
      {worthFiltering && (
        <div className="index-filters" role="group" aria-label="Filter projects">
          <button
            type="button"
            className="index-filter"
            data-on={filter === null}
            onClick={() => setFilter(null)}
          >
            All <span className="index-filter__n">{entries.length}</span>
          </button>
          {groups.map((g) => {
            const n = entries.filter((e) => e.group === g).length;
            return (
              <button
                key={g}
                type="button"
                className="index-filter"
                data-on={filter === g}
                onClick={() => {
                  setFilter(g);
                  playTone("chip");
                }}
              >
                {g} <span className="index-filter__n">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      <ul className="index-list">
        {shown.map((e, i) => {
          const target = e.view ? getView(e.view) : undefined;
          const RowIcon = e.view ? dockIcons[e.view] : undefined;

          const inner = (
            <>
              {target && hasIcon(target) ? (
                <span
                  className="index-mark"
                  data-icon={target.id}
                  style={
                    {
                      backgroundColor: target.appIcon ? undefined : target.tile,
                      "--tile-bg": target.tile,
                    } as React.CSSProperties
                  }
                >
                  {target.appIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={target.appIcon} alt="" />
                  ) : target.markSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="index-glyph" src={target.markSrc} alt="" />
                  ) : (
                    RowIcon && <RowIcon />
                  )}
                </span>
              ) : (
                // uniform empty slot: no invented mark, but the titles still align
                <span className="index-mark index-mark--none" aria-hidden="true" />
              )}
              <span className="index-text">
                <span className="index-title">{e.title}</span>
                <span className="index-blurb">{e.blurb}</span>
              </span>
              <span className="index-meta">{e.meta}</span>
            </>
          );

          return (
            <li key={`${e.title}-${i}`}>
              {e.view ? (
                <a
                  className="index-link"
                  href={`#${e.view}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    haptic();
                    onOpen(e.view!);
                  }}
                >
                  {inner}
                </a>
              ) : e.href ? (
                <a
                  className="index-link"
                  href={e.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {inner}
                </a>
              ) : (
                <span className="index-link">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
