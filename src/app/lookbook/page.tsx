import type { Metadata } from "next";
import Link from "next/link";
import { lookbook } from "@/data/lookbook";
import { pageMetadata } from "@/lib/seo";
import { Media } from "@/components/ui/Media";
import { TextReveal } from "@/components/ui/Reveal";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import { cn, padIndex } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Lookbook",
  description: "Drop 01, photographed on location in Varna. Every frame is a piece you can buy.",
  path: "/lookbook",
});

/**
 * The lookbook is a sequence, not a gallery.
 *
 * Each frame declares a `scale` in src/data/lookbook.ts and the layout honours
 * it, so the page alternates between full-bleed, offset and inset frames. A
 * uniform masonry grid would show the same photographs and say nothing; the
 * changing rhythm is what makes it read as a spread being turned.
 *
 * Frames link through to the piece worn in them, which is the difference
 * between a lookbook and a mood board.
 */

const FRAME_LAYOUT: Record<string, string> = {
  full: "col-span-12",
  wide: "col-span-12 md:col-span-8 md:col-start-3",
  tall: "col-span-12 md:col-span-6",
  inset: "col-span-12 md:col-span-4 md:col-start-8",
};

const FRAME_RATIO: Record<string, string> = {
  full: "16 / 10",
  wide: "5 / 4",
  tall: "2 / 3",
  inset: "4 / 5",
};

const FRAME_SIZES: Record<string, string> = {
  full: "100vw",
  wide: "(max-width: 768px) 100vw, 66vw",
  tall: "(max-width: 768px) 100vw, 50vw",
  inset: "(max-width: 768px) 100vw, 33vw",
};

export default function LookbookPage() {
  return (
    <div data-ground="bone" className="bg-[var(--color-bone)] pt-28">
      <header className="page-shell pb-14">
        <Label>Drop 01 / Varna 2026</Label>
        <TextReveal
          as="h1"
          lines={["Lookbook"]}
          className="text-display-1 mt-4 font-medium text-[var(--color-ink)]"
        />
        <p className="text-lead mt-6 max-w-[42ch] text-[var(--color-graphite)]">
          Shot on location over one afternoon. No studio, no retouching beyond a grade.
        </p>
        <DashedRule className="mt-10 text-[var(--color-ink)]" />
      </header>

      <div className="page-shell grid-12 gap-y-[clamp(4rem,9vw,10rem)] pb-[var(--spacing-band-lg)]">
        {lookbook.map((frame, i) => {
          const body = (
            <figure>
              <Media
                image={frame.image}
                ratio={FRAME_RATIO[frame.scale] ?? "2 / 3"}
                sizes={FRAME_SIZES[frame.scale] ?? "100vw"}
                priority={i === 0}
                hoverZoom={Boolean(frame.productSlug)}
              />
              <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                <span className="type-micro text-[var(--color-smoke)]">
                  {padIndex(i + 1)} / {padIndex(lookbook.length)}
                </span>
                {frame.caption && (
                  <span className="type-micro text-[var(--color-smoke)]">{frame.caption}</span>
                )}
              </figcaption>
            </figure>
          );

          return (
            <div
              key={frame.id}
              className={cn(
                FRAME_LAYOUT[frame.scale] ?? "col-span-12",
                // Nudge alternate tall frames down so facing pages never line up.
                frame.scale === "tall" && i % 2 === 1 && "md:col-start-7 md:mt-[8vw]",
              )}
            >
              {frame.productSlug ? (
                <Link
                  href={`/product/${frame.productSlug}`}
                  data-cursor="view"
                  data-cursor-label="VIEW PIECE"
                  className="group block"
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
