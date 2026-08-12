# Design system

Everything lives in **`src/styles/tokens.css`**. Tailwind v4 is CSS-first, so
that `@theme` block *is* the Tailwind theme — there is no `tailwind.config.js`
holding a second copy of the same values.

---

## The idea

Two grounds — **bone** and **ink** — and nothing else. The page alternates
between them in full-bleed bands, and that alternation is the primary structural
device: it separates campaign from commerce, and gives black garments a ground
to sit on rather than float against.

There is no brand accent. `--color-signal` is an ochre lifted from the painted
watch dial, and it appears in exactly two situations: focus rings and stock
state. It is never decorative. A palette this narrow is what keeps the
photography, rather than the interface, in the foreground.

---

## The two-ground contract

The single most useful thing in this codebase.

Any element declares which ground it sits on:

```html
<section data-ground="ink"> … </section>
```

Descendants using the ground-aware utilities invert automatically:

```
bg-ground   text-figure   text-figure-muted   border-rule
```

Under the hood, `[data-ground]` redefines `--ground`, `--figure`, `--rule` and
friends; `@theme` maps Tailwind's colour names onto those. Custom property
substitution is lazy, so `var(--color-figure)` resolves against the nearest
`[data-ground]` ancestor at use time.

**What this buys:**

- No `dark:` variants anywhere.
- `ProductCard`, `Button` and `Label` have one colour implementation and are
  correct on either ground.
- The header reads its own ground from an IntersectionObserver
  (`useHeaderState`) and stays legible as it crosses band boundaries.

**Rule:** never hard-code `text-[var(--color-ink)]` inside a reusable component.
Use `text-figure`. Page-level sections may name the literal, because they are the
things declaring the ground in the first place.

---

## Colour

| Token                  | Value     | Use                          |
| ---------------------- | --------- | ------------------------------ |
| `--color-bone`         | `#f6f1e9` | Light ground                   |
| `--color-bone-raised`  | `#fbf8f3` | Raised surface on bone         |
| `--color-bone-sunk`    | `#ebe5db` | Recessed surface, image wells  |
| `--color-ink`          | `#131313` | Dark ground                    |
| `--color-ink-raised`   | `#1d1d1f` | Cards on ink                   |
| `--color-graphite`     | `#46423c` | Body copy on bone              |
| `--color-smoke`        | `#7b756b` | Muted copy on bone             |
| `--color-chalk`        | `#a49d94` | Muted copy on ink              |
| `--color-bone-dim`     | `#cbc5bb` | Body copy on ink               |
| `--color-signal`       | `#b8934e` | Focus, stock state. Nothing else. |
| `--color-alert`        | `#9c4a35` | Form errors                    |

Bone and ink were sampled from the direction mockup rather than eyeballed —
`scripts/prepare-media.mjs` reports both when it runs.

**Contrast:** ink on bone is about 15.5:1, bone on ink about 15.5:1. Graphite on
bone ≈ 8.6:1, smoke on bone ≈ 4.6:1, chalk on ink ≈ 7.4:1. Muted tones are used
for annotation-scale text and clear AA at those sizes; body copy uses graphite
and bone-dim.

---

## Type

Two families, both variable, both self-hosted through `next/font`.

**Archivo** carries the whole identity. Loading its width axis alongside weight
is what makes the wordmark possible without a second display cut —
`.type-wordmark` sets `font-stretch: 112%`, doing the job a bespoke expanded
face would otherwise need to.

**JetBrains Mono** is reserved for text that is genuinely data: prices, SKUs,
indices, spec values. Using it anywhere else dilutes that signal. It is not
preloaded — nothing above the fold needs it.

### Scale

Fluid between a 360px phone and a 1920px desktop. Ratios tighten as sizes grow,
which stops large settings feeling bloated.

| Token              | Clamp                              | Role                     |
| ------------------ | ---------------------------------- | -------------------------- |
| `.type-wordmark`   | `23.2vw`                           | ATRIX. Edge to edge.      |
| `text-display-1`   | `clamp(2.75rem, 6.4vw, 6.5rem)`    | Page-opening statement    |
| `text-display-2`   | `clamp(2rem, 4vw, 3.75rem)`        | Section statement         |
| `text-h1`          | `clamp(1.75rem, 3vw, 2.75rem)`     | Page title                |
| `text-h2`          | `clamp(1.375rem, 2vw, 2rem)`       | Section heading           |
| `text-h3`          | `clamp(1.06rem, 1.35vw, 1.31rem)`  | Sub-heading               |
| `text-lead`        | `clamp(1.06rem, 1.25vw, 1.375rem)` | Standfirst                |
| `text-body`        | `0.9375rem`                        | Body                      |
| `.type-label`      | `0.6875rem`, `0.16em`              | Tracked caps              |
| `.type-micro`      | `0.625rem`, `0.2em`                | Annotations, indices      |
| `.type-data`       | mono, `0.06em`, tabular            | Prices, SKUs              |

Long-form text is capped at `--container-prose` (62ch). Editorial column width
is unreadable for a returns policy however good the typeface is.

---

## Space and grid

| Token                | Value                             | Role                        |
| -------------------- | --------------------------------- | ----------------------------- |
| `--spacing-gutter`   | `clamp(1.25rem, 4vw, 4rem)`       | Page margin — the air dial   |
| `--spacing-band`     | `clamp(4.5rem, 9vw, 10rem)`       | Standard section rhythm      |
| `--spacing-band-lg`  | `clamp(6.5rem, 13vw, 15rem)`      | Calm sections                |
| `--spacing-band-sm`  | `clamp(2.5rem, 5vw, 5rem)`        | Tight sections               |
| `--container-page`   | `1920px`                          | Max content width            |

Alternating `band` and `band-lg` is what produces the calm/impact pacing.

`.page-shell` centres content, applies the gutter and stops widening past
`--container-page`, so an ultrawide monitor gets margin rather than a stretched
12-column grid. Full-bleed bands still run edge to edge; only the content inside
is contained.

`.grid-12` is a 12-column grid with a `clamp(1rem, 1.5vw, 1.5rem)` gutter.

---

## Corners

There are none. `border-radius: 0` is set on `*` in the base layer so a stray
utility cannot quietly soften an edge. This is a deliberate identity choice, not
an oversight.

---

## Signature components

**The dashed rule.** The identity's graphic mark. Built from a
`repeating-linear-gradient` rather than `border-style: dashed`, because each
browser picks its own dash length and phase and this motif is too load-bearing to
leave to them. `.rule-dashed`, `.rule-dashed-v`.

**`.media-frame`.** Every photograph sits in a fixed-ratio frame that reserves
its space before the image decodes. This is the CLS defence.

**`.link-wipe`.** One underline behaviour for every inline link — wipes in from
the left, out to the right.

**`.grain`.** A single fixed layer over the document at 3.5% opacity. Static;
animating grain costs a full-viewport repaint per frame and buys almost nothing.
Removed entirely under reduced motion.

---

## Adding a token

1. Add it to `@theme` in `src/styles/tokens.css`.
2. If it has a JS counterpart (motion values do), mirror it in
   `src/motion/tokens.ts`.
3. Use the Tailwind utility it generates. Do not write the raw value again.

If you find yourself reaching for a value that isn't here, either it belongs
here, or the design is drifting.
