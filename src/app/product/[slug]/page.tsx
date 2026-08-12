import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  purchaseState,
  totalInventory,
} from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import { Reveal } from "@/components/ui/Reveal";

/** Pre-renders every product at build time. */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return pageMetadata({ title: "Not found", description: "", path: `/product/${slug}`, noIndex: true });

  return pageMetadata({
    title: `${product.name} — ${product.colors[0]?.name ?? ""}`.trim(),
    description: `${product.tagline} ${formatMoney(product.price)}. Edition of ${product.editionSize}.`,
    path: `/product/${product.slug}`,
    image: product.images[0]?.src,
  });
}

/**
 * Product detail.
 *
 * Editorial rather than transactional: the photography runs down the left at
 * full column width while the buy controls stay pinned alongside. Scrolling
 * the images never costs access to the size selector, which is what usually
 * breaks on long-form product pages.
 *
 * A server component throughout. Only the three genuinely interactive pieces —
 * gallery, purchase, accordion — are client components, so the page ships
 * almost no JavaScript for what is mostly text and images.
 */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug, 3);
  const state = purchaseState(product);
  const remaining = totalInventory(product);

  const accordionSections = [
    { title: "Specification", rows: product.specs },
    ...(product.care.length ? [{ title: "Care", body: product.care }] : []),
    {
      title: "Shipping & returns",
      body: [
        "Bulgaria: 2–4 working days, free over 150.00 BGN.",
        "EU: 5–8 working days, calculated at checkout.",
        "Unworn pieces can be returned within 14 days of delivery.",
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: product.name, path: `/product/${product.slug}` },
            ]),
          ),
        }}
      />
      <ProductViewTracker product={product} />

      <article data-ground="bone" className="bg-[var(--color-bone)] pt-20 lg:pt-24">
        <div className="page-shell">
          <nav aria-label="Breadcrumb" className="pb-6">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/shop" className="link-wipe type-micro text-[var(--color-smoke)]">
                  Shop
                </Link>
              </li>
              <li aria-hidden="true" className="type-micro text-[var(--color-smoke)] opacity-50">
                /
              </li>
              <li className="type-micro text-[var(--color-ink)]">{product.name}</li>
            </ol>
          </nav>
        </div>

        <div className="page-shell grid-12 items-start gap-y-12">
          {/* Gallery. Full-bleed on mobile — the negative margin cancels the
              page gutter so the carousel reaches both screen edges. */}
          <div className="col-span-12 -mx-[var(--spacing-gutter)] lg:col-span-7 lg:mx-0">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Buy column. Sticky below the header on desktop only; on mobile it
              is simply the next thing down the page. */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:sticky lg:top-24">
            <header>
              <Label>
                {product.category === "t-shirt" ? "T-shirt" : product.category} /{" "}
                {product.colors[0]?.name}
              </Label>

              <h1 className="text-h1 mt-4 font-medium text-[var(--color-ink)]">{product.name}</h1>

              <p className="text-lead mt-3 text-[var(--color-graphite)]">{product.tagline}</p>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="type-data text-[16px] text-[var(--color-ink)]">
                  {formatMoney(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="type-data text-[var(--color-smoke)] line-through">
                    {formatMoney(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </header>

            <DashedRule className="my-8 text-[var(--color-ink)]" />

            <ProductPurchase product={product} />

            {product.editionSize && state !== "unreleased" && (
              <p className="type-micro mt-6 text-[var(--color-smoke)]">
                Edition of {product.editionSize}
                {state === "buyable" && ` / ${remaining} remaining`}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-4">
              {product.description.map((paragraph, i) => (
                <p key={i} className="text-body text-[var(--color-graphite)]">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10">
              <ProductAccordion sections={accordionSections} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="page-shell pt-[var(--spacing-band-lg)] pb-[var(--spacing-band)]"
          >
            <Reveal>
              <Label as="h2" tone="strong">
                <span id="related-heading">Also in this drop</span>
              </Label>
            </Reveal>
            <DashedRule className="mt-5 text-[var(--color-ink)]" />

            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-5">
              {related.map((item, i) => (
                <li key={item.id}>
                  <ProductCard
                    product={item}
                    index={i}
                    total={related.length}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
