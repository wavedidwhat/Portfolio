# Sanity schema plan

Planning only — no Studio, no client, nothing installed yet. This maps the
content model as it now exists in [`data/site.ts`](../data/site.ts) onto Sanity
documents and objects, and flags the places where a straight translation would
be wrong.

Project ref (from memory of the wave-hq setup): `dobzgffdscywegcuytcb` is
**Supabase**, not Sanity — a Sanity project will need creating separately.

---

## 1. What's actually in the model today

| shape | count | where |
|---|---|---|
| `View` | 20 | the unit of navigation: index, project, or about |
| `Media` | 10 kinds | site, flow, video, figma, image, brand, terminal, api, chat, arch |
| `Entry` | 16 | a row on an index page, pointing at another view |
| `CaseStudy` | 1 | premise + ordered chapters, each with its own media |

`View` is doing three jobs at once — it's a nav item, a page, and a content
record. That's fine in a typed file; it's a problem in a CMS, where an editor
picking "create → View" has no idea which of the three they're making.

---

## 2. Document types

Split `View` by its `kind`, because the three have almost disjoint fields.

### `project`
The main one. Everything that is or was a piece of work.

```
title            string          required
slug             slug            source: title, required
label            string          dock/tooltip name, defaults to title
kicker           string          "Product — live", "Role — contract"
role             string
period           string          free text: "2025 — now", "a few months", "TBC"
ownership        string          list: owned | contract | employed     ← NEW, see §4
brandColor       color           the identity colour (curtain, arch nodes)
tileColor        color           the dock face; often but not always brandColor
appIcon          image           a complete square icon, drawn full-bleed
markSrc          image           a glyph-only logo, sits on the tile
inDock           boolean         default false
dockOrder        number          only meaningful when inDock
outcomes         array[outcome]  value + label pairs
body             array[text]     paragraphs; first renders as the lead
stack            array[string]
links            array[link]
media            array[media]    the polymorphic bit — see §3
caseStudy        caseStudy       optional, single object
```

### `index`
Product engineering, Freelance, Open source. A page that lists projects.

```
title, slug, label, kicker, brandColor, tileColor, inDock, dockOrder
body             array[text]
entries          array[entryRef]
```

### `about`
Exactly one. Enforce with a singleton (`__experimental_actions` minus create/delete).

```
name, role, avatar, statement (text), body array[text], stack, links
featured         array[reference → project]   the About carousel, ordered
```

### `siteSettings`
Also a singleton — the bits currently sitting in the `site` export.

```
name, handle, titleLines array[string], highlightWords array[string],
blurb, email, bubbles array[string], socials array[social]
```

---

## 3. `media` — the part that needs care

Ten kinds with almost no overlapping fields. **Do not** model this as one object
with every field optional; an editor would face thirty inputs of which three
apply, and validation couldn't help them.

Model each kind as its own object type and let the array accept all of them:

```js
defineField({
  name: 'media',
  type: 'array',
  of: [
    { type: 'mediaSite' }, { type: 'mediaFlow' }, { type: 'mediaVideo' },
    { type: 'mediaFigma' }, { type: 'mediaImage' }, { type: 'mediaBrand' },
    { type: 'mediaTerminal' }, { type: 'mediaApi' },
    { type: 'mediaChat' }, { type: 'mediaArch' },
  ],
})
```

Each with only its own fields, and a `preview` so the array is readable:

| object | fields |
|---|---|
| `mediaSite` | `screenshot` image, `href` url, `device` (browser/laptop/phone), `live` bool, `label` |
| `mediaFlow` | `steps[]` of `{ screenshot, label }`, `label` |
| `mediaVideo` | `url` (Loom) **or** `file`, `poster` image, `label` |
| `mediaFigma` | `embedUrl`, `label` |
| `mediaImage` | `image`, `label` |
| `mediaBrand` | `label` — swatches derive from the parent project |
| `mediaTerminal` | `lines[]` of `{ cmd, out, comment }`, `label` |
| `mediaApi` | `request{method,path,body}`, `response{status,body,note}`, `label` |
| `mediaChat` | `messages[]` of `{ from: user\|bot\|tool, text, meta }`, `label` |
| `mediaArch` | `tiers[]` of `{ label, nodes[] }`, `label` |

`live: true` needs a warning in its description: it only works where the target
sends `frame-ancestors` permitting this origin.

---

## 4. Where a direct translation would be wrong

**1. `entries` should be references, not copies.**
Today an index row duplicates the project's title and blurb as strings. In
Sanity that's two places to edit and one to forget. Model as:

```
entry = { project: reference → project, blurbOverride?: string, group: string }
```

Title, meta and mark all resolve from the referenced project. `group` stays on
the entry, because the same project could be filed differently on two indexes.

**2. `ownership` should be a field, not a convention.**
Right now "is this mine or a client's?" is encoded in prose and in the `group`
string. That's exactly the claim you don't want drifting — make it an
enumerated field and derive the grouping and kicker from it.

**3. Colour: use the `color` type, not strings.**
`@sanity/color-input`. Hex strings in a text field will get pasted with
inconsistent case, `#` omitted, or a stray space, and the curtain maths
(`parseInt(hex.slice(1), 16)`) fails silently to `NaN`.

**4. Icons are two different things.**
`appIcon` (complete square, full-bleed) and `markSrc` (glyph, sits on the tile)
render differently and are not interchangeable — Mintro's 27×34 leaf stretched
badly as an appIcon. Keep them as separate fields with descriptions saying so,
not one "icon" field.

**5. Don't model `tint`.**
It's already derived from `brandColor` at runtime. Storing it invites the two
drifting apart.

**6. `period` stays a string.**
"a few months", "TBC", "current" are all legitimate. A date range would force
false precision.

---

## 5. Validation worth adding

- `slug` required + unique on `project` and `index`
- exactly one `about` and one `siteSettings` (singletons)
- `inDock: true` requires `dockOrder`
- `mediaVideo` requires `url` XOR `file`
- `body` min length 1 on `project`
- warn (don't block) when a `project` has no `appIcon` and no `markSrc` — it
  sorts to the bottom of an index by design, but the editor should know
- `caseStudy.chapters` min 2 — one chapter isn't a case study

---

## 6. Migration path

1. Create the Sanity project + dataset; add `@sanity/color-input`.
2. Write the schemas above; deploy; **don't** touch the app yet.
3. Write a one-off script that reads `data/site.ts` and posts documents via
   `@sanity/client`. 20 views is small enough to verify by eye afterwards.
4. Add a `lib/content.ts` that returns the same shapes the components already
   consume, backed by GROQ. Components shouldn't change at all — if they do,
   the schema is wrong.
5. Swap the import in `Shell`/`Panel`/`Dock` from `@/data/site` to
   `@/lib/content`. Keep `data/site.ts` around one release as a fallback.

Step 4 is the checkpoint: if the components need edits, stop and fix the schema
rather than reshaping the UI around the CMS.

---

## 7. Open questions

- **Draft/publish for a portfolio?** Probably yes — placeholder projects
  (Peeksy, Pulse) shouldn't be publicly visible while their copy says
  `PLACEHOLDER`. A `published` boolean is simpler than perspectives if the site
  stays statically generated.
- **Does the dock come from Sanity, or stay in code?** It's 10 items and rarely
  changes; making it editable adds a failure mode (an empty dock) for little
  gain. My inclination is to leave `inDock`/`dockOrder` in Sanity but validate
  that at least one project has `inDock: true`.
- **ISR or full rebuild on publish?** With `output: standalone` on RDK, a
  webhook triggering a rebuild is simpler than wiring revalidation.
