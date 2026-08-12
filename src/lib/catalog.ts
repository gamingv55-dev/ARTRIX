/**
 * ═══════════════════════════════════════════════════════════════════════
 * CATALOG ACCESS LAYER
 *
 * The only route from the UI to product data. Components never import from
 * src/data directly — they call these functions.
 *
 * Every reader is `async` even though the current source is a local array.
 * That is deliberate: swapping in Shopify's Storefront API or a Medusa client
 * means rewriting the bodies of these functions and nothing else. If callers
 * were synchronous today, that swap would ripple through every page.
 *
 * See docs/architecture.md → "Replacing the data source".
 * ═══════════════════════════════════════════════════════════════════════
 */

import { products } from "@/data/products";
import { drops } from "@/data/drops";
import type {
  CatalogFilters,
  Drop,
  Product,
  ProductVariant,
  SizeCode,
  SortKey,
} from "@/types";

/* ── Reads ─────────────────────────────────────────────────────────────── */

/** Everything except archived pieces, in catalog order. */
export async function getProducts(): Promise<Product[]> {
  return products.filter((p) => p.status !== "archived");
}

export async function getAllProductsIncludingArchived(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByDrop(dropId: string): Promise<Product[]> {
  return products.filter((p) => p.dropId === dropId && p.status !== "archived");
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((p) => p.featured && p.status !== "archived");
}

export async function getDrops(): Promise<Drop[]> {
  return drops;
}

export async function getDropBySlug(slug: string): Promise<Drop | null> {
  return drops.find((d) => d.slug === slug) ?? null;
}

/**
 * Other pieces from the same drop, falling back to the rest of the catalog
 * if the drop only contains this one. Never returns the product itself.
 */
export async function getRelatedProducts(slug: string, limit = 3): Promise<Product[]> {
  const product = await getProductBySlug(slug);
  if (!product) return [];

  const sameDrop = products.filter(
    (p) => p.id !== product.id && p.dropId === product.dropId && p.status !== "archived",
  );
  const rest = products.filter(
    (p) => p.id !== product.id && p.dropId !== product.dropId && p.status !== "archived",
  );

  return [...sameDrop, ...rest].slice(0, limit);
}

/* ── Variants & stock ──────────────────────────────────────────────────── */

export function findVariant(
  product: Product,
  size: SizeCode,
  colorCode: string,
): ProductVariant | undefined {
  return product.variants.find((v) => v.size === size && v.colorCode === colorCode);
}

export function isSizeAvailable(product: Product, size: SizeCode, colorCode: string): boolean {
  const variant = findVariant(product, size, colorCode);
  return (variant?.inventory ?? 0) > 0;
}

export function totalInventory(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.inventory, 0);
}

/**
 * What the UI should offer for a piece. `sold-out` is derived from stock
 * rather than trusted from the status field, so a catalog edit that empties
 * every size can't leave a buy button on the page.
 */
export function purchaseState(product: Product): "buyable" | "sold-out" | "unreleased" {
  if (product.status === "in-production") return "unreleased";
  if (product.status === "archived") return "sold-out";
  return totalInventory(product) > 0 ? "buyable" : "sold-out";
}

/** Fewer than this many units left triggers the low-stock note on the PDP. */
export const LOW_STOCK_THRESHOLD = 8;

/* ── Filtering, sorting, search ────────────────────────────────────────── */

export function filterProducts(list: Product[], filters: CatalogFilters): Product[] {
  return list.filter((p) => {
    if (filters.dropId && p.dropId !== filters.dropId) return false;
    if (filters.category?.length && !filters.category.includes(p.category)) return false;
    if (filters.availableOnly && purchaseState(p) !== "buyable") return false;
    if (filters.priceMin != null && p.price.amount < filters.priceMin) return false;
    if (filters.priceMax != null && p.price.amount > filters.priceMax) return false;

    if (filters.color?.length) {
      const has = p.colors.some((c) => filters.color!.includes(c.code));
      if (!has) return false;
    }

    // A size filter means "I can actually buy this in my size", not "this size
    // is listed" — otherwise the filter returns pieces you can't purchase.
    if (filters.size?.length) {
      const has = p.variants.some(
        (v) => filters.size!.includes(v.size) && v.inventory > 0,
      );
      if (!has) return false;
    }

    return true;
  });
}

export function sortProducts(list: Product[], key: SortKey): Product[] {
  const out = [...list];
  switch (key) {
    case "price-asc":
      return out.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return out.sort((a, b) => b.price.amount - a.price.amount);
    case "newest":
      return out.sort((a, b) => (b.releasedAt ?? "").localeCompare(a.releasedAt ?? ""));
    case "featured":
    default:
      // Featured first, then buyable before sold-out, then catalog order.
      return out.sort((a, b) => {
        const feat = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (feat !== 0) return feat;
        const rank = (p: Product) =>
          purchaseState(p) === "buyable" ? 0 : purchaseState(p) === "sold-out" ? 1 : 2;
        return rank(a) - rank(b);
      });
  }
}

/**
 * Substring search across the fields a customer would actually type. Ranked
 * so a name match always outranks a description match. Deliberately simple —
 * a catalog this size does not need an index, and pretending otherwise would
 * be architecture for its own sake.
 */
export function searchProducts(list: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const scored = list
    .map((p) => {
      const name = p.name.toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score = 100;
      else if (name.includes(q)) score = 80;
      else if (p.tagline.toLowerCase().includes(q)) score = 50;
      else if (p.colors.some((c) => c.name.toLowerCase().includes(q))) score = 40;
      else if (p.category.includes(q)) score = 30;
      else if (p.description.some((d) => d.toLowerCase().includes(q))) score = 15;
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.product);
}

/** Distinct facet values present in the catalog, for building filter UI. */
export function collectFacets(list: Product[]) {
  const sizes = new Set<SizeCode>();
  const colors = new Map<string, string>();
  const categories = new Set<string>();

  for (const p of list) {
    p.variants.forEach((v) => {
      if (v.inventory > 0) sizes.add(v.size);
    });
    p.colors.forEach((c) => colors.set(c.code, c.name));
    categories.add(p.category);
  }

  const ORDER: SizeCode[] = ["XS", "S", "M", "L", "XL", "XXL"];

  return {
    sizes: ORDER.filter((s) => sizes.has(s)),
    colors: [...colors.entries()].map(([code, name]) => ({ code, name })),
    categories: [...categories],
  };
}
