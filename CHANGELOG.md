# Changelog

Notable changes to the ATRIX storefront. Newest first.

---

## [0.1.0] — 2026-08-13

First build. Editorial storefront over a commerce data layer.

### Added

**Foundation**
- Next.js 15 App Router, React 19, TypeScript (`strict` + `noUncheckedIndexedAccess`)
- Tailwind v4, CSS-first — design tokens are the theme, no `tailwind.config.js`
- Two-ground colour contract (`data-ground="bone" | "ink"`): components invert
  automatically, no `dark:` variants anywhere
- Archivo (variable, width axis) + JetBrains Mono, self-hosted via `next/font`
- Build-time media pipeline: `npm run media` derives web images, art-directed
  crops and LQIPs from originals, plus a typed manifest

**Commerce**
- Product/variant/drop data model, shaped like a commerce API rather than the UI
- Async catalog access layer — the seam for swapping in Shopify or Medusa
- Cart keyed by SKU, integer minor-unit money, stock clamping, localStorage
- Cart drawer, add-to-bag arc animation, bag reaction
- Shop with expanding filter panel and client-side sort
- Product page: sticky buy column beside a scrolling gallery
- Search as both a ⌘K overlay and a linkable `/search` route

**Pages**
- Home (hero → drop rail → editorial → print study → pieces)
- Shop, product, drop, lookbook, about, search
- Size guide, shipping, terms, privacy
- Designed 404 and error boundary

**Motion**
- Centralised token + variant system; no raw durations or curves in components
- House reveal: `clip-path` frame wipe with the image settling from overscale
- Route transitions, line-masked headings, magnetic controls, custom cursor
- `prefers-reduced-motion` honoured throughout — reveals resolve to their
  finished state rather than being cancelled

**Visual layer**
- WebGL hero displacement in raw WebGL2 (~230 lines, no Three.js), dynamically
  imported, capability-gated, suspended off-screen, falling back to the static
  image on any failure

**Production concerns**
- Metadata, Open Graph, canonicals, sitemap, robots
- Product / CollectionPage / Organization / BreadcrumbList structured data
- Centralised analytics abstraction, no-op until a provider is configured
- 42 tests across money, cart and catalog, including integrity checks
- README plus six documents in `docs/`

### Known gaps

Each marked `MOCK BOUNDARY` in the source. See `docs/architecture.md`.

- **Checkout is not implemented.** The button is disabled and says so.
- **Newsletter stores nothing.** Form and route handler are real; no provider.
- **Inventory is static.** Stock is edited in `src/data/products.ts`, not
  decremented by orders.
- **Two of four Drop 01 pieces are placeholders** with no photography. They
  render as typographic *in production* cards. No invented product photos exist
  in this repository.
- **A second colourway needs UI.** The data model supports multiple colours;
  `ProductPurchase` currently reads `colors[0]`.
- **`/terms` and `/privacy` are unreviewed drafts** and carry a notice saying so.
- **Company registration number is a placeholder** in `src/config/site.ts`.

### Open question

The catalog treats the halftone-mouth graphic and the painted-watch graphic as
two products. If they are one garment printed front and back, merging them is a
few lines in `src/data/products.ts` — steps in `docs/product-management.md`.
