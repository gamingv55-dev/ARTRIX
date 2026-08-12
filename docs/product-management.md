# Managing products

Everything about a piece lives in **`src/data/products.ts`**. Nothing is
hard-coded in a component. Change a name, a price, a photograph or a stock count
in that one file and the shop grid, drop rail, search, related products, sitemap
and Product structured data all follow.

---

## Adding a product

### 1. Put the photographs in `_source-assets/`

Originals, full resolution, any format sharp can read (JPEG, PNG, WebP, TIFF).

This folder **is committed**. It is the only copy of the brand's photography that
the build depends on — `npm run media` regenerates every shipped image from it,
so a clone without it cannot rebuild the site. It is never served: nothing
outside `public/` is.

Name them so the job list stays readable:

```
src-<piece>-<shot>.webp     e.g. src-vertex-front.webp
```

### 2. Register them in `scripts/prepare-media.mjs`

Add entries to the `jobs` array:

```js
{ id: "vertex-front", from: "src-vertex-front.webp" },
{ id: "vertex-worn",  from: "src-vertex-worn.webp" },
{
  id: "vertex-print",
  from: "src-vertex-front.webp",
  crop: { left: 0.31, top: 0.40, width: 0.46, height: 0.25 },
},
```

`crop` is optional and expressed as **fractions of the source** (0–1), so a
re-export at a different resolution does not break it. Omit it for a full frame.

Then:

```bash
npm run media
```

That writes `public/media/<id>.webp` and regenerates
`src/data/generated/media.ts` with dimensions and a blur placeholder for each.
**Never edit that generated file by hand.**

### 3. Add the entry to `src/data/products.ts`

Copy an existing product and change the fields:

```ts
{
  id: "atx-01-vertex",
  slug: "vertex-tee-black",          // becomes /product/vertex-tee-black
  name: "Vertex Tee",
  tagline: "One line of editorial voice.",   // cards, search, meta description
  description: [
    "First paragraph.",
    "Second paragraph.",
  ],
  price: { amount: 7900, currency: "BGN" },  // MINOR UNITS — 7900 = 79.00 BGN
  status: "available",
  category: "t-shirt",
  dropId: "drop-01",
  featured: true,
  editionSize: 50,
  releasedAt: "2026-08-01",
  images: [
    {
      ...media["vertex-front"],       // dimensions + blur come from the manifest
      alt: "Vertex Tee in black, worn front-on.",
      role: "front",
    },
    {
      ...media["vertex-print"],
      alt: "Close detail of the print.",
      role: "detail",
      caption: "Print detail",
    },
  ],
  colors: [BLACK],
  sizes: SIZE_RUN,
  variants: buildVariants("ATX01V", "black", { S: 6, M: 14, L: 16, XL: 10, XXL: 4 }),
  specs: [
    { label: "Weight", value: "240 GSM" },
    { label: "Composition", value: "100% combed cotton" },
  ],
  care: ["Wash inside out at 30°C"],
}
```

That is the whole job. No component changes.

---

## Field reference

| Field           | Notes                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `id`            | Stable, internal. Never appears in a URL.                                     |
| `slug`          | The URL. Changing it breaks existing links — add a redirect if it is live.    |
| `tagline`       | One line. Shown on cards, in search results, and in the meta description.     |
| `description`   | Array of paragraphs, plain text, no markup.                                   |
| `price.amount`  | **Integer, minor units.** `7900` is 79.00 BGN. Never a decimal.               |
| `status`        | See below.                                                                    |
| `images[0]`     | The card image and the flight source. Choose it deliberately.                 |
| `images[1]`     | The hover-swap image. Omit it and the card simply does not swap.              |
| `images[].role` | `front` / `back` / `worn` / `detail` / `still`. `detail` gets a 5:4 frame.    |
| `images[].alt`  | Required, and tested. Describe the garment, not the photograph.               |
| `editionSize`   | Shown on the product page. The positioning depends on this being true.        |
| `featured`      | Sorts first under the default "Featured" order.                               |
| `releasedAt`    | ISO date. Drives "Newest" sort and structured data.                           |

### `status`

| Value            | Behaviour                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `available`      | Buyable, if stock exists.                                                   |
| `sold-out`       | Shown and reachable, not buyable. Stays in the grid as proof of scarcity.   |
| `in-production`  | No photography yet. Renders as a typographic card. Not buyable.             |
| `archived`       | Reachable by URL, excluded from every listing and the sitemap.              |

**Sold-out is derived, not declared.** `purchaseState()` in
`src/lib/catalog.ts` computes it from real inventory, so setting every size to
`0` marks a piece sold out regardless of what `status` says. This is deliberate:
a catalog edit that empties the stock can never leave a live buy button on the
page. There is a test for it.

---

## Stock

`buildVariants(skuBase, colorCode, stock)` expands a per-size count into variant
records with generated SKUs, so SKUs can never drift out of sync with the size
run.

```ts
variants: buildVariants("ATX01R", "black", { S: 5, M: 12, L: 18, XL: 15, XXL: 0 }),
```

A size at `0` — or simply omitted — shows in the selector **struck through** and
disabled. It is left visible on purpose: for an edition of fifty, "the XXL has
gone" is information worth showing, and a size run with gaps reads as scarcity
rather than as a bug.

To sell out a size, set it to `0`. To sell out a piece, set them all to `0`.

Stock is **not** decremented by orders — there is no backend. It is a static
number you edit. See `docs/architecture.md` for where real inventory connects.

---

## Adding a colourway

Colours are separate options on one product, not separate products:

```ts
const ECRU = { code: "ecru", name: "Ecru", hex: "#e8e2d5" } as const;

colors: [BLACK, ECRU],
variants: [
  ...buildVariants("ATX01V", "black", { S: 6, M: 14, L: 16 }),
  ...buildVariants("ATX01V", "ecru",  { S: 4, M: 10, L: 12 }),
],
```

The shop's colour facet picks it up automatically.

> **Note:** the size selector currently reads `product.colors[0]`. A product with
> two colourways needs a colour selector wiring into
> `src/components/product/ProductPurchase.tsx` — the data layer already supports
> it, the UI does not yet.

---

## Opening a new drop

1. Add a `Drop` entry to `src/data/drops.ts`.
2. Point `site.currentDropSlug` in `src/config/site.ts` at the new slug.
3. Give the new products that `dropId`.
4. Set the old drop's products to `archived` if they should leave the listings.

The home page, the header link and `/drop/[slug]` all follow from `currentDropSlug`.

---

## The two placeholder pieces

`Piece 03` and `Piece 04` in `src/data/products.ts` are `in-production` with no
images. They exist so the drop reads as a real release rather than two lonely
products.

**Delete them** once you have real pieces, or promote them by adding photographs
and switching status to `available`.

They contain no invented photography, which is the point — a stock image standing
in for a garment would undermine the only claim the label makes.

---

## If the two tees are actually one shirt

The catalog currently treats the halftone-mouth graphic and the painted-watch
graphic as **two products**. If they are in fact one garment printed front and
back, merge them:

1. Delete the `atx-01-roman` entry.
2. Move its images into `atx-01-grillz`'s `images` array — `roman-worn` with
   `role: "back"`, `roman-print` with `role: "detail"`.
3. Rename the piece to whatever the shirt is actually called.
4. Update `src/data/lookbook.ts` so its `productSlug` references point at the
   surviving slug.

Nothing else changes. Five files reference product slugs and four of them are
data.

---

## Checklist before publishing a piece

- [ ] `npm run media` has run and the manifest is committed
- [ ] Every image has real `alt` text describing the garment
- [ ] Price is in minor units
- [ ] Stock reflects what actually exists
- [ ] `slug` is final — it is the URL
- [ ] `npm test` passes (catalog integrity tests cover unique slugs and SKUs)
