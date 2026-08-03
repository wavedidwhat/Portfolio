"use client";

import { getView, type View } from "@/data/site";
import { haptic } from "@/lib/feedback";
import { BackButton } from "./BackButton";
import { IndexList } from "./IndexList";
import { CaseStudy } from "./CaseStudy";
import { MediaBlock } from "./MediaBlock";
import { ProjectMark } from "./ProjectMark";

export function Panel({
  view,
  onBack,
  onOpen,
}: {
  view: View;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <article className="panel shell">
      <BackButton onBack={onBack} />

      <div className="enter">
        {/* the project wears its own face here too, not just in the dock */}
        <div className="panel__id">
          <ProjectMark view={view} className="pmark--lg" />
          <div>
            <p className="mono panel__kicker">{view.kicker}</p>
            <h2 className="panel__title">{view.title}</h2>
          </div>
        </div>

        {(view.role || view.period) && (
          <p className="panel__meta">
            {[view.role, view.period].filter(Boolean).join(" · ")}
          </p>
        )}

        {view.outcomes && view.outcomes.length > 0 && (
          <div className="stats">
            {view.outcomes.map((o) => (
              <div className="stat" key={o.label}>
                <div className="stat__value">{o.value}</div>
                <div className="stat__label">{o.label}</div>
              </div>
            ))}
          </div>
        )}

        {view.body[0] && <p className="panel__lead">{view.body[0]}</p>}

        {view.body.length > 1 && (
          <div className="prose">
            {view.body.slice(1).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        )}

        {view.media?.map((m, i) => (
          <MediaBlock key={`${m.kind}-${i}`} view={view} media={m} />
        ))}

        {view.entries && view.entries.length > 0 && (
          <IndexList entries={view.entries} onOpen={onOpen} />
        )}

        {view.caseStudy && <CaseStudy view={view} study={view.caseStudy} />}

        {view.stack && view.stack.length > 0 && (
          <div className="tags">
            {view.stack.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        )}

        {view.links && view.links.length > 0 && (
          <div className="outlinks">
            {view.links.map((l) => (
              <a
                key={l.href}
                className="outlink"
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
