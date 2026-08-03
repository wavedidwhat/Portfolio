import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Ten media kinds, each its own object type.
 *
 * The alternative — one `media` object with every field optional — would give an
 * editor thirty inputs of which three apply, and validation could never tell
 * them which. Separate types mean each form shows only what that kind needs, and
 * `required()` actually means something.
 */

const label = defineField({
  name: "label",
  title: "Caption",
  type: "string",
  description: "Shown under the block. Also used as the placeholder text when the asset is missing.",
});

export const mediaSite = defineType({
  name: "mediaSite",
  title: "Live site",
  type: "object",
  fields: [
    defineField({
      name: "screenshot",
      type: "image",
      options: { hotspot: true },
      description: "Leave empty to render a designed 'screenshot pending' placeholder.",
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "url",
      description: "Makes the device clickable. Omit rather than pointing at a page that 404s.",
    }),
    defineField({
      name: "device",
      type: "string",
      initialValue: "browser",
      options: {
        list: [
          { title: "Browser window", value: "browser" },
          { title: "Laptop", value: "laptop" },
          { title: "Phone (iPhone 17 Pro Max)", value: "phone" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "live",
      title: "Embed the real page",
      type: "boolean",
      initialValue: false,
      description:
        "Only works if the target sends Content-Security-Policy: frame-ancestors permitting this site. Third-party sites will refuse and render blank — leave off for those.",
    }),
    label,
  ],
  preview: {
    select: { title: "label", media: "screenshot", subtitle: "href" },
    prepare: ({ title, media, subtitle }) => ({
      title: title || "Live site",
      subtitle: subtitle || "no link",
      media,
    }),
  },
});

export const mediaFlow = defineType({
  name: "mediaFlow",
  title: "Flow (stepped walkthrough)",
  type: "object",
  fields: [
    label,
    defineField({
      name: "steps",
      type: "array",
      validation: (r) => r.min(2).error("A flow needs at least two steps."),
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "screenshot", type: "image", options: { hotspot: true } }),
          ],
          preview: { select: { title: "label", media: "screenshot" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "label", steps: "steps" },
    prepare: ({ title, steps }) => ({
      title: title || "Flow",
      subtitle: `${steps?.length ?? 0} steps`,
    }),
  },
});

export const mediaVideo = defineType({
  name: "mediaVideo",
  title: "Video / Loom",
  type: "object",
  fields: [
    defineField({ name: "url", title: "Embed URL", type: "url" }),
    defineField({ name: "file", type: "file", options: { accept: "video/*" } }),
    defineField({ name: "poster", type: "image" }),
    label,
  ],
  validation: (r) =>
    r.custom((v: { url?: string; file?: unknown } = {}) =>
      Boolean(v.url) === Boolean(v.file) ? "Give either an embed URL or a file, not both." : true,
    ),
  preview: { select: { title: "label", subtitle: "url", media: "poster" } },
});

export const mediaFigma = defineType({
  name: "mediaFigma",
  title: "Figma",
  type: "object",
  fields: [
    defineField({ name: "embedUrl", type: "url", description: "Share → Embed in Figma." }),
    label,
  ],
  preview: { select: { title: "label", subtitle: "embedUrl" } },
});

export const mediaImage = defineType({
  name: "mediaImage",
  title: "Image",
  type: "object",
  fields: [defineField({ name: "image", type: "image", options: { hotspot: true } }), label],
  preview: { select: { title: "label", media: "image" } },
});

export const mediaBrand = defineType({
  name: "mediaBrand",
  title: "Brand sheet",
  type: "object",
  description: "Swatches and type specimen, generated from the project's own colours.",
  fields: [label],
  preview: { select: { title: "label" }, prepare: ({ title }) => ({ title: title || "Brand sheet" }) },
});

export const mediaTerminal = defineType({
  name: "mediaTerminal",
  title: "Terminal session",
  type: "object",
  fields: [
    label,
    defineField({
      name: "lines",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "comment", type: "string", description: "Rendered dim, prefixed with #." }),
            defineField({ name: "cmd", title: "Command", type: "string", description: "Rendered after a $ prompt." }),
            defineField({ name: "out", title: "Output", type: "text", rows: 3 }),
          ],
          preview: {
            select: { cmd: "cmd", out: "out", comment: "comment" },
            prepare: ({ cmd, out, comment }) => ({
              title: cmd ? `$ ${cmd}` : comment ? `# ${comment}` : out?.split("\n")[0],
              subtitle: cmd ? out?.split("\n")[0] : undefined,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "label", lines: "lines" },
    prepare: ({ title, lines }) => ({
      title: title || "Terminal",
      subtitle: `${lines?.length ?? 0} lines`,
    }),
  },
});

export const mediaApi = defineType({
  name: "mediaApi",
  title: "API call",
  type: "object",
  fields: [
    label,
    defineField({
      name: "request",
      type: "object",
      fields: [
        defineField({
          name: "method",
          type: "string",
          initialValue: "POST",
          options: { list: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        }),
        defineField({ name: "path", type: "string", validation: (r) => r.required() }),
        defineField({ name: "body", type: "text", rows: 6 }),
      ],
    }),
    defineField({
      name: "response",
      type: "object",
      fields: [
        defineField({
          name: "status",
          type: "number",
          initialValue: 200,
          validation: (r) => r.required().min(100).max(599),
        }),
        defineField({ name: "note", type: "string", description: "Short word beside the status, e.g. 'queued'." }),
        defineField({ name: "body", type: "text", rows: 6 }),
      ],
    }),
  ],
  preview: {
    select: { title: "label", method: "request.method", path: "request.path" },
    prepare: ({ title, method, path }) => ({
      title: title || "API call",
      subtitle: [method, path].filter(Boolean).join(" "),
    }),
  },
});

export const mediaChat = defineType({
  name: "mediaChat",
  title: "Conversation (bot / AI)",
  type: "object",
  fields: [
    label,
    defineField({
      name: "messages",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "from",
              type: "string",
              initialValue: "user",
              options: {
                list: [
                  { title: "User", value: "user" },
                  { title: "Bot", value: "bot" },
                  { title: "Tool call / system", value: "tool" },
                ],
                layout: "radio",
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required() }),
            defineField({ name: "meta", type: "string", description: "Small label above, e.g. 'parsed'." }),
          ],
          preview: {
            select: { from: "from", text: "text" },
            prepare: ({ from, text }) => ({ title: text, subtitle: from }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "label", messages: "messages" },
    prepare: ({ title, messages }) => ({
      title: title || "Conversation",
      subtitle: `${messages?.length ?? 0} messages`,
    }),
  },
});

export const mediaArch = defineType({
  name: "mediaArch",
  title: "Architecture",
  type: "object",
  fields: [
    label,
    defineField({
      name: "tiers",
      type: "array",
      description: "Drawn left to right, with arrows between.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "nodes", type: "array", of: [{ type: "string" }] }),
          ],
          preview: {
            select: { title: "label", nodes: "nodes" },
            prepare: ({ title, nodes }) => ({ title, subtitle: nodes?.join(", ") }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "label", tiers: "tiers" },
    prepare: ({ title, tiers }) => ({
      title: title || "Architecture",
      subtitle: `${tiers?.length ?? 0} tiers`,
    }),
  },
});

export const mediaTypes = [
  mediaSite, mediaFlow, mediaVideo, mediaFigma, mediaImage,
  mediaBrand, mediaTerminal, mediaApi, mediaChat, mediaArch,
];

/** every media kind, for use in an array field */
export const mediaMembers = mediaTypes.map((t) => defineArrayMember({ type: t.name }));
