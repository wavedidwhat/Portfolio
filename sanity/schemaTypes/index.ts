import { mediaMembers, mediaTypes } from "./objects/media";
import { caseStudyChapter, sharedTypes } from "./objects/shared";
import { project } from "./documents/project";
import { indexPage } from "./documents/index-page";
import { about, siteSettings } from "./documents/singletons";

/*
 * A chapter can carry the same media kinds a project can, but declaring that in
 * shared.ts would import media.ts, which would import shared.ts back. Filling
 * the array here breaks the cycle without duplicating the list.
 */
(caseStudyChapter.fields.find((f) => f.name === "media") as { of: unknown[] }).of = mediaMembers;

export const schemaTypes = [
  project,
  indexPage,
  about,
  siteSettings,
  ...sharedTypes,
  ...mediaTypes,
];
