"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { searchProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { track } from "@/lib/analytics";
import { duration, ease, stagger } from "@/motion/tokens";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import { padIndex } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * The /search route.
 *
 * The overlay is the fast path; this is the linkable, indexable one — search
 * results people arrive at from outside the site, or land on with JavaScript
 * still loading. Same query logic, laid out as a page rather than a panel.
 */
export function SearchPanel({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => (query.trim() ? searchProducts(products, query) : products),
    [query, products],
  );

  useEffect(() => {
    if (!query.trim()) return;
    const id = window.setTimeout(
      () => track({ name: "search", query, resultCount: results.length }),
      600,
    );
    return () => window.clearTimeout(id);
  }, [query, results.length]);

  return (
    <>
      <div className="page-shell">
        <label htmlFor="search-field" className="sr-only">
          Search products
        </label>
        <input
          id="search-field"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          autoComplete="off"
          className="w-full bg-transparent py-6 text-display-2 font-medium tracking-[-0.03em] text-[var(--color-ink)] placeholder:text-[var(--color-smoke)] focus:outline-none"
        />
        <DashedRule className="text-[var(--color-ink)]" />
      </div>

      <div className="page-shell py-10" aria-live="polite">
        <Label className="mb-6 block">
          {query.trim()
            ? `${results.length} ${results.length === 1 ? "result" : "results"}`
            : "Everything"}
        </Label>

        {results.length === 0 ? (
          <div className="flex flex-col gap-3 py-10">
            <p className="text-h2 font-medium text-[var(--color-ink)]">
              No results for &ldquo;{query}&rdquo;.
            </p>
            <Link href="/shop" className="link-wipe type-label mt-2 w-fit">
              View everything &#8594;
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col">
            {results.map((product, i) => {
              const image = product.images[0];
              return (
                <motion.li
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: duration.base,
                    ease: ease.outExpo,
                    delay: Math.min(i * stagger.tight, 0.25),
                  }}
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="group flex items-center gap-5 py-5 transition-colors hover:bg-[var(--color-bone-sunk)]"
                  >
                    <span className="type-micro w-8 shrink-0 pl-1 text-[var(--color-smoke)]">
                      {padIndex(i + 1)}
                    </span>

                    <span className="relative h-24 w-16 shrink-0 overflow-hidden bg-[var(--color-bone-sunk)]">
                      {image ? (
                        <Image
                          src={image.src}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
                        />
                      ) : (
                        <span className="absolute inset-0 border border-dashed border-[var(--rule-strong)]" />
                      )}
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="type-label text-[var(--color-ink)]">{product.name}</span>
                      <span className="type-micro truncate text-[var(--color-smoke)]">
                        {product.tagline}
                      </span>
                    </span>

                    <span className="type-data shrink-0 pr-1 text-[var(--color-ink)]">
                      {formatMoney(product.price)}
                    </span>
                  </Link>
                  <div className="rule-solid" />
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
