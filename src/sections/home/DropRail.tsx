"use client";

import { Marquee } from "@/components/ui/Marquee";
import { ProductRail } from "@/components/product/ProductRail";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Label } from "@/components/ui/Label";
import type { Drop, Product } from "@/types";

const TICKER = [
  "Drop 01",
  "Fifty pieces per design",
  "Original artwork",
  "240 GSM",
  "Varna 2026",
] as const;

/**
 * The release band — the first impact after the hero.
 *
 * Inverting to ink here is doing real work: it separates the campaign opening
 * from the commercial content, and it gives the black garments a ground they
 * sit on rather than float against.
 *
 * The marquee above it is the quiet beat between the two. It is the only
 * looping animation on the site, which is what keeps it from reading as noise.
 */
export function DropRail({ drop, products }: { drop: Drop; products: Product[] }) {
  return (
    <section
      data-ground="ink"
      aria-labelledby="drop-heading"
      className="relative bg-[var(--color-ink)] text-[var(--color-bone)]"
    >
      <div className="border-b border-[var(--rule)] py-4">
        <Marquee items={TICKER} speed={54} />
      </div>

      <div className="pt-[var(--spacing-band)] pb-[var(--spacing-band-sm)]">
        <div className="page-shell mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <Label>
                {drop.season} &#8212; out now
              </Label>
            </Reveal>
            <TextReveal
              as="h2"
              id="drop-heading"
              lines={["Everything here", "is made fifty times."]}
              className="text-display-2 mt-4 max-w-[16ch] font-medium"
              delay={0.06}
            />
          </div>

          <Reveal delay={0.2}>
            <ArrowLink href={`/drop/${drop.slug}`} size="sm">
              Read the drop
            </ArrowLink>
          </Reveal>
        </div>

        <ProductRail products={products} />
      </div>
    </section>
  );
}
