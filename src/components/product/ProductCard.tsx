"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { purchaseState } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { duration, ease } from "@/motion/tokens";
import { cn, padIndex } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  /** Position in the list, rendered as the 01/04 index. */
  index?: number;
  total?: number;
  sizes: string;
  priority?: boolean;
  /** Suppress navigation when a rail drag ends on top of the card. */
  onNavigateGuard?: () => boolean;
  className?: string;
}

/**
 * A piece, as it appears in a rail or a grid.
 *
 * Three states, one component:
 *   buyable / sold-out  — photography, with the second shot revealed on hover
 *   unreleased          — no photography exists, so the card becomes
 *                         typographic: a dashed frame around the index and a
 *                         production note
 *
 * The unreleased treatment is the honest option. A blurred placeholder or a
 * stock image pretending to be a product would undermine the one claim the
 * whole label rests on, which is that everything here is real and made in
 * fifty pieces.
 *
 * The hover swap crossfades a second shot rather than replacing the src, so
 * there is no flash of empty frame while the second image decodes.
 */
export function ProductCard({
  product,
  index,
  total,
  sizes,
  priority = false,
  onNavigateGuard,
  className,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const state = purchaseState(product);

  const primary = product.images[0];
  // Only a genuinely different second shot earns the hover swap. Falling back
  // to the primary would cross-fade an image with itself.
  const secondary = product.images[1];

  const indexLabel =
    index != null ? `${padIndex(index + 1)}${total ? ` / ${padIndex(total)}` : ""}` : null;

  /* ── Unreleased: typographic card ─────────────────────────────────── */
  if (state === "unreleased" || !primary) {
    return (
      <article className={cn("flex flex-col", className)}>
        <div
          className="relative flex items-center justify-center border border-dashed border-[var(--rule-strong)]"
          style={{ aspectRatio: "2 / 3" }}
        >
          <span className="type-micro rotate-[-90deg] whitespace-nowrap text-[var(--figure-muted)]">
            In production
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="type-micro text-[var(--figure-muted)]">{indexLabel}</span>
          <span className="type-micro flex-1 truncate text-[var(--figure-muted)]">
            {product.name}
          </span>
          <span className="type-data text-[var(--figure-muted)]">&#8212;</span>
        </div>
      </article>
    );
  }

  /* ── Released ─────────────────────────────────────────────────────── */
  const soldOut = state === "sold-out";

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        onClick={(e) => {
          if (onNavigateGuard?.()) e.preventDefault();
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={`${product.name}${soldOut ? ", sold out" : `, ${formatMoney(product.price)}`}`}
        className="media-frame block focus-visible:outline-offset-[-2px]"
        style={{ aspectRatio: "2 / 3" }}
      >
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={primary.blurDataURL ? "blur" : "empty"}
          blurDataURL={primary.blurDataURL}
          className={cn(
            "object-cover drag-none transition-transform duration-[1100ms] ease-[var(--ease-out-expo)]",
            hovered && "scale-[1.04]",
            soldOut && "opacity-60",
          )}
        />

        {secondary && (
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: duration.slow, ease: ease.outQuart }}
          >
            <Image
              src={secondary.src}
              alt=""
              aria-hidden="true"
              fill
              sizes={sizes}
              loading="lazy"
              className={cn(
                "object-cover drag-none transition-transform duration-[1100ms] ease-[var(--ease-out-expo)]",
                hovered && "scale-[1.04]",
              )}
            />
          </motion.div>
        )}

        {soldOut && (
          <span className="absolute top-3 left-3 bg-[var(--color-ink)] px-2.5 py-1.5 type-micro text-[var(--color-bone)]">
            Sold out
          </span>
        )}
      </Link>

      {/* Caption row. Mono for the index and price — those are data; the name
          is not. */}
      <div className="mt-3 flex items-baseline justify-between gap-3">
        {indexLabel && (
          <span className="type-micro shrink-0 text-[var(--figure-muted)]">{indexLabel}</span>
        )}
        <h3 className="type-micro flex-1 truncate text-[var(--figure)]">
          {product.name} &#8212; {product.colors[0]?.name}
        </h3>
        <span
          className={cn(
            "type-data shrink-0",
            soldOut ? "text-[var(--figure-muted)]" : "text-[var(--figure)]",
          )}
        >
          {soldOut ? "Sold out" : formatMoney(product.price)}
        </span>
      </div>
    </article>
  );
}
