import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
import { schemaTypes } from "./sanity/schemaTypes";
import { dataset, projectId } from "./lib/sanity.env";

/** about and siteSettings are singletons: one document each, no create/delete. */
const SINGLETONS = new Set(["about", "siteSettings"]);

export default defineConfig({
  name: "default",
  title: "wavedidwhat portfolio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site settings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.listItem()
              .title("About")
              .child(S.document().schemaType("about").documentId("about")),
            S.divider(),
            S.documentTypeListItem("indexPage").title("Index pages"),
            S.documentTypeListItem("project").title("Projects"),
          ]),
    }),
    visionTool(),
    colorInput(),
  ],
  schema: {
    types: schemaTypes,
    // hide the singletons from the global "create new" menu
    templates: (prev) => prev.filter((t) => !SINGLETONS.has(t.schemaType)),
  },
  document: {
    actions: (input, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? input.filter(({ action }) => action !== "unpublish" && action !== "delete" && action !== "duplicate")
        : input,
  },
});
