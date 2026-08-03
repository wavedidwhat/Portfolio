"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Media, View } from "@/data/site";

/**
 * A short walkthrough inside the device frame — the answer to "can a visitor
 * see a small flow without the site being live".
 *
 * Steps advance on their own so it reads as a demo at a glance, but any manual
 * interaction stops the timer: nothing is more irritating than a carousel that
 * yanks itself forward while you're reading a step. Dots and arrows are real
 * controls, and the step label is announced politely to screen readers.
 */

const DWELL = 2800;

export function FlowShowcase({ view, media }: { view: View; media: Media }) {
  const steps = media.steps ?? [];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || steps.length < 2) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % steps.length), DWELL);
    return () => window.clearTimeout(t);
  }, [i, playing, steps.length]);

  useEffect(() => {
    // honour reduced motion: never auto-advance
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
    }
  }, []);

  if (!steps.length) return null;
  const step = steps[i];
  const brand = view.brand ?? view.tile;

  const go = (n: number) => {
    setPlaying(false);
    setI((n + steps.length) % steps.length);
  };

  return (
    <figure className="flow" style={{ "--brand": brand } as React.CSSProperties}>
      <div className="flow__device">
        <div className="flow__screen">
          {step.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step.src} alt={step.label} />
          ) : (
            <div className="flow__pending">
              <span className="flow__num mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flow__label">{step.label}</span>
              <span className="mono flow__hint">screen pending</span>
            </div>
          )}
        </div>

        <div className="flow__bar">
          <button
            type="button"
            className="flow__ctrl"
            onClick={() => go(i - 1)}
            aria-label="Previous step"
          >
            <ChevronLeft size={15} strokeWidth={2.4} />
          </button>

          <div className="flow__dots" role="tablist" aria-label="Steps">
            {steps.map((s, n) => (
              <button
                key={s.label}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={s.label}
                className="flow__dot"
                data-on={n === i}
                onClick={() => go(n)}
              />
            ))}
          </div>

          <button
            type="button"
            className="flow__ctrl"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
          >
            {playing ? (
              <Pause size={14} strokeWidth={2.4} />
            ) : (
              <Play size={14} strokeWidth={2.4} />
            )}
          </button>

          <button
            type="button"
            className="flow__ctrl"
            onClick={() => go(i + 1)}
            aria-label="Next step"
          >
            <ChevronRight size={15} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <figcaption className="mono flow__cap" aria-live="polite">
        {media.label ? `${media.label} — ` : ""}
        {step.label}
      </figcaption>
    </figure>
  );
}
