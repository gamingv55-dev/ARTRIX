"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { findVariant, LOW_STOCK_THRESHOLD, purchaseState } from "@/lib/catalog";
import { useCartStore } from "@/lib/cart-store";
import { useFlightStore } from "@/lib/flight-store";
import { track } from "@/lib/analytics";
import { duration, ease } from "@/motion/tokens";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { measureFlightSource } from "./ProductGallery";
import type { Product, SizeCode } from "@/types";

/**
 * Size selection and add-to-bag.
 *
 * Sizes that are out of stock stay visible and struck through rather than
 * being removed — for an edition of fifty, "the L has gone" is information
 * worth showing, and a size run with gaps in it reads as scarcity rather than
 * as a bug.
 *
 * The add action does three things in order: launch the image flight from the
 * gallery's first frame, commit the line to the cart, and open the drawer once
 * the flight is roughly home. The drawer is delayed deliberately — opening it
 * immediately would cover the animation it is supposed to be the payoff for.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState<SizeCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.open);
  const launch = useFlightStore((s) => s.launch);

  const state = purchaseState(product);
  const color = product.colors[0];
  const selectedVariant = size && color ? findVariant(product, size, color.code) : undefined;

  if (state === "unreleased") {
    return (
      <div className="border border-dashed border-[var(--rule-strong)] p-6">
        <Label tone="strong">Not released</Label>
        <p className="text-sm mt-3 text-[var(--figure-muted)]">
          Artwork is finished and sampling is under way. Subscribe below and you will hear when
          it ships.
        </p>
      </div>
    );
  }

  if (state === "sold-out") {
    return (
      <div className="border border-[var(--rule-strong)] p-6">
        <Label tone="strong">Sold out</Label>
        <p className="text-sm mt-3 text-[var(--figure-muted)]">
          All {product.editionSize} pieces are gone. This screen has been retired and the design
          will not be reprinted.
        </p>
      </div>
    );
  }

  function handleAdd() {
    if (!size || !color) {
      setError("Choose a size first");
      return;
    }
    const variant = findVariant(product, size, color.code);
    if (!variant || variant.inventory <= 0) {
      setError("That size has gone");
      return;
    }

    setError(null);

    const image = product.images[0];
    const rect = measureFlightSource();
    if (rect && image) {
      launch(
        { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        { src: image.src, alt: image.alt },
      );
    }

    const line = {
      sku: variant.sku,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      colorName: color.name,
      quantity: 1,
      unitPrice: product.price,
      image: image
        ? {
            src: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
            blurDataURL: image.blurDataURL,
          }
        : { src: "", alt: "", width: 0, height: 0 },
    };

    addLine(line, variant.inventory);
    track({ name: "add_to_cart", line });

    // Roughly the flight duration — the drawer arrives as the image lands.
    window.setTimeout(openCart, 720);
  }

  const lowStock =
    selectedVariant && selectedVariant.inventory > 0 && selectedVariant.inventory <= LOW_STOCK_THRESHOLD;

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="sr-only">Select a size</legend>
        <div className="mb-3 flex items-baseline justify-between">
          <Label tone="strong" as="span">
            Size
          </Label>
          <a href="/size-guide" className="link-wipe type-micro text-[var(--figure-muted)]">
            Size guide
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const variant = color ? findVariant(product, s, color.code) : undefined;
            const available = (variant?.inventory ?? 0) > 0;
            const selected = size === s;

            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                disabled={!available}
                aria-pressed={selected}
                aria-label={`Size ${s}${available ? "" : ", sold out"}`}
                className={cn(
                  "relative min-w-[3.25rem] border px-4 py-3 type-label transition-colors",
                  "duration-[var(--dur-fast)] ease-[var(--ease-out-expo)]",
                  selected
                    ? "border-[var(--figure)] bg-[var(--figure)] text-[var(--ground)]"
                    : "border-[var(--rule-strong)] text-[var(--figure)] hover:border-[var(--figure)]",
                  !available && "cursor-not-allowed border-[var(--rule)] text-[var(--figure-muted)] hover:border-[var(--rule)]",
                )}
              >
                {s}
                {!available && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 top-1/2 h-px -rotate-[24deg] bg-[var(--figure-muted)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <Button fullWidth onClick={handleAdd} disabled={!size}>
          {size ? "Add to bag" : "Select a size"}
        </Button>

        {/* Reserved height so the layout doesn't jump when a message appears. */}
        <div className="mt-3 min-h-[1.25rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease: ease.outExpo }}
                className="type-micro text-[var(--color-alert)]"
              >
                {error}
              </motion.p>
            ) : lowStock ? (
              <motion.p
                key="low"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.fast, ease: ease.outExpo }}
                className="type-micro text-[var(--color-signal)]"
              >
                {selectedVariant?.inventory} left in {size}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
