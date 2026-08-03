"use client";

import { useEffect, useRef, useState } from "react";
import { haptic, playTone } from "@/lib/feedback";

/**
 * Proximity Back button.
 *
 * Once a panel is open the dock is hidden, so this is the only way out — but a
 * permanently pinned pill is dead weight while you're reading. Instead it hides
 * until the pointer approaches an edge, then rubber-bands in:
 *
 *   · pointer near the top of the viewport  → it DROPS from above
 *   · pointer near the bottom, or you've scrolled to the end → it FLOATS up
 *
 * The overshoot is a spring, not a fade, so it reads as a physical object
 * arriving rather than a tooltip appearing. Touch devices have no hover, so
 * there it's simply always visible at the bottom.
 */

const EDGE = 190; // px from an edge that counts as "approaching"
const LINGER = 1400; // how long it stays after a scroll with no pointer move

export function BackButton({ onBack }: { onBack: () => void }) {
  const [dock, setDock] = useState<"top" | "bottom">("top");
  const [shown, setShown] = useState(true);
  /** keyboard focus pins it visible regardless of pointer position */
  const [focused, setFocused] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);
  const lingerTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) {
      setDock("bottom");
      setShown(true);
      return;
    }

    // start hidden on a fine pointer; the first approach brings it in
    setShown(false);

    const atEnd = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;

    /** a panel shorter than the viewport has no "approach from below" — the
     *  button would otherwise be unreachable without scrolling that can't happen */
    const fitsViewport = () =>
      document.documentElement.scrollHeight <= window.innerHeight + 8;

    const evaluate = (clientY: number | null) => {
      // nothing to scroll, or already at the end: park it and leave it
      if (fitsViewport()) {
        setDock("top");
        setShown(true);
        return;
      }
      if (atEnd()) {
        setDock("bottom");
        setShown(true);
        return;
      }
      if (clientY === null) return;

      const nearTop = clientY < EDGE;
      const nearBottom = clientY > window.innerHeight - EDGE;

      if (nearTop) {
        setDock("top");
        setShown(true);
      } else if (nearBottom) {
        setDock("bottom");
        setShown(true);
      } else {
        setShown(false);
      }
    };

    let lastY: number | null = null;
    const onMove = (e: PointerEvent) => {
      lastY = e.clientY;
      window.clearTimeout(hideTimer.current);
      evaluate(e.clientY);
    };
    // Scrolling by wheel/keyboard moves the page under a stationary pointer, so
    // `lastY` alone would leave it hidden forever. Surface it briefly on any
    // scroll, then fall back to proximity.
    const onScroll = () => {
      if (lastY === null) {
        setDock("bottom");
        setShown(true);
        window.clearTimeout(lingerTimer.current);
        lingerTimer.current = window.setTimeout(() => {
          if (!atEnd() && !fitsViewport()) setShown(false);
        }, LINGER);
        return;
      }
      evaluate(lastY);
    };
    const onLeave = () => {
      hideTimer.current = window.setTimeout(() => {
        if (!atEnd()) setShown(false);
      }, 400);
    };

    evaluate(null);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    // viewport changes flip whether the page even scrolls
    const onResize = () => evaluate(lastY);
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(lingerTimer.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="back" data-dock={dock} data-shown={shown || focused}>
      <button
        type="button"
        className="chip"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => {
          haptic();
          onBack();
        }}
        onMouseEnter={() => playTone("chip")}
      >
        ‹ Back
      </button>
    </div>
  );
}
