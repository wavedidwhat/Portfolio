"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useContent } from "@/lib/content-context";
import { haptic, playTone } from "@/lib/feedback";
import { MobileLauncher } from "./MobileLauncher";

/** words that get the highlighter slab, matched case- and punctuation-insensitively */
const bare = (w: string) => w.replace(/[^\p{L}\p{N}-]/gu, "").toLowerCase();

/** splits a line into words that fade+unblur upward in sequence */
function StaggerLine({
  text,
  lit,
  delay = 0,
  step = 100,
}: {
  text: string;
  lit: Set<string>;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const timers = words.map((_, i) =>
      window.setTimeout(() => setShown((n) => Math.max(n, i + 1)), delay + i * step),
    );
    return () => timers.forEach(window.clearTimeout);
    // words is derived from `text`, which is static per line
  }, [text, delay, step]);

  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="word" data-visible={i < shown}>
          {lit.has(bare(word)) ? (
            <mark className="spark" data-lit={i < shown}>
              {word}
            </mark>
          ) : (
            word
          )}
        </span>
      ))}
    </>
  );
}

export function Home({ onSelect }: { onSelect: (id: string) => void }) {
  const { site, skills } = useContent();
  const lit = useMemo(
    () => new Set(site.highlight.map((w) => w.toLowerCase())),
    [site.highlight],
  );
  const bubbleRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const pillLayer = useRef<HTMLDivElement>(null);
  const phraseIndex = useRef(0);
  const hideTimer = useRef<number | undefined>(undefined);

  const showBubble = useCallback(() => {
    const el = bubbleRef.current;
    if (!el) return;
    el.textContent = site.bubbles[phraseIndex.current];
    phraseIndex.current = (phraseIndex.current + 1) % site.bubbles.length;
    el.setAttribute("data-shown", "true");
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => el.setAttribute("data-shown", "false"),
      2200,
    );
  }, [site.bubbles]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  /**
   * Poke the mark and the stack scatters outward in a ring, drifts, then
   * falls back in — the reference's "skill burst", rebuilt with a gsap
   * timeline over fixed-position pills so nothing reflows the page.
   */
  const burst = useCallback(() => {
    const slot = slotRef.current;
    const layer = pillLayer.current;
    if (!slot || !layer) return;

    haptic([6, 30, 6]);
    playTone("chip");

    const origin = slot.getBoundingClientRect();
    const cx = origin.left + origin.width / 2;
    const cy = origin.top + origin.height / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /*
     * The orbit only works when there's room around the trigger. On a phone the
     * tile sits near the right edge of the title, so a ring of that radius threw
     * half the stack off-screen — you'd tap it and watch most of the answer
     * leave. Below the breakpoint the pills pack into centred rows instead, so
     * every one is readable, and they hold longer since there's no cursor to
     * keep them alive.
     */
    const compact = vw <= 720 || window.matchMedia("(pointer: coarse)").matches;

    layer.replaceChildren();

    /* On mobile the cloud lands over the headline, so it needs to read as an
       overlay rather than a collision: a scrim lifts it off the page and the
       block centres in the viewport instead of hanging off the trigger. */
    let scrim: HTMLElement | null = null;
    if (compact) {
      scrim = document.createElement("div");
      scrim.className = "pill-scrim";
      const cap = document.createElement("span");
      cap.className = "mono pill-scrim__cap";
      cap.textContent = "the stack";
      scrim.appendChild(cap);
      layer.appendChild(scrim);
      gsap.fromTo(
        scrim,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" },
      );
      // don't make anyone wait it out
      scrim.addEventListener(
        "pointerdown",
        () => {
          gsap.killTweensOf(layer.children);
          gsap.to(layer.children, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => layer.replaceChildren(),
          });
        },
        { once: true },
      );
    }

    // build first, measure second: positions depend on real rendered widths
    const pills = skills.map((label) => {
      const el = document.createElement("span");
      el.className = "pill";
      el.textContent = label;
      layer.appendChild(el);
      return el;
    });

    const targets: { x: number; y: number }[] = [];

    if (compact) {
      const pad = 18;
      const gap = 8;
      const maxRow = vw - pad * 2;
      const widths = pills.map((el) => el.getBoundingClientRect().width);
      const rowH = pills[0].getBoundingClientRect().height + gap;

      // greedy wrap into rows that fit the viewport
      const rows: number[][] = [[]];
      let run = 0;
      widths.forEach((w, i) => {
        const add = run ? run + gap + w : w;
        if (add > maxRow && rows[rows.length - 1].length) {
          rows.push([i]);
          run = w;
        } else {
          rows[rows.length - 1].push(i);
          run = add;
        }
      });

      // centred in the viewport, so it reads as a panel rather than spill
      const blockH = rows.length * rowH;
      let top = Math.max(88, (vh - blockH) / 2);
      for (const row of rows) {
        const rowW = row.reduce((a, i) => a + widths[i], 0) + gap * (row.length - 1);
        let x = (vw - rowW) / 2;
        for (const i of row) {
          targets[i] = { x: x + widths[i] / 2, y: top + rowH / 2 };
          x += widths[i] + gap;
        }
        top += rowH;
      }
    } else {
      const radius = Math.min(vw, vh) * 0.3;
      pills.forEach((_, i) => {
        const angle = (i / pills.length) * Math.PI * 2 - Math.PI / 2;
        const spread = radius * (0.72 + Math.random() * 0.5);
        targets[i] = {
          x: cx + Math.cos(angle) * spread,
          y: cy + Math.sin(angle) * spread * 0.78,
        };
      });
    }

    pills.forEach((pill, i) => {
      const t = targets[i];
      gsap.set(pill, { x: cx, y: cy, xPercent: -50, yPercent: -50, scale: 0.4 });

      gsap
        .timeline({ onComplete: () => pill.remove() })
        .to(pill, {
          x: t.x,
          y: t.y,
          scale: 1,
          opacity: 1,
          rotation: compact ? 0 : (Math.random() - 0.5) * 16,
          duration: compact ? 0.5 : 0.75,
          ease: "power3.out",
          delay: i * (compact ? 0.03 : 0.022),
        })
        .to(pill, {
          y: t.y + (compact ? 0 : 10 + Math.random() * 14),
          duration: compact ? 1.7 : 1.1,
          ease: "sine.inOut",
        })
        .to(pill, {
          x: cx,
          y: cy,
          scale: 0.4,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        })
        .add(() => {
          // last pill home takes the scrim with it
          if (scrim && i === pills.length - 1) {
            gsap.to(scrim, {
              opacity: 0,
              duration: 0.3,
              onComplete: () => scrim?.remove(),
            });
          }
        });
    });
  }, []);

  return (
    <section className="home shell" aria-labelledby="home-title">
      <div className="identity">
        <button
          type="button"
          className="avatar"
          aria-label="Say hello"
          onMouseEnter={showBubble}
          onClick={() => {
            showBubble();
            haptic();
          }}
        >
          <span ref={bubbleRef} className="bubble" data-shown="false" />
        </button>
        <div>
          <p className="identity__name">{site.name}</p>
          <p className="identity__sub">{site.handle}</p>
        </div>
      </div>

      <h1 className="title" id="home-title">
        <span className="title__line">
          <StaggerLine text={site.title[0]} lit={lit} />
          <span
            ref={slotRef}
            className="burst-slot"
            role="button"
            tabIndex={0}
            aria-label="Reveal the stack"
            onClick={burst}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                burst();
              }
            }}
          />
        </span>
        <span className="title__line">
          <StaggerLine text={site.title[1]} lit={lit} delay={380} />
        </span>
      </h1>

      <p className="home__blurb">{site.blurb}</p>

      <MobileLauncher onSelect={onSelect} />

      <div ref={pillLayer} aria-hidden="true" />

    </section>
  );
}
