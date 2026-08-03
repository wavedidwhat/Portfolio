# Sanity Studio — schema

Schema only. No Studio app is wired up yet and nothing has been pushed to the
dataset; these files are the reviewable artefact from
[`docs/SANITY-SCHEMA.md`](../docs/SANITY-SCHEMA.md).

Project: **Portfolio** `k8n4gdum`, dataset `production` (public ACL).

## Shape

```
project      every piece of work; owned / contract / employed via `ownership`
indexPage    a page that lists projects (Product engineering, Freelance, …)
about        singleton
siteSettings singleton — hero copy, dock socials
```

Objects: `outcome`, `link`, `entry`, `caseStudy`, `caseStudyChapter`, `social`,
plus ten `media*` types.

## Decisions worth knowing

**`ownership` is a field, not a convention.** Whether something is yours, a
contract or a job used to live in prose and a group string. It's the claim most
worth keeping accurate, so it's enumerated and required.

**Index rows are references.** `entry.project` points at the document; title,
date, mark and colour all resolve from it. Only `group` and an optional blurb
override live on the row.

**Media is ten object types, not one.** One object with every field optional
would show an editor thirty inputs of which three apply, and validation could
never help. Each kind carries only its own fields.

**`appIcon` and `markSrc` are different things.** One is a complete square icon
drawn full-bleed; the other is a glyph that sits on the tile colour, contained.
They are not interchangeable — a 27×34 logotype stretched as an appIcon looks
broken.

**Colours use the `color` type.** Hex in a string field arrives with a missing
`#` eventually, and the transition maths fails silently to `NaN`.

**No `tint` field.** It's derived from `brandColor` at runtime; storing it
invites the two drifting apart.

## To stand this up

```bash
npm create sanity@latest -- --project k8n4gdum --dataset production
npm i @sanity/color-input          # required: the color type is used throughout
```

Register in `sanity.config.ts`:

```ts
import { colorInput } from "@sanity/color-input";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  projectId: "k8n4gdum",
  dataset: "production",
  plugins: [structureTool(), colorInput()],
  schema: { types: schemaTypes },
});
```

`about` and `siteSettings` need singleton treatment in the desk structure, and
their create/delete actions removed.

## Then, in order

1. Deploy the schema. Don't touch the app.
2. Migrate `data/site.ts` with a one-off script. 21 views is small enough to
   check by eye afterwards.
3. Add `lib/content.ts` returning the same shapes the components already use.
4. Swap the imports. **If a component needs editing, the schema is wrong** —
   fix the schema rather than reshaping the UI around the CMS.
