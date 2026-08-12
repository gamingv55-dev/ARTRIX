/**
 * ═══════════════════════════════════════════════════════════════════════
 * THE PRODUCT CATALOG
 *
 * This is the only file you edit to add, change or retire a piece. Nothing
 * about a product is hard-coded in a component — name, price, copy, sizes,
 * stock and photography all originate here.
 *
 * TO ADD A PIECE
 *   1. Put the photographs in _source-assets/
 *   2. Register them in scripts/prepare-media.mjs and run `npm run media`
 *   3. Copy an entry below, change the fields, add it to the array
 *
 * The shop grid, drop rail, search, sitemap, structured data and related
 * products all pick it up automatically. Full walkthrough with examples:
 * docs/product-management.md
 * ═══════════════════════════════════════════════════════════════════════
 */

import { media } from "./generated/media";
import type { Product, ProductVariant, SizeCode } from "@/types";

/** Every piece ships in the same size run, so the list is declared once. */
const SIZE_RUN: SizeCode[] = ["S", "M", "L", "XL", "XXL"];

const BLACK = { code: "black", name: "Black", hex: "#141414" } as const;

/**
 * Expands a per-size stock count into variant records.
 * Keeping SKUs derived rather than hand-written means they can never drift
 * out of sync with the size run.
 */
function buildVariants(
  skuBase: string,
  colorCode: string,
  stock: Partial<Record<SizeCode, number>>,
): ProductVariant[] {
  return SIZE_RUN.map((size) => ({
    sku: `${skuBase}-${colorCode.toUpperCase()}-${size}`,
    size,
    colorCode,
    inventory: stock[size] ?? 0,
  }));
}

export const products: Product[] = [
  /* ─────────────────────────────────────────────────────────────────────
     01 — GRILLZ TEE
     ───────────────────────────────────────────────────────────────────── */
  {
    id: "atx-01-grillz",
    slug: "grillz-tee-black",
    name: "Grillz Tee",
    tagline: "Halftone mouth, screen-printed front.",
    description: [
      "A photographic mouth broken down into a coarse halftone until the teeth read as pure dot pattern. Printed large and slightly off-centre on the chest so the image distorts as the garment moves.",
      "Cut oversized with a dropped shoulder and a wide body. The 240 GSM cotton is heavy enough to hold its shape through the print and soften rather than thin out with washing.",
    ],
    price: { amount: 7900, currency: "BGN" },
    status: "available",
    category: "t-shirt",
    dropId: "drop-01",
    featured: true,
    editionSize: 50,
    releasedAt: "2026-07-18",
    images: [
      {
        ...media["grillz-portrait"],
        alt: "Grillz Tee in black, worn front-on, showing the halftone mouth print across the chest.",
        role: "front",
      },
      {
        ...media["grillz-worn"],
        alt: "Full-length view of the Grillz Tee in black, worn with washed denim shorts.",
        role: "worn",
        caption: "Oversized fit / size L on 186 cm",
      },
      {
        ...media["grillz-print"],
        alt: "Close detail of the halftone mouth print, showing the dot structure of the screen print.",
        role: "detail",
        caption: "Print detail / coarse halftone",
      },
      {
        ...media["grillz-worn-wide"],
        alt: "The Grillz Tee photographed on location in Varna.",
        role: "worn",
      },
    ],
    colors: [BLACK],
    sizes: SIZE_RUN,
    variants: buildVariants("ATX01G", "black", { S: 6, M: 14, L: 16, XL: 10, XXL: 4 }),
    specs: [
      { label: "Weight", value: "240 GSM" },
      { label: "Composition", value: "100% combed cotton" },
      { label: "Fit", value: "Oversized, dropped shoulder" },
      { label: "Print", value: "Water-based screen print" },
      { label: "Edition", value: "50 pieces" },
      { label: "Made in", value: "Bulgaria" },
    ],
    care: [
      "Wash inside out at 30°C",
      "Do not tumble dry",
      "Iron on reverse, never directly on the print",
      "No bleach",
    ],
  },

  /* ─────────────────────────────────────────────────────────────────────
     02 — ROMAN TEE
     ───────────────────────────────────────────────────────────────────── */
  {
    id: "atx-01-roman",
    slug: "roman-tee-black",
    name: "Roman Tee",
    tagline: "Hand-painted dial across the back.",
    description: [
      "A wristwatch painted by hand in gouache, then reproduced at full scale across the back panel. The brush marks, the bleed at the bracelet links and the single blue second hand are all reproduced from the original painting rather than redrawn as vector.",
      "The front is left blank. The piece is meant to be read from behind.",
    ],
    price: { amount: 7900, currency: "BGN" },
    status: "available",
    category: "t-shirt",
    dropId: "drop-01",
    featured: true,
    editionSize: 50,
    releasedAt: "2026-07-18",
    images: [
      {
        ...media["roman-worn"],
        alt: "Roman Tee in black, seen from behind, showing the hand-painted watch across the back panel.",
        role: "back",
      },
      {
        ...media["roman-still"],
        alt: "The Roman Tee laid over a wire chair, back panel facing out.",
        role: "still",
      },
      {
        ...media["roman-print"],
        alt: "Close detail of the hand-painted watch dial, showing brush texture and Roman numerals.",
        role: "detail",
        caption: "Print detail / painted in gouache",
      },
    ],
    colors: [BLACK],
    sizes: SIZE_RUN,
    // XXL has sold through. Left at zero rather than removed so the size
    // selector can show it struck out, which reads as scarcity, not error.
    variants: buildVariants("ATX01R", "black", { S: 5, M: 12, L: 18, XL: 15, XXL: 0 }),
    specs: [
      { label: "Weight", value: "240 GSM" },
      { label: "Composition", value: "100% combed cotton" },
      { label: "Fit", value: "Oversized, dropped shoulder" },
      { label: "Print", value: "Back panel, water-based screen print" },
      { label: "Artwork", value: "Gouache on paper, 2026" },
      { label: "Edition", value: "50 pieces" },
    ],
    care: [
      "Wash inside out at 30°C",
      "Do not tumble dry",
      "Iron on reverse, never directly on the print",
      "No bleach",
    ],
  },

  /* ─────────────────────────────────────────────────────────────────────
     03–04 — ANNOUNCED, NOT YET SHOT

     Placeholders with no photography. They render as typographic cards in
     the grid and the rail, and they are not purchasable. Delete them, or
     promote them by adding images and switching status to "available".
     ───────────────────────────────────────────────────────────────────── */
  {
    id: "atx-01-third",
    slug: "third-piece",
    name: "Piece 03",
    tagline: "In production.",
    description: ["Artwork finished. Sampling now. Announced when it ships."],
    price: { amount: 7900, currency: "BGN" },
    status: "in-production",
    category: "t-shirt",
    dropId: "drop-01",
    editionSize: 50,
    images: [],
    colors: [BLACK],
    sizes: SIZE_RUN,
    variants: buildVariants("ATX01T", "black", {}),
    specs: [
      { label: "Weight", value: "240 GSM" },
      { label: "Edition", value: "50 pieces" },
    ],
    care: [],
  },
  {
    id: "atx-01-fourth",
    slug: "fourth-piece",
    name: "Piece 04",
    tagline: "In production.",
    description: ["Artwork finished. Sampling now. Announced when it ships."],
    price: { amount: 7900, currency: "BGN" },
    status: "in-production",
    category: "t-shirt",
    dropId: "drop-01",
    editionSize: 50,
    images: [],
    colors: [BLACK],
    sizes: SIZE_RUN,
    variants: buildVariants("ATX01F", "black", {}),
    specs: [
      { label: "Weight", value: "240 GSM" },
      { label: "Edition", value: "50 pieces" },
    ],
    care: [],
  },
];
