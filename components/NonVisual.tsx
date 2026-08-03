"use client";

import type { Media, View } from "@/data/site";

/**
 * Showcases for work that has no screen.
 *
 * A backend service, a CLI, a bot or an agent can't be proven with a device
 * mockup — putting one up would be decoration standing in for evidence. These
 * render the artefact that actually is the work: the session you'd run, the
 * call you'd make, the conversation it holds, or the shape of the system.
 *
 * All four are styled from the same tokens as everything else and take the
 * project's brand colour, so a backend project sits alongside a visual one
 * without looking like a different site.
 */

export function TerminalBlock({ media }: { media: Media }) {
  const lines = media.lines ?? [];
  return (
    <figure className="nv nv--term">
      <div className="nv__chrome">
        <span /> <span /> <span />
        <span className="nv__title mono">{media.label ?? "session"}</span>
      </div>
      <pre className="nv__body">
        {lines.map((l, i) => (
          <span className="nv__line" key={i}>
            {l.comment && <span className="nv__comment"># {l.comment}</span>}
            {l.cmd && (
              <span className="nv__cmd">
                <span className="nv__prompt">$</span> {l.cmd}
              </span>
            )}
            {l.out && <span className="nv__out">{l.out}</span>}
          </span>
        ))}
      </pre>
    </figure>
  );
}

export function ApiBlock({ media }: { media: Media }) {
  const req = media.request;
  const res = media.response;
  const ok = (res?.status ?? 200) < 400;
  return (
    <figure className="nv nv--api">
      <div className="nv__pair">
        <div className="nv__side">
          <p className="mono nv__side-label">request</p>
          <p className="nv__endpoint">
            <span className="nv__method">{req?.method}</span>
            <span>{req?.path}</span>
          </p>
          {req?.body && <pre className="nv__json">{req.body}</pre>}
        </div>
        <div className="nv__side">
          <p className="mono nv__side-label">response</p>
          <p className="nv__endpoint">
            <span className="nv__status" data-ok={ok}>
              {res?.status}
            </span>
            {res?.note && <span className="nv__note">{res.note}</span>}
          </p>
          {res?.body && <pre className="nv__json">{res.body}</pre>}
        </div>
      </div>
      {media.label && <figcaption className="mono nv__cap">{media.label}</figcaption>}
    </figure>
  );
}

export function ChatBlock({ media }: { media: Media }) {
  const msgs = media.messages ?? [];
  return (
    <figure className="nv nv--chat">
      <div className="nv__thread">
        {msgs.map((m, i) => (
          <div className="nv__msg" data-from={m.from} key={i}>
            {m.meta && <span className="mono nv__msg-meta">{m.meta}</span>}
            <span className="nv__bubble">{m.text}</span>
          </div>
        ))}
      </div>
      {media.label && <figcaption className="mono nv__cap">{media.label}</figcaption>}
    </figure>
  );
}

export function ArchBlock({ view, media }: { view: View; media: Media }) {
  const tiers = media.tiers ?? [];
  return (
    <figure
      className="nv nv--arch"
      style={{ "--brand": view.brand ?? view.tile } as React.CSSProperties}
    >
      <div className="nv__tiers">
        {tiers.map((t, i) => (
          <div className="nv__tier" key={t.label}>
            <p className="mono nv__tier-label">{t.label}</p>
            <div className="nv__nodes">
              {t.nodes.map((n) => (
                <span className="nv__node" key={n}>
                  {n}
                </span>
              ))}
            </div>
            {i < tiers.length - 1 && (
              <span className="nv__arrow" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>
      {media.label && <figcaption className="mono nv__cap">{media.label}</figcaption>}
    </figure>
  );
}
