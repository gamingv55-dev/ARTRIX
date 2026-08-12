/**
 * Drops are the unit ATRIX releases in. A drop owns the editorial copy and
 * the campaign frame; the pieces inside it point back via `Product.dropId`.
 *
 * To open a new drop: add an entry here, set `site.currentDropSlug` in
 * src/config/site.ts, and give the new products its `dropId`.
 */

import { media } from "./generated/media";
import type { Drop } from "@/types";

export const drops: Drop[] = [
  {
    id: "drop-01",
    slug: "01",
    number: "01",
    title: "Drop 01",
    subtitle: "Original artwork, fifty pieces per design",
    statement: [
      "Every graphic in this drop started as a physical object — a photograph pushed through a halftone until it fell apart, a watch painted in gouache on paper.",
      "Nothing was generated. Nothing was licensed. Fifty pieces are made of each design, and when they are gone the screen is retired.",
    ],
    season: "Varna 2026",
    releasedAt: "2026-07-18",
    cover: {
      ...media["editorial-street"],
      alt: "Drop 01 campaign frame, photographed on location in Varna.",
      role: "worn",
    },
  },
];
