"use client";

import { AnimatePresence, motion } from "motion/react";
import { duration, ease } from "@/motion/tokens";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

/**
 * The shop grid.
 *
 * Deliberately not uniform: the first piece of each group of five takes two
 * columns and a wider crop, which breaks the catalogue rhythm and gives the
 * page a focal point. A grid where every cell is identical reads as inventory;
 * this reads as a spread.
 *
 * Cards animate position with `layout` so filtering rearranges the grid rather
 * than blinking a new one into place.
 */
export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 py-24">
        <p className="text-h2 text-[var(--figure)]">Nothing matches that.</p>
        <p className="text-sm max-w-[36ch] text-[var(--figure-muted)]">
          Drop 01 is small on purpose. Clear a filter to see the rest of it.
        </p>
      </div>
    );
  }

  return (
    <motion.ul
      layout
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-y-20",
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product, i) => {
          const isFeature = i % 5 === 0;

          return (
            <motion.li
              key={product.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: duration.fast } }}
              transition={{
                duration: duration.slow,
                ease: ease.outExpo,
                delay: Math.min(i * 0.05, 0.3),
              }}
              className={cn(isFeature && "col-span-2 lg:col-span-2")}
            >
              <ProductCard
                product={product}
                index={i}
                total={products.length}
                priority={i < 2}
                sizes={
                  isFeature
                    ? "(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                }
              />
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}
