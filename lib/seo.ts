import { site, views } from "@/data/site";

export const SITE_URL = "https://wavedidwhat.com";

/**
 * Search snippets get cut around 155 characters, so the sentence that matters
 * goes first. Written to read as a person describing their work, not as a
 * keyword list.
 */
export const DESCRIPTION =
  "Product engineer building full-stack products end to end: design, schema, frontend, automation and deploy. Selected work, contract engagements and open source.";

export const TITLE = `${site.name} · product engineer`;

/** structured data, so search engines can render an entity rather than a page */
export function personJsonLd() {
  const projects = views
    .filter((v) => v.kind === "project" && v.links?.length)
    .slice(0, 12)
    .map((v) => ({
      "@type": "CreativeWork",
      name: v.title,
      description: v.body[0]?.slice(0, 180),
      url: v.links?.[0]?.href,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.handle,
    url: SITE_URL,
    email: `mailto:${site.email}`,
    jobTitle: "Product Engineer",
    description: DESCRIPTION,
    sameAs: [
      "https://github.com/Enochthedev",
      "https://youtube.com/@wavedidwhat",
    ],
    knowsAbout: [
      "Full-stack engineering",
      "Backend systems",
      "TypeScript",
      "Next.js",
      "Postgres",
      "Workflow automation",
      "Developer tooling",
    ],
    subjectOf: projects,
  };
}
