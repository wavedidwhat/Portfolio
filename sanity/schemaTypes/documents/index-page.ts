import { defineArrayMember, defineField, defineType } from "sanity";

/** A page that lists projects: Product engineering, Freelance, Open source. */
export const indexPage = defineType({
  name: "indexPage",
  title: "Index page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "label", type: "string", description: "Dock tooltip." }),
    defineField({ name: "kicker", type: "string" }),
    defineField({ name: "period", type: "string" }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
    }),
    defineField({
      name: "entries",
      type: "array",
      of: [defineArrayMember({ type: "entry" })],
      description:
        "Rows resolve from the referenced project. Filters appear automatically once there is more than one group and enough rows to warrant them.",
    }),
    defineField({ name: "brandColor", type: "color" }),
    defineField({ name: "tileColor", type: "color" }),
    defineField({ name: "inDock", type: "boolean", initialValue: true }),
    defineField({ name: "dockOrder", type: "number" }),
  ],
  preview: {
    select: { title: "title", entries: "entries" },
    prepare: ({ title, entries }) => ({ title, subtitle: `${entries?.length ?? 0} entries` }),
  },
});
