import type { Media, View } from "@/data/site";
import { site as fallbackSite, views as fallbackViews } from "@/data/site";
import { sanity } from "./sanity.client";

/**
 * Reads the site out of Sanity and returns the exact shapes the components
 * already consume. Nothing downstream knows a CMS exists.
 *
 * `data/site.ts` stays as the type definitions and as a fallback: if Sanity is
 * unreachable at build time the site still builds with the last known content
 * rather than shipping an empty portfolio. A CMS outage should degrade to stale,
 * never to blank.
 */

const MEDIA_KIND: Record<string, Media["kind"]> = {
  mediaSite: "site", mediaFlow: "flow", mediaVideo: "video", mediaFigma: "figma",
  mediaImage: "image", mediaBrand: "brand", mediaTerminal: "terminal",
  mediaApi: "api", mediaChat: "chat", mediaArch: "arch",
};

type Raw = Record<string, any>;

const media = (m: Raw): Media => ({
  kind: MEDIA_KIND[m._type] ?? "image",
  label: m.label,
  href: m.href,
  device: m.device,
  live: m.live,
  src: m.screenshot?.url ?? m.image?.url ?? m.url ?? m.embedUrl,
  steps: m.steps?.map((s: Raw) => ({ label: s.label, src: s.screenshot?.url })),
  lines: m.lines,
  request: m.request,
  response: m.response,
  messages: m.messages,
  tiers: m.tiers,
});

const PROJECT = `
  "id": slug.current, title, label, kicker, role, period, body, stack,
  ownership, inDock, dockOrder,
  "brand": brandColor.hex, "tile": tileColor.hex,
  "appIcon": appIcon.asset->url, "markSrc": markSrc.asset->url,
  outcomes[]{ value, label },
  links[]{ label, href },
  media[]{ ..., "screenshot": screenshot.asset->{url}, "image": image.asset->{url},
           steps[]{ label, "screenshot": screenshot.asset->{url} } },
  caseStudy{ premise, chapters[]{ label, title, body,
    media[]{ ..., "screenshot": screenshot.asset->{url} } } }
`;

const QUERY = `{
  "settings": *[_id == "siteSettings"][0]{
    name, handle, titleLines, highlightWords, blurb, email, bubbles
  },
  "about": *[_id == "about"][0]{
    name, role, statement, body, stack, links[]{ label, href }
  },
  "projects": *[_type == "project"] | order(dockOrder asc, title asc){ ${PROJECT} },
  "indexes": *[_type == "indexPage"] | order(dockOrder asc){
    "id": slug.current, title, label, kicker, period, body, inDock, dockOrder,
    "brand": brandColor.hex, "tile": tileColor.hex,
    entries[]{ group, blurbOverride, "view": project->slug.current,
               "title": project->title, "projectBlurb": project->body[0],
               "meta": project->period }
  }
}`;

/** Sanity has no `tint`; it is derived from the brand colour, as planned. */
const toView = (r: Raw, kind: View["kind"]): View => ({
  id: r.id,
  kind,
  label: r.label ?? r.title,
  mark: (r.label ?? r.title ?? "?").slice(0, 2).toUpperCase(),
  dock: !!r.inDock,
  tile: r.tile ?? "#6B665C",
  brand: r.brand ?? r.tile,
  appIcon: r.appIcon ?? undefined,
  markSrc: r.markSrc ?? undefined,
  gradient: ["#8f8f8f", "#b5b5b5", "#e4e4e4"],
  tint: { light: r.brand ?? "#BDBAB4", dark: r.brand ?? "#5F5D5A" },
  kicker: r.kicker ?? "",
  title: r.title,
  role: r.role,
  period: r.period,
  body: r.body ?? [],
  outcomes: r.outcomes ?? undefined,
  stack: r.stack ?? undefined,
  links: r.links ?? undefined,
  media: r.media?.map(media),
  caseStudy: r.caseStudy
    ? {
        premise: r.caseStudy.premise,
        chapters: r.caseStudy.chapters.map((c: Raw) => ({
          label: c.label, title: c.title, body: c.body,
          media: c.media?.map(media),
        })),
      }
    : undefined,
  entries: r.entries?.map((e: Raw) => ({
    title: e.title,
    blurb: e.blurbOverride ?? e.projectBlurb ?? "",
    meta: e.meta ?? "",
    group: e.group,
    view: e.view,
  })),
});

export type Content = { views: View[]; site: typeof fallbackSite };

export async function getContent(): Promise<Content> {
  try {
    const d = await sanity.fetch<Raw>(QUERY, {}, { next: { revalidate: 60 } });
    if (!d?.projects?.length) throw new Error("empty dataset");

    const views: View[] = [
      ...d.indexes.map((i: Raw) => toView(i, "index")),
      ...d.projects.map((p: Raw) => toView(p, "project")),
    ];

    if (d.about) {
      views.push({
        ...toView({ id: "about", title: d.about.name, ...d.about }, "about"),
        body: [d.about.statement, ...(d.about.body ?? [])],
      });
    }

    return {
      views,
      site: {
        ...fallbackSite,
        name: d.settings?.name ?? fallbackSite.name,
        handle: d.settings?.handle ?? fallbackSite.handle,
        title: d.settings?.titleLines ?? fallbackSite.title,
        highlight: d.settings?.highlightWords ?? fallbackSite.highlight,
        blurb: d.settings?.blurb ?? fallbackSite.blurb,
        email: d.settings?.email ?? fallbackSite.email,
        bubbles: d.settings?.bubbles ?? fallbackSite.bubbles,
      },
    };
  } catch (err) {
    console.warn(
      "[content] Sanity fetch failed, using the bundled fallback:",
      err instanceof Error ? err.message : err,
    );
    return { views: fallbackViews, site: fallbackSite };
  }
}
