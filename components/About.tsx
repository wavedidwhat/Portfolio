"use client";

import type { View } from "@/data/site";
import { useContent } from "@/lib/content-context";
import { BackButton } from "./BackButton";
import { ProjectShowcase } from "./ProjectShowcase";

/**
 * About gets its own layout.
 *
 * Every other view is the same template — kicker, title, stats, lead, prose —
 * which is right for a project and wrong for a person. This one leads with the
 * avatar and a statement rather than a label, runs the copy in two columns so
 * it reads as prose instead of a spec sheet, and ends on contact. The shared
 * `.panel` chrome is deliberately not used.
 */
export function About({
  view,
  onBack,
  onOpen,
}: {
  view: View;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const { site } = useContent();
  return (
    <article className="about shell">
      <BackButton onBack={onBack} />

      <header className="about__head enter">
        <div className="about__avatar" aria-hidden="true" />
        <div>
          <h2 className="about__name">{site.name}</h2>
          <p className="mono about__role">{view.role}</p>
        </div>
      </header>

      <p className="about__statement">{view.body[0]}</p>

      <div className="about__cols">
        {view.body.slice(1).map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <section className="about__section">
        <h3 className="mono about__label">Selected work</h3>
        <ProjectShowcase onOpen={onOpen} />
      </section>

      <section className="about__section">
        <h3 className="mono about__label">What I work with</h3>
        <div className="tags">
          {view.stack?.map((s) => (
            <span className="tag" key={s}>
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="about__section about__contact">
        <h3 className="mono about__label">Get in touch</h3>
        <div className="about__links">
          {view.links?.map((l) => (
            <a
              key={l.href}
              className="about__link"
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>{l.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
