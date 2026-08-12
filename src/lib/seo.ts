import type { Metadata } from "next";
import { site } from "@/config/site";
import { purchaseState } from "./catalog";
import type { Drop, Product } from "@/types";

/**
 * Metadata and structured-data builders. Every page composes its `metadata`
 * export from `pageMetadata` so title formatting, canonicals and social cards
 * stay consistent without each route restating them.
 */

const OG_IMAGE = "/media/editorial-street.webp";

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image ?? OG_IMAGE);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ── Structured data ───────────────────────────────────────────────────── */

/**
 * schema.org availability. Derived from real stock rather than the status
 * field, so a sold-through piece can't advertise itself as in stock to Google.
 */
function availabilityUrl(product: Product): string {
  switch (purchaseState(product)) {
    case "buyable":
      return "https://schema.org/InStock";
    case "unreleased":
      return "https://schema.org/PreOrder";
    default:
      return "https://schema.org/SoldOut";
  }
}

export function productJsonLd(product: Product) {
  const images = product.images.map((i) => absoluteUrl(i.src));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.colors[0]?.name ?? ""}`.trim(),
    description: product.description.join(" "),
    sku: product.id,
    image: images.length > 0 ? images : [absoluteUrl(OG_IMAGE)],
    brand: { "@type": "Brand", name: site.name },
    category: product.category,
    material: product.specs.find((s) => s.label === "Composition")?.value,
    releaseDate: product.releasedAt,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: product.price.currency,
      price: (product.price.amount / 100).toFixed(2),
      availability: availabilityUrl(product),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: site.legalName },
    },
  };
}

export function dropJsonLd(drop: Drop, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: drop.title,
    description: drop.statement.join(" "),
    url: absoluteUrl(`/drop/${drop.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/product/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    email: site.email,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: "BG",
    },
    sameAs: site.social.map((s) => s.href),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
