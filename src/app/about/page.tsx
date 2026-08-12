import type { Metadata } from "next";
import { media } from "@/data/generated/media";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Media } from "@/components/ui/Media";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "ATRIX is an independent apparel label from Varna. Original artwork, printed in editions of fifty on heavyweight cotton.",
  path: "/about",
});

/**
 * The brand, told in four beats: the statement, the method, the numbers, the
 * invitation. Set as a campaign rather than a company page — oversized type,
 * one photograph per beat, and no paragraph longer than it needs to be.
 */

const PRINCIPLES = [
  {
    index: "01",
    title: "Drawn, not generated",
    body: "Every graphic starts as a physical object — a photograph pushed through a halftone until it breaks down, a watch painted in gouache. Nothing is licensed and nothing is generated.",
  },
  {
    index: "02",
    title: "Fifty of each",
    body: "Fifty pieces per design. When the last one goes the screen is retired and the design is not reprinted, in any colour, ever.",
  },
  {
    index: "03",
    title: "Made close to home",
    body: "Printed and finished in Bulgaria on 240 GSM combed cotton, cut oversized with a dropped shoulder. Heavy enough to hold the print and soften instead of thinning.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Statement ─────────────────────────────────────────────────── */}
      <section data-ground="bone" className="bg-[var(--color-bone)] pt-32 pb-[var(--spacing-band)]">
        <div className="page-shell">
          <Label>{site.city}, {site.country} &#8212; est. {site.founded}</Label>
          <TextReveal
            as="h1"
            lines={["We make small", "numbers of things", "on purpose."]}
            className="text-display-1 mt-8 max-w-[15ch] font-medium text-[var(--color-ink)]"
          />
          <DashedRule className="mt-14 text-[var(--color-ink)]" />
        </div>
      </section>

      {/* ── Campaign frame ────────────────────────────────────────────── */}
      <section
        data-ground="ink"
        className="relative h-[80svh] overflow-hidden bg-[var(--color-ink)]"
      >
        <Media
          image={{
            ...media["editorial-street"],
            alt: "Drop 01 photographed on location in Varna.",
          }}
          fillParent
          objectPosition="50% 38%"
          sizes="100vw"
          reveal={false}
        />
      </section>

      {/* ── Principles ────────────────────────────────────────────────── */}
      <section
        data-ground="bone"
        aria-labelledby="principles-heading"
        className="bg-[var(--color-bone)] py-[var(--spacing-band-lg)]"
      >
        <div className="page-shell">
          <Label as="h2" tone="strong">
            <span id="principles-heading">How it works</span>
          </Label>
          <DashedRule className="mt-5 text-[var(--color-ink)]" />

          <ul className="mt-16 grid-12 gap-y-16">
            {PRINCIPLES.map((principle, i) => (
              <li key={principle.index} className="col-span-12 md:col-span-4">
                <Reveal delay={i * 0.08}>
                  <span className="type-data text-[var(--color-smoke)]">{principle.index}</span>
                  <h3 className="text-h2 mt-5 font-medium text-[var(--color-ink)]">
                    {principle.title}
                  </h3>
                  <p className="text-body mt-4 max-w-[38ch] text-[var(--color-graphite)]">
                    {principle.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Detail ────────────────────────────────────────────────────── */}
      <section data-ground="bone" className="bg-[var(--color-bone)] pb-[var(--spacing-band-lg)]">
        <div className="page-shell grid-12 items-center gap-y-12">
          <figure className="col-span-12 md:col-span-5">
            <Media
              image={{
                ...media["roman-print"],
                alt: "Close detail of the hand-painted watch dial print.",
              }}
              ratio="4 / 5"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
            <figcaption className="mt-3 type-micro text-[var(--color-smoke)]">
              Original gouache, reproduced at full scale
            </figcaption>
          </figure>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <TextReveal
              as="h2"
              lines={["The brush marks", "are part of it."]}
              className="text-display-2 font-medium text-[var(--color-ink)]"
            />
            <Reveal delay={0.12}>
              <p className="text-lead mt-7 max-w-[40ch] text-[var(--color-graphite)]">
                Nothing gets redrawn as vector. Where the paint pooled, it pooled; where the
                bracelet bled into the paper, it bled. A clean version of this would be a
                different, worse thing.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <ArrowLink href="/shop" className="w-fit">
                See the pieces
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
