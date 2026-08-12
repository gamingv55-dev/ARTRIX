"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { Product } from "@/types";

/**
 * Fires the product_view event.
 *
 * Split into its own component so the product page can stay a server
 * component — this is the only thing on it that needs an effect, and it
 * renders nothing.
 */
export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    track({ name: "product_view", product });
  }, [product]);

  return null;
}
