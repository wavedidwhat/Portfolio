"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";

/**
 * The view transition. The reference morphs one path through three states with
 * MorphSVGPlugin; all three share the same command structure, so we just lerp
 * the three y-values and rebuild the `d` string — same motion, no plugin.
 *
 *   collapsed  M 0 100 V 100 Q 50 100 100 100 V 100 z   (off-screen, bottom)
 *   crest      M 0 100 V 50  Q 50 0   100 50  V 100 z   (bulging wave)
 *   covered    M 0 100 V 0   Q 50 0   100 0   V 100 z   (full cover)
 */
type Shape = { edge: number; ctrl: number };

const COLLAPSED: Shape = { edge: 100, ctrl: 100 };
const CREST: Shape = { edge: 50, ctrl: 0 };
const COVERED: Shape = { edge: 0, ctrl: 0 };

type Dir = "up" | "down";

/**
 * Same wave, anchored to the opposite edge depending on travel direction.
 * Going deeper it rises from the bottom; coming back it falls from the top —
 * so retreating literally reverses the gesture that brought you in, and the
 * movement carries a sense of direction rather than being one animation reused.
 */
const d = ({ edge, ctrl }: Shape, dir: Dir) =>
  dir === "up"
    ? `M 0 100 V ${edge} Q 50 ${ctrl} 100 ${edge} V 100 z`
    : `M 0 0 V ${100 - edge} Q 50 ${100 - ctrl} 100 ${100 - edge} V 0 z`;

/**
 * Tightened from the reference's 0.5/0.5/0.12/1.1. Theirs back-loads the first
 * half with power2.in, so the frost lands instantly and then nothing appears to
 * move for ~300ms — it reads as a stall, not a transition. Shorter lead-in on a
 * gentler ease keeps it one continuous motion, and the page now swaps at ~0.62s
 * instead of 1.0s.
 */
const TIMING = {
  openExpand: 0.28,
  openCover: 0.34,
  coveredHold: 0.05,
  fadeOut: 0.62,
  closeFadeIn: 0.16,
  closeCollapse: 0.3,
  closeReset: 0.36,
};

export interface CurtainHandle {
  /** sweep up and cover, run `onCovered` at the peak, then fade away.
   *  `frost` off for theme flips — blurring the page while it merely changes
   *  colour reads as a loading state rather than a transition. */
  open(fill: string, onCovered: () => void, frost?: boolean, dir?: Dir): void;
  /** we're already back home — retreat the curtain downward */
  close(fill: string, dir?: Dir): void;
  /** kill an in-flight sweep so a new one can start immediately */
  interrupt(): void;
  isBusy(): boolean;
}

export const Curtain = forwardRef<CurtainHandle>(function Curtain(_props, ref) {
  const rootRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useImperativeHandle(ref, () => {
    const shape = { ...COLLAPSED };
    let dir: Dir = "up";
    /* The live timeline. killTweensOf() only kills tweens — the .add() callbacks
       that swap the view are owned by the timeline, so an interrupted sweep would
       still fire onCovered and stomp the view we just navigated to. Kill this. */
    let tl: gsap.core.Timeline | null = null;

    const draw = () => {
      pathRef.current?.setAttribute("d", d(shape, dir));
    };

    const to = (target: Shape, duration: number, ease: string) =>
      gsap.to(shape, { ...target, duration, ease, onUpdate: draw });

    const paint = (fill: string) => {
      pathRef.current?.setAttribute("fill", fill);
      pathRef.current?.setAttribute("stroke", fill);
    };

    const reset = () => {
      Object.assign(shape, COLLAPSED);
      draw();
      gsap.set(wrapRef.current, { autoAlpha: 0 });
      wrapRef.current?.setAttribute("data-on", "false");
      wrapRef.current?.setAttribute("data-frost", "true");
      busy.current = false;
    };

    return {
      isBusy: () => busy.current,

      interrupt() {
        tl?.kill();
        tl = null;
        gsap.killTweensOf(shape);
        gsap.killTweensOf(wrapRef.current);
        reset();
      },

      open(fill, onCovered, frost = true, direction: Dir = "up") {
        dir = direction;
        if (busy.current) return;
        busy.current = true;

        tl?.kill();
        gsap.killTweensOf(shape);
        gsap.killTweensOf(wrapRef.current);
        Object.assign(shape, COLLAPSED);
        draw();
        paint(fill);
        wrapRef.current?.setAttribute("data-on", "true");
        wrapRef.current?.setAttribute("data-frost", String(frost));
        gsap.set(wrapRef.current, { autoAlpha: 1 });

        tl = gsap
          .timeline({ onComplete: reset })
          .add(to(CREST, TIMING.openExpand, "power1.out"))
          .add(to(COVERED, TIMING.openCover, "power2.out"))
          .add(onCovered)
          .to(wrapRef.current, {
            autoAlpha: 0,
            delay: TIMING.coveredHold,
            duration: TIMING.fadeOut,
            ease: "power1.out",
          });
      },

      close(fill, direction: Dir = "up") {
        dir = direction;
        if (busy.current) return;
        busy.current = true;

        tl?.kill();
        gsap.killTweensOf(shape);
        gsap.killTweensOf(wrapRef.current);
        Object.assign(shape, COVERED);
        draw();
        paint(fill);
        wrapRef.current?.setAttribute("data-on", "true");
        wrapRef.current?.setAttribute("data-frost", "true");
        // Was `autoAlpha: 1` — snapping straight to a full-screen tint while the
        // shape was already COVERED, i.e. a hard flash, where opening sweeps in
        // gradually. Fade it in over one beat first so the two read as a pair.
        gsap.set(wrapRef.current, { autoAlpha: 0 });

        tl = gsap
          .timeline({ onComplete: reset })
          .to(wrapRef.current, {
            autoAlpha: 1,
            duration: TIMING.closeFadeIn,
            ease: "power1.out",
          })
          .add(to(CREST, TIMING.closeCollapse, "power1.out"))
          .add(to(COLLAPSED, TIMING.closeReset, "power2.out"));
      },
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="curtain"
      data-on="false"
      data-frost="true"
      aria-hidden="true"
    >
      <svg
        ref={rootRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMin slice"
      >
        <path
          ref={pathRef}
          d={d(COLLAPSED, "up")}
          fill="rgba(255,255,255,0.88)"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
});
