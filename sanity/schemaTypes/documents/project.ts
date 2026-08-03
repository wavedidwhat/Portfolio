import { defineArrayMember, defineField, defineType } from "sanity";
import { mediaMembers } from "../objects/media";

/**
 * A piece of work. Owned products, contract engagements and employed roles are
 * all `project` documents, separated by `ownership` rather than by type — they
 * share every field, and the distinction is a fact about the work, not a
 * different shape of content.
 */
export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "identity", title: "Identity" },
    { name: "evidence", title: "Evidence" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ownership",
      type: "string",
      group: "content",
      initialValue: "owned",
      description:
        "Whether this is yours. Drives which index it belongs on and how the page describes it — keep it accurate, it's the claim that matters most.",
      options: {
        list: [
          { title: "Mine — built and owned", value: "owned" },
          { title: "Contract — engineered for a client", value: "contract" },
          { title: "Employed — a team I work on", value: "employed" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kicker",
      type: "string",
      group: "content",
      description: "Small label above the title, e.g. 'Product — live'.",
    }),
    defineField({ name: "role", type: "string", group: "content" }),
    defineField({
      name: "period",
      type: "string",
      group: "content",
      description: "Free text on purpose: '2025 — now', 'a few months' and 'TBC' are all valid.",
    }),
    defineField({
      name: "body",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "text", rows: 5 })],
      description: "Paragraphs. The first is set large as the lead.",
      validation: (r) => r.min(1).error("A project needs at least one paragraph."),
    }),
    defineField({
      name: "outcomes",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "outcome" })],
      validation: (r) => r.max(4).warning("More than four stats stops reading as a summary."),
    }),
    defineField({ name: "stack", type: "array", group: "content", of: [{ type: "string" }] }),
    defineField({ name: "links", type: "array", group: "content", of: [defineArrayMember({ type: "link" })] }),

    // ── identity ────────────────────────────────────────────────────────────
    defineField({
      name: "label",
      type: "string",
      group: "identity",
      description: "Dock tooltip. Defaults to the title if empty.",
    }),
    defineField({
      name: "brandColor",
      type: "color",
      group: "identity",
      description: "The identity colour. Tints the page transition and the architecture diagram.",
    }),
    defineField({
      name: "tileColor",
      type: "color",
      group: "identity",
      description:
        "The dock tile face. Usually the brand colour, but not always — a brand with a white icon needs a dark tile.",
    }),
    defineField({
      name: "appIcon",
      type: "image",
      group: "identity",
      description:
        "A COMPLETE square icon, drawn edge to edge. Not for logotypes — a wide mark stretches badly here. Use Mark glyph for those.",
    }),
    defineField({
      name: "markSrc",
      title: "Mark glyph",
      type: "image",
      group: "identity",
      description:
        "A glyph-only logo, drawn ON the tile colour and contained rather than cropped. Use for non-square logos.",
    }),
    defineField({
      name: "inDock",
      type: "boolean",
      group: "identity",
      initialValue: false,
      description: "Show in the bottom dock. Everything else is reachable from an index page.",
    }),
    defineField({
      name: "dockOrder",
      type: "number",
      group: "identity",
      hidden: ({ parent }) => !parent?.inDock,
      validation: (r) =>
        r.custom((v, ctx) =>
          (ctx.parent as { inDock?: boolean })?.inDock && typeof v !== "number"
            ? "Set an order for anything shown in the dock."
            : true,
        ),
    }),

    // ── evidence ────────────────────────────────────────────────────────────
    defineField({
      name: "media",
      type: "array",
      group: "evidence",
      description:
        "Proof. Work with no interface (a service, a CLI, a bot) uses Terminal, API, Conversation or Architecture instead of a screenshot.",
      of: mediaMembers,
    }),
    defineField({ name: "caseStudy", type: "caseStudy", group: "evidence" }),
  ],
  preview: {
    select: { title: "title", ownership: "ownership", kicker: "kicker", media: "appIcon" },
    prepare: ({ title, ownership, kicker, media }) => ({
      title,
      subtitle: [ownership === "owned" ? null : ownership, kicker].filter(Boolean).join(" · "),
      media,
    }),
  },
});
