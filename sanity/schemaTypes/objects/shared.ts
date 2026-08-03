import { defineArrayMember, defineField, defineType } from "sanity";

export const outcome = defineType({
  name: "outcome",
  title: "Outcome",
  type: "object",
  description: "A proof point. Short value, short label — these render as a stat band.",
  fields: [
    defineField({ name: "value", type: "string", validation: (r) => r.required().max(14) }),
    defineField({ name: "label", type: "string", validation: (r) => r.required().max(34) }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "url", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

/**
 * A row on an index page.
 *
 * `project` is a reference, not copied text: the title, date, mark and colour
 * all resolve from the referenced document. Duplicating them here would mean
 * two places to edit and one to forget.
 */
export const entry = defineType({
  name: "entry",
  title: "Entry",
  type: "object",
  fields: [
    defineField({
      name: "project",
      type: "reference",
      to: [{ type: "project" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "group",
      type: "string",
      description:
        "Filter bucket on this page. Lives on the entry, not the project, so the same project can be filed differently on two indexes.",
    }),
    defineField({
      name: "blurbOverride",
      type: "string",
      description: "Optional. Defaults to the project's own first line.",
    }),
  ],
  preview: {
    select: { title: "project.title", subtitle: "group", media: "project.appIcon" },
  },
});

export const caseStudyChapter = defineType({
  name: "caseStudyChapter",
  title: "Chapter",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "Small label above the heading, e.g. 'the problem'.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 5 })],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "media",
      type: "array",
      description: "Evidence for this chapter specifically, shown inline.",
      of: [], // filled in schemaTypes/index.ts to avoid a circular import
    }),
  ],
  preview: { select: { title: "title", subtitle: "label" } },
});

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case study",
  type: "object",
  fields: [
    defineField({
      name: "premise",
      type: "text",
      rows: 3,
      description: "One line framing why this is worth reading.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "chapters",
      type: "array",
      of: [defineArrayMember({ type: "caseStudyChapter" })],
      validation: (r) => r.min(2).error("One chapter isn't a case study."),
    }),
  ],
  preview: {
    select: { chapters: "chapters", premise: "premise" },
    prepare: ({ chapters, premise }) => ({
      title: "Case study",
      subtitle: `${chapters?.length ?? 0} chapters — ${premise?.slice(0, 48) ?? ""}`,
    }),
  },
});

export const social = defineType({
  name: "social",
  title: "Social link",
  type: "object",
  fields: [
    defineField({ name: "id", type: "string", description: "Matches the icon key in code (github, youtube, email).", validation: (r) => r.required() }),
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "url", validation: (r) => r.required() }),
    defineField({ name: "tileColor", type: "color" }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const sharedTypes = [outcome, link, entry, caseStudyChapter, caseStudy, social];
