# Reference teardown — four sites

Measured with Playwright (Chromium, 1440×900 and 390×844) on 2026-07-29. Every
number below is a **computed** value read off the live DOM, not a guess from a
screenshot. Raw dumps live in the session scratchpad as `audit/<site>.json` and
`audit/<site>.ax.json`.

Sites:

| key | url | scrollHeight @1440 | shape |
|---|---|---|---|
| `yevtam` | yevtam.com | **900px** | no-scroll view machine |
| `cogito` | cogito.md | 6134px | long-form product page |
| `interfaces` | interfaces.dev | 11622px | editorial magazine |
| `raja` | rajavijayaraman.com | 2030px | short personal index |

The single most important structural fact: **yevtam does not scroll.** Its
document height equals the viewport. Everything else here is a scrolling page.
That's the fork in the road for our own build, and we already took yevtam's.

---

## 1. yevtam.com — the view machine

### DOM / semantics

```
body[data-view="home"]
├── div.cursor-dot[data-cursor-dot]
└── div.page-shell
    ├── div.page-transition        ← SVG curtain, 8 named gradients in <defs>
    ├── header.page-header
    │   └── div.site-switcher      → theme button, audio player, about button
    ├── main.hero#about
    │   └── div.hero__content
    │       ├── div.hero__identity → avatar stack (light+dark img) + bubble + name
    │       ├── h1.hero__title     → line 1 + inline burst slot + line 2
    │       └── div.hero__mobile-apps  ← mobile-only launcher, mirrors the dock
    ├── section.project-screen
    │   └── article.project-screen__panel ×8   (staya, yandex, alrosa, ddb, bbdo, personal, aidev, about)
    └── nav.dock.wrapper
        └── div.dock__glass > ul.dock__track > li.dock__item ×10 + li.dock__divider
```

Accessibility tree is flat and honest — buttons are `button`, dock entries are
`link`, the burst slot is `role="button" tabindex="0"` named "Reveal skills".
There is **no `<h2>`–`<h6>` in the home view at all**; the only heading is the
`h1`. Panels are `<article>`, not `<section>`.

### Design tokens (read from `:root`)

```css
--page-bg:            #ececeb;
--page-fg:            #161616;
--muted:              rgba(22, 22, 22, 0.54);   /* 54% — not a grey hex */
--stack-accent:       #4f8dff;
--page-top-glow:      rgba(255, 255, 255, 0.72);

--glass-light:        #ffffff;
--glass-dark:         #000000;
--glass-tint:         #bbbbbc;
--glass-reflex-light: 1;
--glass-reflex-dark:  1;
--glass-saturation:   150%;

--dock-size:          54px;
--dock-gap:           8px;
--dock-radius:        23.5%;      /* percentage, so it scales with magnification */

--case-content-width: min(1120px, calc(100vw - 72px));
--case-section-gap:   64px;
--case-media-gap:     12px;
--case-logo-height:   80px;
--case-summary-width: 560px;
--case-gallery-radius: 10px;
```

Note `--page-bg: #ececeb` — a *warm-neutral off-white*, not white. And the muted
colour is an alpha of the foreground, so it stays correct when the theme flips.

### Type scale — DM Sans only (400 + 700)

| role | size | weight | line-height | letter-spacing | ratio |
|---|---|---|---|---|---|
| hero `h1` | 53.58px | 400 | 49.29px | normal | **0.92** |
| name | 17.92px | 400 | 19.71px | normal | 1.10 |
| chip / about | 12.8px | 400 | 12.8px | 0.128px | 1.00 |
| dock tooltip | 11.2px | 400 | 11.2px | 0.112px | 1.00 |

Two things worth stealing:

1. **Hero line-height is below 1** (0.92). That's what makes the display type
   read as a block rather than as sentences.
2. Every small label uses **line-height 1.0** and **letter-spacing 0.01em**
   (0.112/11.2 and 0.128/12.8 both = 0.01em exactly). Consistent ratio, not a
   consistent px value.

### Dock geometry

`--dock-size: 54px`, gap `8px`, plate padding `12px`, plate radius `22px`, tile
radius `23.5%`. Magnification is done with **width classes, not transforms**:

| state | width |
|---|---|
| `.nav-item.hover` | `calc(var(--dock-size) * 1.24)` |
| `.sibling-close` | `× 1.12` |
| `.sibling-far` | `× 1.04` |

transitioned over `width 0.45s cubic-bezier(0.16, 1, 0.3, 1)`. Because it's
width and not scale, neighbours are *pushed* rather than overlapped — that's the
macOS feel. Tooltip sits at `bottom: calc(100% + 18px)` and moves
`translateY(6px → -8px)` over 150ms.

Plate background measured live: `color-srgb(0.860 0.860 0.862 / 0.287)` —
i.e. **~29% opacity**, over `backdrop-filter: blur(10px) url(#glass-switcher-filter) saturate(150%)`.

### Curtain

Three paths in a 100×100 `viewBox`, `preserveAspectRatio="xMidYMin slice"`:

```
collapsed  M 0 100 V 100 Q 50 100 100 100 V 100 z
crest      M 0 100 V 50  Q 50 0   100 50  V 100 z
covered    M 0 100 V 0   Q 50 0   100 0   V 100 z
```

Timings: `openExpand 0.5 power2.in` → `openCover 0.5 power2.out` → apply view →
`coveredHold 0.12` → `fadeOut 1.1 power1.out`. Close is `0.5 + 0.5` with no fade.

Per-project fill, **separate value per theme**:

| view | light | dark |
|---|---|---|
| staya | `#BDBAB4` | `#5F5D5A` |
| yandex | `#E8B86D` | `#745C37` |
| alrosa | `#B4C9DF` | `#5A6570` |
| ddb | `#C9A86A` | `#655435` |
| bbdo | `#D4867D` | `#6A433F` |
| personal | `#8FB89A` | `#485C4D` |
| aidev | `#D4AF8F` | `#6B5D4F` |

Fallback when no tint matches: `rgba(255,255,255,0.88)` light / `rgba(18,17,16,0.88)` dark.

---

## 2. cogito.md — the product page

### Layout skeleton

```
div.relative.mx-auto.flex   max-width 1280px, padding 40px, flex-column
├── header   max-width 768px, flex row, space-between, align center, mb 48px
├── main.flex-1
│   ├── section  max-width 768px            ← hero
│   ├── section.flex.flex-col.gap-10  ×7    ← feature rows, gap 64px, full 1200px
│   └── section.py-14  max-width 768px      ← padding 72px 0
└── footer   max-width 768px, padding 24px 0, mt 56px
```

Two-track width system: **prose locks to 768px, media breaks out to 1200px.**
That's the whole trick of the page. Nested content narrows further — `max-w-xl`
(576px) and `max-w-md` (448px) for centred secondary copy.

### Tokens

```css
--canvas:      #fdfcfb;   /* warm off-white again — nobody uses #fff */
--panel:       #ffffffc7; /* 78% white */
--ink:         #1c1c1c;
--ink-strong:  #0a0a0a;
--ink-soft:    #5c5c5c;
--ink-muted:   #858585;
--accent:      #c45d2c;   /* burnt orange */
--accent-vivid:#d9621a;
--accent-hover:#a84e24;
--rule:        #0000000f; /* 6% black */
--rule-strong: #00000026; /* 15% black */
--focus:       #0006;
--shadow-window: 0 28px 80px -34px #00000029, 0 14px 32px -24px #00000024;
```

A **four-step ink ramp** (`strong → base → soft → muted`) and a **two-step rule
ramp**. Both are more disciplined than what we have.

### Type

System stack: `"SF Pro Text", "SF Pro", -apple-system, system-ui, Geist`, with
`SF Mono` for chrome. Body 16/24. Nav and buttons are **mono at 12/16** — that's
where the "built by a developer" flavour comes from. CTA 14/20 weight 500,
disclaimer 12/20.

Vertical rhythm: `gap-10` on feature sections computes to **64px**, section
padding `py-14` = **72px**, hero offset `mt-16 sm:mt-22`. Button padding `8px 16px`,
nav pill `6px 16px`, inline gaps `8px` / `10px` / `28px`.

---

## 3. interfaces.dev — the editorial one

### Layout

```
nav    max-width 760px, padding 0 20px  → 720px content, h-16 (64px)
main   max-width 760px, padding 96px 20px
  section.mt-24 ×N      ← 96px between sections
    h2  24/32  ls -0.3px
    div.grid  ← 2 × 350px, gap 20px   (or 3 × 240px for the logo wall)
```

Content column is **720px** — narrower than everyone else, because it's built
for reading. Cards are a flat `grid-template-columns: 350px 350px; gap: 20px`
with `border-radius: 8px`.

### Type — four families, deliberately

| family | use | metrics |
|---|---|---|
| `interVariable` | everything structural | body 18/28, h1 60/60 ls **−1.5px**, h2 24/32 ls −0.3px |
| `libreBaskerville` *italic* | emphasis inside prose | 18/28, inline |
| `berkeleyMono` | labels, box-drawing ornaments | 14/22.75 and 12/16 |
| `openRunde` | 500/600 accents | — |

The signature move: **serif italic set inline at the same size as the body sans**
("I think *a lot* about…"). Same size, same leading, different voice. And h1 at
60px with 60px leading — again ratio 1.0 for display type.

Colours are in `lab()`, no CSS variables at all (Tailwind v4 + oklch):
bg `#fcfcfc`, ink `lab(12.3 0 0)` ≈ `#1e1e1e`, secondary `lab(28.08 0 0)` ≈ `#414141`,
tertiary `lab(42.35 0 0)` ≈ `#636363`. Accent is a hot `#00A8FF`-ish blue on the
Subscribe pill.

The page also decorates itself with **fake design-tool chrome** — selection
handles, `294 × 58` dimension badges, `32 px` spacing markers, an
`oklch(0.991 0 0)` swatch chip. It's an editorial gag that doubles as the brand.

---

## 4. rajavijayaraman.com — the disciplined one

This is the most *portable* of the four. Its whole system fits in a screen.

```css
--color-bg:             #ffffff;
--color-text:           #333333;
--color-text-secondary: #555555;
--color-text-tertiary:  #777777;
--color-accent:         #1985F1;
--color-accent-soft:    #1985F118;   /* 9% — same hex + alpha suffix */
--color-border:         #e0e0e0;

--font-display: "Inter", -apple-system, sans-serif;
--font-body:    "Inter", -apple-system, sans-serif;
--font-mono:    "Roboto Mono", ui-monospace, monospace;

--space-xs:  0.5rem;   /*  8px */
--space-sm:  1rem;     /* 16px */
--space-md:  1.5rem;   /* 24px */
--space-lg:  3rem;     /* 48px */
--space-xl:  5rem;     /* 80px */
--space-2xl: 8rem;     /* 128px */

--max-width:      820px;
--max-width-wide: 1040px;
```

### Layout

```
div.top-controls   fixed, flex row, gap 8px, h 40px
main.container     max-width 820px, padding 0 24px  → 772px content
  section.hero     padding 128px 0 80px     (= --space-2xl / --space-xl)
  section          padding 80px 0           (= --space-xl)
    div.section-header   flex row, space-between, align **baseline**
    ul.writing-list      display grid, 1 col, gap 0
      a.item-link        flex row, space-between, align baseline, gap 24px, padding 16px 0
```

Every section uses exactly `--space-xl` (80px). The hero uses `2xl` on top only.
No other spacing value appears in the layout. That is the lesson.

### Type

| role | font | size | lh | ls | transform |
|---|---|---|---|---|---|
| hero `h1` | Inter 600 | ~64px | — | tight | uppercase |
| lead | Inter 500 | 19.2px | 32.64px (1.7) | normal | — |
| section label | Roboto Mono 400 | 12px | 20.4px | **1.44px (0.12em)** | uppercase |
| meta / date | Roboto Mono | 12px | 20.4px | 0.96px (0.08em) | uppercase |
| small link | Inter 400 | 13.6px | 23.12px | normal | — |

Body line-height is **1.7** — much airier than the others (yevtam 0.92 display /
cogito 1.5 / interfaces 1.56). It reads calm.

### The list row — worth copying verbatim

`a` is `display:flex; justify-content:space-between; align-items:baseline;
gap:24px; padding:16px 0;` with a bottom rule. Title left, mono date right,
baselines aligned. Rows are 56–59px tall. It's the cleanest index pattern of the
four and it needs no cards, no shadows, no images.

Signature motif: a solid **yellow circle** (~150px) sitting on the baseline
beside the name, and a `20px`-radius pill for the "HOUSE RULES" chip.

---

## 5. Cross-site synthesis

Things all four agree on:

1. **Nobody uses `#ffffff` for the page.** `#ececeb`, `#fdfcfb`, `#fcfcfc`, and
   raja's `#ffffff` only because it pairs with `#333` rather than `#000`.
2. **Mono for chrome, sans for content.** Labels, dates, nav, and badges are all
   monospace at 11–14px. Three of four do this.
3. **Uppercase micro-labels with 0.01–0.12em tracking**, line-height 1.0–1.2.
4. **Display type at line-height ≤ 1.0** (yevtam 0.92, interfaces 1.0).
5. **A single content column, 720–820px.** Media breaks out; text never does.
6. **One accent colour, used three or four times on the whole page.**
7. **A four-step ink ramp**, not two.
8. Theme toggle top-right, on every one of them.

Things they disagree on, where we've already picked:

| axis | yevtam | others | **ours** |
|---|---|---|---|
| navigation | dock, no scroll | scroll | dock, no scroll ✅ |
| sound | synthesized + soundtrack | none | synthesized, default off ✅ |
| imagery | heavy (60+ assets) | moderate | **none yet** ⚠️ |

---

## 6. Deltas to apply to wave-portfolio-v2

Keeping our current look — warm neutral, ocean-adjacent tiles, dock-first. These
are refinements, not a redesign.

**Type**
- Hero `line-height` → `0.92` (currently 0.98). Matches yevtam's block feel.
- Add a mono voice for chrome: kickers, stats labels, dock tooltips, dates.
  We load JetBrains Mono already and barely use it.
- Standardise micro-label tracking on `0.12em` uppercase (raja's value) instead
  of our current `0.14em`, and set their line-height to `1.0`.
- Body line-height `1.55` → `1.65` in `.prose` only. Panels read tight right now.

**Colour**
- Split `--ink-muted` into a proper four-step ramp: `ink-strong / ink / ink-soft
  / ink-muted`. We currently have three and the middle one does too much work.
- Derive muted tones as **alpha of the foreground** (yevtam's
  `rgba(22,22,22,0.54)`) so the dark theme stays correct without a second
  hand-tuned hex.
- Add a two-step rule ramp (`--rule` 6%, `--rule-strong` 15%) — our single
  `--line` is too heavy for internal dividers and too light for card borders.
- Pick one accent. We currently have none; every colour is in a tile gradient.

**Spacing**
- Adopt raja's named scale (`xs 8 / sm 16 / md 24 / lg 48 / xl 80 / 2xl 128`)
  and use `xl` for all section padding. Our panel padding is ad-hoc.
- Content column: ours was `64rem` (1024px). **Decided:** rather than raja's
  820px, use yevtam's own case tokens since we're keeping yevtam parity —
  `--content-width: min(1120px, calc(100vw - 72px))` for the track and
  `--summary-width: 560px` for prose. Same two-track idea as cogito, but the
  reference's actual numbers.

**Layout**
- Steal raja's list row (`flex`, `space-between`, `align-items: baseline`,
  `gap 24px`, `padding 16px 0`, bottom rule) for a "selected work" index on the
  home view. Right now home is hero-only and the dock is the sole navigation —
  a text index gives crawlers and keyboard users a second path.
- Panel stats grid → cogito's card treatment: `--rule` border, 8px radius,
  `--shadow-window` on hover only.

**Dock**
- Our tile radius is a fixed `1.15rem`; yevtam uses **`23.5%`** so the corner
  scales with magnification. Switch to the percentage.
- Our plate opacity is 55% light / 42% dark; measured yevtam is **~29%** with
  `saturate(150%)`. Ours is too solid — reduce and lean harder on the blur.

**Motion**

- Our curtain timings already match — leave it alone.
- ~~Add the `whiteBlend: 0.56` stage.~~ **Corrected:** `whiteBlend` is declared
  in yevtam's `TRANSITION` object (script.js:1074) and never read. Its
  `setOverlayFill` helper is only ever called with `"glass"` (lines 1114, 1338),
  so the white-wash stage does not exist at runtime. Nothing to port.

---

## 7. Icons — no skill exists for this

I checked the available skill list and the MCP tool surface. Findings:

| candidate | verdict |
|---|---|
| `mcp__claude_ai_Figma__download_assets` | Exports SVGs from an **existing Figma node**. We have no Figma file, so there is nothing to export. Would work if you first build the icons in Figma. |
| `mcp__figma-mcp-go__*` | Same — drives a Figma document you already have open. Could *author* icon shapes there via `create_ellipse` / `set_fills`, then export. Slow and indirect. |
| `mcp__Sanity__generate_image` | Raster, AI-generated, and writes into a Sanity document field. Wrong output type for UI icons. |
| `21st-cli-use` | Searches the 21st.dev catalog for React components/themes. Good for finding a component that *uses* icons; not an icon source. |

**There is no skill that downloads or generates an icon set.** Realistic options,
in the order I'd rank them:

1. **`lucide-react`** (npm, MIT, ~1500 outline icons). Right weight for the mono
   chrome we're adding — RSS, arrow, external-link, sun/moon, play/pause. One
   dependency, tree-shaken. This covers everything except the dock tiles.
2. **Dock tiles stay hand-authored.** yevtam's are bespoke 3D-rendered PNGs, one
   per project — not something an icon library provides. Our current approach
   (gradient plate + monogram) is a legitimate different answer and is already
   the closest thing we have to a brand. I'd keep it and refine the gradients
   rather than chase photoreal app icons.
3. If you *do* want real app-icon artwork, the path is Figma → build 7 tiles →
   `download_assets` to pull the SVGs. That's a design session, not a code task.

Recommendation: `lucide-react` for chrome icons, keep monogram tiles, revisit
bespoke artwork only if the monograms start feeling thin.

---

## 8. Resolved

- **Home stays yevtam.** No text index, no scroll. Verified after the refactor:
  `scrollHeight` 900 = viewport 900 at 1440×900, matching the reference exactly.
  The dock remains the only navigation.
- **Curtain untouched.** Timings already matched; the one thing I proposed
  adding turned out not to exist (see §6, Motion).
- **Column widths** settled on yevtam's tokens rather than raja's — see §6.

Still open:

- No case media. Everything above is typography and layout; it does not close
  the gap with a reference site carrying ~60 images per project.
- No accent colour chosen. All four references have exactly one; we still have
  none outside the tile gradients.
