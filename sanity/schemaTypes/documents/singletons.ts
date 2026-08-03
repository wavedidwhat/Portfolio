import { defineArrayMember, defineField, defineType } from "sanity";

/** The about page. Exactly one — enforced by the desk structure, not by type. */
export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "avatar", type: "image", options: { hotspot: true } }),
    defineField({
      name: "statement",
      type: "text",
      rows: 4,
      description: "The opening line, set large.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      description: "Runs in two columns under the statement.",
    }),
    defineField({ name: "stack", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] }),
    defineField({
      name: "featured",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
      description: "The expand-on-hover strip, in order. Five works well; more gets cramped.",
      validation: (r) => r.max(6).warning("More than six cards leaves each one too narrow to read."),
    }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});

/** Site-wide bits: the hero, the dock's social tail. Also exactly one. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "handle", type: "string" }),
    defineField({
      name: "titleLines",
      type: "array",
      of: [{ type: "string" }],
      description: "The hero headline, one entry per line.",
      validation: (r) => r.min(1).max(3),
    }),
    defineField({
      name: "highlightWords",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Words in the headline that get the highlighter swipe. Matched case- and punctuation-insensitively.",
    }),
    defineField({ name: "blurb", type: "text", rows: 3 }),
    defineField({ name: "email", type: "string" }),
    defineField({
      name: "bubbles",
      type: "array",
      of: [{ type: "string" }],
      description: "Lines the avatar says on hover, cycled in order.",
    }),
    defineField({ name: "socials", type: "array", of: [defineArrayMember({ type: "social" })] }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
