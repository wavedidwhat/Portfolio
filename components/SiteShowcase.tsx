"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Move3d, Square } from "lucide-react";
import type { Media, View } from "@/data/site";

/**
 * Interactive 3D showcase for a project's live site.
 *
 * The glass case stays put; only the device inside tilts and parallaxes, so the
 * case reads as a shelf the object sits on rather than the whole thing swaying.
 * Pure CSS 3D — no three.js, and no second GPU context competing with the lava.
 *
 * The browser chrome's URL bar is the real link: whole device is clickable, the
 * bar shows the destination, and an arrow appears on hover so it's obvious it
 * goes somewhere.
 *
 * `media.src` is a screenshot. None exist in any repo yet, so until one is
 * dropped in it renders a designed placeholder rather than a broken image.
 */

const MAX_TILT = 12; // degrees

export function SiteShowcase({ view, media }: { view: View; media: Media }) {
  const deviceRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  /**
   * Off by default: the common intent is to click through to the site, and a
   * device that tilts under the cursor makes that feel like wrestling a toy.
   * 3D is opt-in via the toggle for anyone who wants to play with it.
   */
  const [interactive, setInteractive] = useState(false);

  const onMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const el = deviceRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 2 * MAX_TILT, y: px * 2 * MAX_TILT, active: true });
  };

  const brand = view.brand ?? view.tile;
  const device = media.device ?? "browser";
  const href = media.href;
  const label = href?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const screen = (
    <div className="site3d__screen">
      {media.live && href ? (
        <iframe
          src={href}
          title={`${view.title} — live`}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={`${view.title} interface`} />
      ) : (
        <span className="site3d__placeholder">
          {view.appIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={view.appIcon} alt="" className="site3d__mark" />
          ) : (
            <span className="site3d__initial">{view.mark}</span>
          )}
          <span className="mono site3d__pending">screenshot pending</span>
        </span>
      )}
    </div>
  );

  // phone: no browser chrome, a Dynamic Island instead, and the link moves to
  // the caption since there's nowhere sensible to put a URL bar
  const inner = device === "phone" ? (
    <>
      <span className="site3d__island" aria-hidden="true" />
      {screen}
    </>
  ) : (
    <>
      <div className="site3d__bar">
        <span /> <span /> <span />
        <span className="site3d__url">{label ?? view.title}</span>
        {href && <ArrowUpRight className="site3d__go" size={14} strokeWidth={2.4} />}
      </div>
      {screen}
    </>
  );

  return (
    <figure className="site3d" data-device={device} style={{ "--brand": brand } as React.CSSProperties}>
      <div className="site3d__case" data-interactive={interactive}>
        <button
          type="button"
          className="site3d__toggle chip"
          onClick={() => {
            setInteractive((v) => !v);
            setTilt({ x: 0, y: 0, active: false });
          }}
          aria-pressed={interactive}
        >
          {interactive ? <Move3d size={13} /> : <Square size={13} />}
          {interactive ? "3D on" : "3D off"}
        </button>

        <div
          ref={deviceRef}
          className="site3d__tilt"
          data-active={tilt.active && interactive}
          onPointerMove={onMove}
          onPointerLeave={() => setTilt({ x: 0, y: 0, active: false })}
          style={
            {
              "--tilt-x": `${tilt.x}deg`,
              "--tilt-y": `${tilt.y}deg`,
            } as React.CSSProperties
          }
        >
          {href ? (
            <a
              className="site3d__device"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${label}`}
            >
              {inner}
              <span className="site3d__glare" aria-hidden="true" />
            </a>
          ) : (
            <div className="site3d__device">
              {inner}
              <span className="site3d__glare" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <figcaption className="mono site3d__caption">
        {media.label ?? (href ? "live site — click to open" : "in development")}
      </figcaption>
    </figure>
  );
}
