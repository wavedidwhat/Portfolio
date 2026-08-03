"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useContent } from "@/lib/content-context";
import { Curtain, type CurtainHandle } from "./Curtain";
import { CursorDot } from "./CursorDot";
import { Dock } from "./Dock";
import { Header } from "./Header";
import { Home } from "./Home";
import { LavaLamp } from "./LavaLamp";
import { About } from "./About";
import { Panel } from "./Panel";

const HOME = "home";

const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

/**
 * The curtain wears the project's own brand colour — click Ișę and the sweep is
 * Ișę red. Raw brand colours are too loud full-screen, so each is pulled toward
 * the page: toward white in light, toward black in dark. Alpha stays under 1 so
 * the backdrop blur still reads through it.
 */
function curtainFill(brand: string, dark: boolean) {
  const [r, g, b] = rgb(brand);
  const [tr, tg, tb] = dark ? [10, 9, 8] : [252, 251, 248];
  // Only a nudge. Pulling 30/42% toward the page turned Ișę's #EE1E25 into a
  // washed pink — the point is that the sweep is recognisably the brand colour.
  const k = dark ? 0.16 : 0.08;
  const mix = (c: number, t: number) => Math.round(c + (t - c) * k);
  return `rgba(${mix(r, tr)}, ${mix(g, tg)}, ${mix(b, tb)}, 0.94)`;
}

/**
 * The view machine. Like the reference, there is no scrolling between
 * sections — `data-view` on <body> decides which screen is mounted, and the
 * curtain covers the swap. The hash keeps deep links and the back button
 * working, which the reference doesn't bother with.
 */
export function Shell() {
  const { views, getView } = useContent();
  const [view, setView] = useState(HOME);
  const curtain = useRef<CurtainHandle>(null);
  /**
   * How many views we've pushed onto history ourselves. Back walks that trail —
   * home → Product engineering → Ișę → Back lands on Product engineering, not
   * home. Without the counter, someone arriving on a deep link would be thrown
   * off the site entirely by their first Back press.
   */
  const depth = useRef(0);
  /** mirrors `view` so listeners can read it without re-subscribing */
  const viewRef = useRef(HOME);
  /** which way the next transition travels — set before history moves us */
  const dir = useRef<"up" | "down">("up");

  const fillFor = useCallback((id: string) => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const v = getView(id);
    if (!v) return dark ? "rgba(18,17,16,0.88)" : "rgba(252,251,248,0.88)";
    return curtainFill(v.brand ?? v.tile, dark);
  }, []);

  const go = useCallback(
    (next: string) => {
      if (next === view) return;
      // Don't swallow the click mid-sweep — the dock is hidden on panels, so a
      // dropped Back leaves the user stranded with no navigation at all.
      // Reference does the same: kill the in-flight tween and take the new view.
      if (curtain.current?.isBusy()) curtain.current.interrupt();

      if (next === HOME) {
        // home applies immediately, then the curtain retreats off it
        setView(HOME);
        if (window.location.hash) {
          window.history.pushState(null, "", " ");
          depth.current += 1;
        }
        curtain.current?.close(fillFor(view), dir.current);
        dir.current = "up";
        return;
      }

      curtain.current?.open(fillFor(next), () => {
        setView(next);
        // pushState, not replaceState: the browser's own Back button should walk
        // back through views instead of leaving the site entirely.
        window.history.pushState(null, "", `#${next}`);
        depth.current += 1;
        window.scrollTo(0, 0);
      }, true, dir.current);
      dir.current = "up";
    },
    [view, fillFor],
  );

  /**
   * Theme flips ride the same curtain as navigation, so the site has one
   * transition language. The swap happens under full cover, which also hides
   * the repaint of the lava canvas and every token-driven colour at once.
   */
  const flipTheme = useCallback(() => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("wave-theme", next);
      } catch {
        /* private mode */
      }
    };

    if (curtain.current?.isBusy()) {
      apply();
      return;
    }
    // neutral fill, tinted toward the theme we're arriving at
    curtain.current?.open(
      next === "dark" ? "rgba(16,15,13,0.82)" : "rgba(244,242,238,0.86)",
      apply,
      false, // no frost: it's a colour change, not a page change
    );
  }, []);

  /**
   * The Back chip retraces your steps rather than jumping to home. Delegating
   * to history.back() means the in-page control and the browser button agree,
   * instead of being two different notions of "back".
   */
  const goBack = useCallback(() => {
    if (depth.current > 0) {
      depth.current -= 1;
      dir.current = "down"; // retreating: the wave falls from the top
      window.history.back();
      return;
    }
    dir.current = "down";
    // arrived here directly — there is no trail to walk, so home it is
    go(HOME);
  }, [go]);

  // deep link on first paint, without a transition
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (id && getView(id)) setView(id);
  }, []);

  /**
   * Keep the view in step with the URL. Covers browser back/forward and someone
   * editing the hash by hand — without this the hash is only ever read once, at
   * mount, and both silently do nothing.
   */
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace("#", "");
      const next = id && getView(id) ? id : HOME;
      const cur = viewRef.current;
      if (cur === next) return;

      /*
       * These side effects must NOT live inside a setView updater. React calls
       * updaters twice in StrictMode, so the first pass consumed dir.current and
       * reset it, and the second pass read the reset value and painted the
       * forward sweep — the reverse never showed. Read the ref once, out here.
       */
      const travel = dir.current;
      dir.current = "up";
      document.body.dataset.dir = travel === "down" ? "back" : "fwd";
      if (next === HOME) curtain.current?.close(fillFor(cur), travel);
      else curtain.current?.open(fillFor(next), () => {}, true, travel);
      setView(next);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  useEffect(() => {
    viewRef.current = view;
    document.body.dataset.view = view;
    document.body.dataset.dir ??= "fwd";
  }, [view]);

  // escape closes an open project, same as the back chip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view !== HOME) goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, goBack]);

  const active = view === HOME ? null : getView(view);

  return (
    <>
      <LavaLamp active={view === HOME} />
      <CursorDot />
      <Header view={view} onAbout={() => go("about")} onFlipTheme={flipTheme} />

      <main className="stage">
        <div className="screen" data-active={view === HOME}>
          <Home onSelect={go} />
        </div>

        {views.map((v) => (
          <div className="screen" data-active={view === v.id} key={v.id}>
            {active?.id === v.id &&
              (v.kind === "about" ? (
                <About view={v} onBack={goBack} onOpen={go} />
              ) : (
                <Panel view={v} onBack={goBack} onOpen={go} />
              ))}
          </div>
        ))}
      </main>

      <Dock current={view} onSelect={(id) => go(id === view ? HOME : id)} />
      <Curtain ref={curtain} />

      {/* liquid-glass displacement used by the dock's backdrop-filter */}
      <svg className="glass-defs" aria-hidden="true">
        <filter id="dock-glass" primitiveUnits="objectBoundingBox">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.015" result="blur" />
          <feDisplacementMap in="blur" in2="blur" scale="0" />
        </filter>
      </svg>
    </>
  );
}
