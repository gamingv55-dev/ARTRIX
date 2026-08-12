# ATRIX

Storefront for ATRIX — an independent apparel label in Varna, Bulgaria. Original
hand-drawn artwork, screen-printed in editions of fifty on 240 GSM oversized cotton.

Next.js App Router, TypeScript, Tailwind v4. Editorial front end over a commerce
data layer built to be swapped for a real backend without touching the UI.

---

## Quick start

```bash
npm install
npm run media     # generates public/media from _source-assets (first run only)
npm run dev
```

Open http://localhost:3000.

| Script             | What it does                                                  |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Dev server with fast refresh                                   |
| `npm run build`    | Production build (also runs the type check)                    |
| `npm start`        | Serve a production build                                       |
| `npm run typecheck`| `tsc --noEmit`                                                 |
| `npm test`         | Vitest, once                                                   |
| `npm run test:watch` | Vitest, watching                                             |
| `npm run media`    | Regenerate web images + blur placeholders from `_source-assets` |

Node 20 or newer.

---

## Stack, and why each piece is here

| Dependency        | Why it earns its place                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 15**    | App Router. Pages are server components; only genuinely interactive parts ship JavaScript. Gives image optimisation, metadata and SSG. |
| **React 19**      | —                                                                                                                                       |
| **TypeScript**    | `strict` plus `noUncheckedIndexedAccess`, which is what catches the missing-image and empty-array cases in a catalogue this small.      |
| **Tailwind v4**   | CSS-first. The design tokens *are* the Tailwind theme — one `@theme` block, no `tailwind.config.js` duplicating values.                 |
| **Motion**        | Page transitions, reveals, layout animation, springs. The whole motion system is built on it.                                           |
| **Lenis**         | Smooth scroll. Off for touch and reduced-motion.                                                                                        |
| **Zustand**       | Cart and flight state. ~1 KB, and the cart needs to be readable from the header, the product page and the drawer at once.               |
| **sharp**         | Build-time only. Generates the image derivatives and LQIPs.                                                                             |
| **Vitest**        | Build-time only.                                                                                                                        |

### Deliberately not used

- **Three.js / React Three Fiber** — the one WebGL effect is a single textured
  quad. A scene graph, camera and renderer would cost ~150 KB to draw two
  triangles. It is ~230 lines of raw WebGL2 instead, dynamically imported, so it
  costs nothing on any route that does not use it.
- **GSAP / ScrollTrigger** — the two scroll set pieces are a sticky frame and a
  horizontal rail. `position: sticky` and a native `overflow-x` scroller do both,
  keep touch momentum and keyboard access, and do not hijack the wheel.
- **clsx / tailwind-merge** — a six-line `cn()` in `src/lib/utils.ts` covers
  every use here.
- **A UI component library** — nothing in this design survives contact with one.

---

## Project structure

```
_source-assets/        Original camera + design files. Committed, never served.
scripts/
  prepare-media.mjs    Generates public/media and the media manifest.
public/media/          Generated web images. Do not edit by hand.
docs/                  Architecture, design system, motion, product management…
src/
  app/                 Routes. Server components unless marked otherwise.
    api/newsletter/    Route handler (mock — see docs/architecture.md).
  components/
    ui/                Primitives: Media, Reveal, Button, Rule, Label, Magnetic…
    layout/            Header, Footer, AppShell, transitions, boot sequence.
    product/           Card, rail, grid, gallery, purchase controls, accordion.
    commerce/          Bag button, cart drawer, add-to-bag flight.
    overlay/           Search overlay, filter bar.
    cursor/            Custom cursor.
    visual/            HeroCanvas — the WebGL layer.
  sections/            Page-level compositions (home/, shop/, search/).
  data/                THE CATALOG. products.ts, drops.ts, lookbook.ts.
    generated/         media.ts — written by npm run media.
  lib/                 catalog, money, cart-store, analytics, seo, utils.
  motion/              tokens.ts + variants.ts. The motion system.
  hooks/               Preferences, magnetic, drag-scroll, UI, header state.
  shaders/             GLSL source.
  styles/              tokens.css (@theme) + globals.css.
  types/               Domain types.
  config/              site.ts — brand constants and navigation.
```

---

## Adding a product

Everything about a piece lives in **`src/data/products.ts`**. Nothing is
hard-coded in a component.

1. Drop the photographs into `_source-assets/`.
2. Register them in `scripts/prepare-media.mjs` (add entries to `jobs`), then run
   `npm run media`.
3. Copy an existing entry in `src/data/products.ts`, change the fields, add it to
   the array.

The shop grid, drop rail, search, related products, sitemap and Product
structured data all pick it up with no further changes.

Full walkthrough, including crops and stock: **[docs/product-management.md](docs/product-management.md)**.

---

## Images

Originals go in `_source-assets/`; `npm run media` writes web-sized WebP
derivatives to `public/media/` and a manifest with dimensions and blur
placeholders to `src/data/generated/media.ts`.

Crops are defined as fractions of the source in `scripts/prepare-media.mjs`, so
they survive a re-export at a different resolution. Never edit
`src/data/generated/media.ts` by hand.

---

## Motion

Two files define the system: **`src/motion/tokens.ts`** (durations, easing,
springs, stagger, viewport thresholds) and **`src/motion/variants.ts`** (the
reusable variant sets). The CSS half mirrors them in `src/styles/tokens.css`.

No component writes a raw duration or curve. `prefers-reduced-motion` is honoured
throughout, and every reveal resolves to its finished state rather than being
cancelled part-way.

Reasoning behind the curve and duration choices: **[docs/motion.md](docs/motion.md)**.

---

## WebGL

One effect, one place: the hero photograph.
`src/shaders/hero.ts` holds the GLSL, `src/components/visual/HeroCanvas.tsx` owns
the context and loop. It applies a sub-one-percent displacement — a slow drift
plus a cursor-following pull — with chromatic split scaled by the displacement.

It only runs when reduced motion is off, a fine pointer exists, the viewport is
desktop-sized, and a WebGL2 context can be created. It is dynamically imported,
suspends when off-screen or in a background tab, caps DPR at 1.5, and falls back
to the static `<Image>` — which is the LCP element in every case — on any failure.

To change the effect, edit the fragment shader. To disable it entirely, remove
the `<HeroCanvas>` block from `src/sections/home/Hero.tsx`; nothing else depends on it.

---

## Environment variables

Copy `.env.example` to `.env.local`. Only `NEXT_PUBLIC_*` values reach the
browser — never prefix a secret with it.

| Variable                        | Purpose                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Canonical origin for metadata, sitemap, OG, structured data.    |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `"true"` to dispatch events. Off by default; `track()` no-ops.  |

Commented-out entries in `.env.example` show where provider keys go.

---

## What is real and what is not

Honest about its seams. Three things are deliberately unfinished, each marked in
code with a `MOCK BOUNDARY` comment:

| Area          | State                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- |
| **Cart**      | Real. Correct arithmetic, stock clamping, persisted to localStorage. No server-side reservation. |
| **Checkout**  | Not implemented. The button is disabled and says so rather than pretending.                     |
| **Newsletter**| Form and route handler are real; nothing is stored or forwarded. No provider connected.          |

Two of the four Drop 01 pieces are placeholders with no photography. They render
as typographic *in production* cards and are not purchasable — no invented
product photos anywhere in this repo.

Where to connect each: **[docs/architecture.md](docs/architecture.md)**.

---

## Deployment

Vercel is the path of least resistance — zero config, and the image optimiser and
route handlers work as-is.

```bash
npm run build && npm start   # verify a production build locally first
```

Set `NEXT_PUBLIC_SITE_URL` to the real origin before shipping, or canonical URLs,
the sitemap and Open Graph images will all point at the default.

Details, including self-hosting and the caching model: **[docs/deployment.md](docs/deployment.md)**.

---

## Documentation

| Document                                                   | Covers                                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)               | Data layer, mock boundaries, replacing the catalog, adding checkout. |
| [docs/design-system.md](docs/design-system.md)             | Tokens, the two-ground colour contract, type scale, grid.            |
| [docs/motion.md](docs/motion.md)                           | Motion language, curve choices, interaction tiers.                   |
| [docs/product-management.md](docs/product-management.md)   | Adding, editing and retiring products, step by step.                 |
| [docs/performance.md](docs/performance.md)                 | Budgets, image pipeline, what is lazy and why.                       |
| [docs/deployment.md](docs/deployment.md)                   | Hosting, environment, caching, pre-launch checklist.                 |
