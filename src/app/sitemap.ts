import type { MetadataRoute } from "next";
import { getDrops, getProducts } from "@/lib/catalog";
import { site } from "@/config/site";

/**
 * Generated from the catalog, so adding a product or opening a drop puts it in
 * the sitemap with no separate step. /search is excluded — it is noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, drops] = await Promise.all([getProducts(), getDrops()]);
  const url = (path: string) => new URL(path, site.url).toString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/shop"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/lookbook"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/size-guide"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/shipping"), changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...drops.map((drop) => ({
      url: url(`/drop/${drop.slug}`),
      lastModified: new Date(drop.releasedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: url(`/product/${product.slug}`),
      lastModified: product.releasedAt ? new Date(product.releasedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
