/**
 * The lookbook is a sequence, not a gallery — the order and the scale of each
 * frame are the composition. `scale` drives how much of the grid a frame takes,
 * and alternating the values is what gives the page its pacing.
 */

import { media } from "./generated/media";
import type { LookbookFrame } from "@/types";

export const lookbook: LookbookFrame[] = [
  {
    id: "lb-01",
    image: {
      ...media["grillz-worn-wide"],
      alt: "Full-length frame on location in Varna, Grillz Tee worn with washed denim.",
      role: "worn",
    },
    productSlug: "grillz-tee-black",
    scale: "tall",
    caption: "Grillz Tee — Black",
  },
  {
    id: "lb-02",
    image: {
      ...media["roman-still"],
      alt: "The Roman Tee laid over a wire chair outside a storefront.",
      role: "still",
    },
    productSlug: "roman-tee-black",
    scale: "inset",
    caption: "Roman Tee — off body",
  },
  {
    id: "lb-03",
    image: {
      ...media["roman-worn"],
      alt: "Roman Tee seen from behind, the painted watch filling the back panel.",
      role: "back",
    },
    productSlug: "roman-tee-black",
    scale: "full",
    caption: "Back panel / painted in gouache",
  },
  {
    id: "lb-04",
    image: {
      ...media["grillz-print"],
      alt: "Macro detail of the halftone mouth print.",
      role: "detail",
    },
    productSlug: "grillz-tee-black",
    scale: "wide",
    caption: "Halftone at 1:1",
  },
  {
    id: "lb-05",
    image: {
      ...media["grillz-portrait"],
      alt: "Portrait frame, Grillz Tee worn front-on.",
      role: "front",
    },
    productSlug: "grillz-tee-black",
    scale: "tall",
    caption: "Grillz Tee — Black",
  },
];
