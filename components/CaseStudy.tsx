"use client";

import type { CaseStudy as CS, View } from "@/data/site";
import { MediaBlock } from "./MediaBlock";

/**
 * The long version of a project.
 *
 * Numbered chapters rather than one undifferentiated wall — a case study is
 * read in order, and a reader deciding whether to keep going needs to see the
 * shape of it. Each chapter can carry its own evidence, so a point is made
 * where it's argued rather than in a gallery at the bottom.
 *
 * Deliberately not shown for every project: only ones with a story worth three
 * chapters get one, and everything else stops at the summary.
 */
export function CaseStudy({ view, study }: { view: View; study: CS }) {
  return (
    <section className="cs" aria-label="Case study">
      <header className="cs__head">
        <h3 className="mono cs__label">Case study</h3>
        <p className="cs__premise">{study.premise}</p>
      </header>

      <ol className="cs__chapters">
        {study.chapters.map((c, i) => (
          <li className="cs__chapter" key={c.label}>
            <div className="cs__marker" aria-hidden="true">
              <span className="mono cs__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="cs__rule" />
            </div>

            <div className="cs__content">
              <p className="mono cs__chapter-label">{c.label}</p>
              <h4 className="cs__chapter-title">{c.title}</h4>
              {c.body.map((para) => (
                <p className="cs__body" key={para.slice(0, 24)}>
                  {para}
                </p>
              ))}
              {c.media?.map((m, n) => (
                <MediaBlock key={`${m.kind}-${n}`} view={view} media={m} />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
