"use client";

import { Frame, PlayCircle, SwatchBook } from "lucide-react";
import type { Media, View } from "@/data/site";
import { FlowShowcase } from "./FlowShowcase";
import { ApiBlock, ArchBlock, ChatBlock, TerminalBlock } from "./NonVisual";
import { SiteShowcase } from "./SiteShowcase";

/**
 * One block of project media. Dispatches on `kind` so a project can carry any
 * mix of evidence without the panel knowing about each type:
 *
 *   site   → the interactive 3D browser showcase
 *   video  → Loom / MP4 walkthrough
 *   figma  → embedded Figma file or prototype
 *   image  → a plain still (brand sheet, diagram, poster)
 *   brand  → colour + type specimen generated from the project's own tokens
 *
 * Everything degrades to a labelled placeholder when `src` is missing, so a
 * project can declare "there is a Loom for this" before the Loom exists and the
 * layout is already right.
 */

function Embed({ media, title }: { media: Media; title: string }) {
  if (!media.src) {
    return (
      <div className="media__pending">
        {media.kind === "figma" ? (
          <Frame size={26} strokeWidth={1.8} />
        ) : media.kind === "video" ? (
          <PlayCircle size={26} strokeWidth={1.8} />
        ) : (
          <SwatchBook size={26} strokeWidth={1.8} />
        )}
        <span className="mono">
          {media.kind} pending{media.label ? ` — ${media.label}` : ""}
        </span>
      </div>
    );
  }

  if (media.kind === "video" && /\.(mp4|webm)$/i.test(media.src)) {
    return (
      <video
        className="media__frame"
        src={media.src}
        controls
        playsInline
        preload="metadata"
        poster={media.poster}
      />
    );
  }

  // Loom and Figma both hand out embeddable URLs
  return (
    <iframe
      className="media__frame"
      src={media.src}
      title={media.label ?? title}
      loading="lazy"
      allow="fullscreen; clipboard-write"
      referrerPolicy="no-referrer"
    />
  );
}

export function MediaBlock({ view, media }: { view: View; media: Media }) {
  if (media.kind === "site") return <SiteShowcase view={view} media={media} />;
  if (media.kind === "flow") return <FlowShowcase view={view} media={media} />;
  // work with no screen: show the artefact instead of a mockup
  if (media.kind === "terminal") return <TerminalBlock media={media} />;
  if (media.kind === "api") return <ApiBlock media={media} />;
  if (media.kind === "chat") return <ChatBlock media={media} />;
  if (media.kind === "arch") return <ArchBlock view={view} media={media} />;

  if (media.kind === "image") {
    return (
      <figure className="media">
        {media.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="media__frame" src={media.src} alt={media.label ?? ""} />
        ) : (
          <div className="media__pending">
            <SwatchBook size={26} strokeWidth={1.8} />
            <span className="mono">image pending</span>
          </div>
        )}
        {media.label && <figcaption className="mono media__cap">{media.label}</figcaption>}
      </figure>
    );
  }

  if (media.kind === "brand") {
    const brand = view.brand ?? view.tile;
    return (
      <figure className="media">
        <div className="media__brand" style={{ "--brand": brand } as React.CSSProperties}>
          <div className="media__swatches">
            {[brand, view.tile, ...(view.gradient ?? [])].slice(0, 5).map((c, i) => (
              <span key={`${c}-${i}`} style={{ background: c }} title={c} />
            ))}
          </div>
          <p className="media__specimen">{view.title}</p>
          <p className="mono media__cap">{brand}</p>
        </div>
        {media.label && <figcaption className="mono media__cap">{media.label}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className="media" data-kind={media.kind}>
      <Embed media={media} title={view.title} />
      {media.label && <figcaption className="mono media__cap">{media.label}</figcaption>}
    </figure>
  );
}
