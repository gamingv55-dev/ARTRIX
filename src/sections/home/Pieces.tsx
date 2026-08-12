"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Reveal, RevealGroup, RevealItem, TextReveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import type { Product } from "@/types";

/**
 * Released pieces, in an offset layout.
 *
 * The first piece takes a wider column and drops lower than the second, so the
 * pair reads as a spread rather than two cells of a grid. With a catalogue
 * this small a uniform grid would make it look thin; an asymmetric one makes
 * the same two products look deliberate.
 */
export function Pieces({ products }: { products: Product[] }) {
  const [first, second, ...rest] = products;

  return (
    <section
      data-ground="bone"
      aria-labelledby="pieces-heading"
      className="bg-[var(--color-bone)] py-[var(--spacing-band-lg)]"
    >
      <div className="page-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <Label>Available now</Label>
            </Reveal>
            <TextReveal
              as="h2"
              id="pieces-heading"
              lines={["The pieces"]}
              className="text-h1 mt-4 font-medium text-[var(--color-ink)]"
            />
          </div>
          <Reveal delay={0.15}>
            <ArrowLink href="/shop" size="sm">
              All pieces
            </ArrowLink>
          </Reveal>
        </div>

        <DashedRule className="mt-8 text-[var(--color-ink)]" />

        <RevealGroup className="grid-12 mt-14 items-start gap-y-16">
          {first && (
            <RevealItem className="col-span-12 md:col-span-7">
              <ProductCard
                product={first}
                index={0}
                total={products.length}
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </RevealItem>
          )}

          {second && (
            <RevealItem className="col-span-12 md:col-span-5 lg:col-span-4 lg:col-start-9 md:pt-[8vw]">
              <ProductCard
                product={second}
                index={1}
                total={products.length}
                sizes="(max-width: 768px) 100vw, 34vw"
              />
            </RevealItem>
          )}

          {rest.map((product, i) => (
            <RevealItem key={product.id} className="col-span-6 md:col-span-4 lg:col-span-3">
              <ProductCard
                product={product}
                index={i + 2}
                total={products.length}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
