#!/usr/bin/env node
/**
 * One-off migration: data/site.ts -> Sanity.
 *
 * Idempotent by construction. Every document gets a deterministic _id derived
 * from its slug, and everything goes through a single transaction with
 * createOrReplace, so re-running overwrites rather than duplicating. That
 * matters more than it sounds: a migration you can only run once is a
 * migration you can't fix a typo in.
 *
 *   node scripts/migrate-to-sanity.mjs --dry     inspect, write nothing
 *   node scripts/migrate-to-sanity.mjs           commit
 *
 * Needs SANITY_WRITE_TOKEN (Editor or above).
 */

import { createClient } from "@sanity/client";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ts-loader.mjs", pathToFileURL("./scripts/"));

const { views, site } = await import("../data/site.ts");

const dry = process.argv.includes("--dry");
const ndjson = process.argv.includes("--ndjson");
const token = process.env.SANITY_WRITE_TOKEN;
if (!dry && !ndjson && !token) {
  console.error("SANITY_WRITE_TOKEN is not set. Use --ndjson (then `sanity dataset import`) or --dry.");
  process.exit(1);
}

const client = createClient({
  projectId: "k8n4gdum",
  dataset: "production",
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

/**
 * Hyphen, not dot. A dot in a Sanity _id is a reserved namespace separator
 * (`drafts.`, `versions.`), so `project.rdk` is treated as a private namespace
 * and silently excluded from public reads. It imports fine and the API returns
 * it to an authenticated client, which is what makes it so easy to miss.
 */
const id = (prefix, slug) => `${prefix}-${slug}`;
const colour = (hex) => (hex ? { _type: "color", hex } : undefined);
const key = (i) => ({ _key: `k${i}` });

/** media objects map 1:1 onto the mediaX types, minus the fields they don't own */
function media(m, i) {
  const t = {
    site: "mediaSite", flow: "mediaFlow", video: "mediaVideo", figma: "mediaFigma",
    image: "mediaImage", brand: "mediaBrand", terminal: "mediaTerminal",
    api: "mediaApi", chat: "mediaChat", arch: "mediaArch",
  }[m.kind];
  const base = { _type: t, ...key(i), label: m.label };

  switch (m.kind) {
    case "site":  return { ...base, href: m.href, device: m.device ?? "browser", live: !!m.live };
    case "flow":  return { ...base, steps: (m.steps ?? []).map((s, n) => ({ _type: "object", ...key(n), label: s.label })) };
    case "video": return { ...base, url: m.src };
    case "figma": return { ...base, embedUrl: m.src };
    case "terminal": return { ...base, lines: (m.lines ?? []).map((l, n) => ({ _type: "object", ...key(n), ...l })) };
    case "api":   return { ...base, request: m.request, response: m.response };
    case "chat":  return { ...base, messages: (m.messages ?? []).map((x, n) => ({ _type: "object", ...key(n), ...x })) };
    case "arch":  return { ...base, tiers: (m.tiers ?? []).map((x, n) => ({ _type: "object", ...key(n), ...x })) };
    default:      return base;
  }
}

/** ownership was encoded in prose and group strings; make it explicit */
function ownership(v) {
  const k = `${v.kicker} ${v.role ?? ""}`.toLowerCase();
  if (k.includes("contract")) return "contract";
  if (k.includes("senior engineer") || k.includes("employed")) return "employed";
  return "owned";
}

const docs = [];

for (const v of views) {
  if (v.kind === "about") {
    docs.push({
      _id: "about", _type: "about",
      name: site.name, role: v.role, statement: v.body[0],
      body: v.body.slice(1), stack: v.stack ?? [],
      links: (v.links ?? []).map((l, i) => ({ _type: "link", ...key(i), ...l })),
      featured: ["relayhelp", "ise", "collabo", "hq", "rdk"]
        .map((s, i) => ({ _type: "reference", ...key(i), _ref: id("project", s) })),
    });
  } else if (v.kind === "index") {
    docs.push({
      _id: id("index", v.id), _type: "indexPage",
      title: v.title, slug: { _type: "slug", current: v.id },
      label: v.label, kicker: v.kicker, period: v.period, body: v.body,
      brandColor: colour(v.brand ?? v.tile), tileColor: colour(v.tile),
      inDock: v.dock, dockOrder: v.dock ? views.filter((x) => x.dock).indexOf(v) : undefined,
      entries: (v.entries ?? []).map((e, i) => ({
        _type: "entry", ...key(i), group: e.group,
        blurbOverride: e.blurb,
        project: e.view ? { _type: "reference", _ref: id("project", e.view) } : undefined,
      })).filter((e) => e.project),
    });
  } else {
    docs.push({
      _id: id("project", v.id), _type: "project",
      title: v.title, slug: { _type: "slug", current: v.id },
      label: v.label, kicker: v.kicker, role: v.role, period: v.period,
      ownership: ownership(v),
      body: v.body, stack: v.stack ?? [],
      outcomes: (v.outcomes ?? []).map((o, i) => ({ _type: "outcome", ...key(i), ...o })),
      links: (v.links ?? []).map((l, i) => ({ _type: "link", ...key(i), ...l })),
      brandColor: colour(v.brand ?? v.tile), tileColor: colour(v.tile),
      inDock: v.dock, dockOrder: v.dock ? views.filter((x) => x.dock).indexOf(v) : undefined,
      media: (v.media ?? []).map(media),
      caseStudy: v.caseStudy && {
        _type: "caseStudy",
        premise: v.caseStudy.premise,
        chapters: v.caseStudy.chapters.map((c, i) => ({
          _type: "caseStudyChapter", ...key(i),
          label: c.label, title: c.title, body: c.body,
          media: (c.media ?? []).map(media),
        })),
      },
    });
  }
}

docs.push({
  _id: "siteSettings", _type: "siteSettings",
  name: site.name, handle: site.handle, titleLines: site.title,
  highlightWords: site.highlight, blurb: site.blurb, email: site.email,
  bubbles: site.bubbles,
});

const counts = docs.reduce((a, d) => ({ ...a, [d._type]: (a[d._type] ?? 0) + 1 }), {});
console.log("documents:", counts, "| total", docs.length);

if (ndjson) {
  // NDJSON + `sanity dataset import` creates PUBLISHED documents. The MCP's
  // create_documents makes drafts, which the site would not see.
  const { writeFileSync } = await import("node:fs");
  writeFileSync("sanity-export.ndjson", docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
  console.log("wrote sanity-export.ndjson");
  process.exit(0);
}

if (dry) {
  console.log("\ndry run, nothing written. sample:");
  console.log(JSON.stringify(docs.find((d) => d._id === "project.rdk"), null, 2).slice(0, 900));
  process.exit(0);
}

const tx = client.transaction();
docs.forEach((d) => tx.createOrReplace(d));
const res = await tx.commit();
console.log("committed:", res.results.length, "documents");
