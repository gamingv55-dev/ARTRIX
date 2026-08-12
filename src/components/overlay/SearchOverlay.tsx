"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { track } from "@/lib/analytics";
import { overlayPanel } from "@/motion/variants";
import { duration, ease, stagger } from "@/motion/tokens";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "@/hooks/use-ui";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import { cn, padIndex } from "@/lib/utils";
import type { Product } from "@/types";

const SUGGESTIONS = ["Grillz", "Roman", "Black", "Drop 01"];

/**
 * Full-screen search.
 *
 * Results are computed synchronously against the in-memory catalog, so there
 * is no loading state to design around and no debounce to tune — the list
 * updates on the keystroke. If the catalog ever moves behind a network call,
 * the debounce and pending state belong here and nowhere else.
 *
 * Keyboard is a first-class input: ⌘K / Ctrl-K opens it from anywhere, the
 * field takes focus on open, arrow keys walk the results, Enter opens the
 * highlighted one, Escape closes. Focus returns to whatever opened it.
 */
export function SearchOverlay({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useLockBodyScroll(open);
  useEscapeKey(open, onClose);
  const trapRef = useFocusTrap(open);

  const results = useMemo(
    () => (query.trim() ? searchProducts(products, query) : []),
    [query, products],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlighted(0);
      return;
    }
    // Slightly after the panel starts moving: focusing during the transform
    // makes some browsers scroll the panel into view mid-animation.
    const id = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) return;
    const id = window.setTimeout(
      () => track({ name: "search", query, resultCount: results.length }),
      600,
    );
    return () => window.clearTimeout(id);
  }, [query, results.length]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    }
    if (event.key === "Enter") {
      const target = results[highlighted];
      if (target) {
        event.preventDefault();
        onClose();
        router.push(`/product/${target.slug}`);
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={trapRef}
          data-ground="bone"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          variants={overlayPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-[var(--color-bone)] text-[var(--color-ink)]"
        >
          <div className="page-shell flex h-16 shrink-0 items-center justify-between">
            <Label>Search</Label>
            <button type="button" onClick={onClose} className="link-wipe type-label">
              Close <span className="ml-1 opacity-50">ESC</span>
            </button>
          </div>

          <div className="page-shell shrink-0">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search products"
              aria-controls="search-results"
              className="w-full bg-transparent py-6 text-display-2 font-medium tracking-[-0.03em] placeholder:text-[var(--color-smoke)] focus:outline-none"
            />
            <DashedRule className="text-[var(--color-ink)]" />
          </div>

          <div
            id="search-results"
            data-lenis-prevent
            aria-live="polite"
            className="page-shell flex-1 overflow-y-auto overscroll-contain py-8"
          >
            {!query.trim() ? (
              <div>
                <Label>Try</Label>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => setQuery(term)}
                        className="border border-[var(--rule-strong)] px-4 py-2.5 type-label transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-bone)]"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-h2 font-medium">No results for &ldquo;{query}&rdquo;.</p>
                <p className="text-sm max-w-[40ch] text-[var(--color-smoke)]">
                  Drop 01 is only a few pieces. Browsing it takes less time than searching it.
                </p>
                <Link href="/shop" onClick={onClose} className="link-wipe type-label mt-2 w-fit">
                  View everything &#8594;
                </Link>
              </div>
            ) : (
              <>
                <Label className="mb-5 block">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </Label>
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: stagger.tight } } }}
                  className="flex flex-col"
                >
                  {results.map((product, i) => {
                    const image = product.images[0];
                    return (
                      <motion.li
                        key={product.id}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: duration.base, ease: ease.outExpo },
                          },
                        }}
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          onPointerEnter={() => setHighlighted(i)}
                          className={cn(
                            "group flex items-center gap-5 py-4 transition-colors",
                            highlighted === i && "bg-[var(--color-bone-sunk)]",
                          )}
                        >
                          <span className="type-micro w-8 shrink-0 pl-1 text-[var(--color-smoke)]">
                            {padIndex(i + 1)}
                          </span>

                          <span className="relative h-20 w-14 shrink-0 overflow-hidden bg-[var(--color-bone-sunk)]">
                            {image && (
                              <Image
                                src={image.src}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            )}
                          </span>

                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="type-label">{product.name}</span>
                            <span className="type-micro truncate text-[var(--color-smoke)]">
                              {product.tagline}
                            </span>
                          </span>

                          <span className="type-data shrink-0 pr-1">
                            {formatMoney(product.price)}
                          </span>
                        </Link>
                        <div className="rule-solid" />
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
