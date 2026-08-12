import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDropBySlug, getDrops, getProductsByDrop } from "@/lib/catalog";
import { dropJsonLd, pageMetadata } from "@/lib/seo";
import { Media } from "@/components/ui/Media";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { DashedRule } from "@/components/ui/Rule";
import { Label, SpecStrip } from "@/components/ui/Label";
import { productionSpec } from "@/config/site";

export async function generateStaticParams() {
  const drops = await getDrops();
  return drops.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) {
    return pageMetadata({ title: "Not found", description: "", path: `/drop/${slug}`, noIndex: true });
  }

  return pageMetadata({
    title: drop.title,
    description: drop.statement[0] ?? drop.subtitle,
    path: `/drop/${drop.slug}`,
    image: drop.cover.src,
  });
}

/**
 * A drop, told as a campaign.
 *
 * Opens on a full-bleed frame with the title set over it, moves through the
 * written statement, then lands on the pieces. The order is the argument: why
 * this exists, then what it is, then what you can buy — which is the reverse
 * of how a category page usually works, and the right way round for a label
 * whose entire proposition is the reason behind the garment.
 */
export default async function DropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) notFound();

  const products = await getProductsByDrop(drop.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dropJsonLd(drop, products)) }}
      />

      {/* ── Campaign frame ────────────────────────────────────────────── */}
      <section
        data-ground="ink"
        className="relative flex min-h-[86svh] flex-col justify-end overflow-hidden bg-[var(--color-ink)] text-[var(--color-bone)]"
      >
        <div className="absolute inset-0">
          <Media
            image={drop.cover}
            fillParent
            objectPosition="50% 32%"
            sizes="100vw"
            priority
            reveal={false}
          />
          <div className="media-scrim" />
        </div>

        <div className="page-shell relative pb-[var(--spacing-band-sm)]">
          <Label className="text-[var(--color-chalk)]">{drop.season}</Label>
          <TextReveal
            as="h1"
            lines={[drop.title]}
            className="text-display-1 mt-4 font-medium"
          />
          <Reveal delay={0.18} className="mt-5">
            <p className="text-lead max-w-[34ch] text-[var(--color-bone-dim)]">{drop.subtitle}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Statement ─────────────────────────────────────────────────── */}
      <section
        data-ground="bone"
        className="bg-[var(--color-bone)] py-[var(--spacing-band-lg)]"
      >
        <div className="page-shell grid-12">
          <div className="col-span-12 lg:col-span-3">
            <Reveal>
              <Label>The drop</Label>
            </Reveal>
          </div>

          <div className="col-span-12 flex flex-col gap-7 lg:col-span-8 lg:col-start-5">
            {drop.statement.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-lead text-[var(--color-ink)]">{paragraph}</p>
              </Reveal>
            ))}

            <Reveal delay={0.3} className="mt-4">
              <DashedRule className="text-[var(--color-ink)]" />
            </Reveal>
            <Reveal delay={0.36}>
              <SpecStrip items={productionSpec} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Pieces ────────────────────────────────────────────────────── */}
      <section
        data-ground="bone"
        aria-labelledby="drop-pieces"
        className="bg-[var(--color-bone)] pb-[var(--spacing-band-lg)]"
      >
        <div className="page-shell">
          <Label as="h2" tone="strong">
            <span id="drop-pieces">The pieces</span>
          </Label>
          <DashedRule className="mt-5 text-[var(--color-ink)]" />

          <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {products.map((product, i) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  index={i}
                  total={products.length}
                  priority={i < 2}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
