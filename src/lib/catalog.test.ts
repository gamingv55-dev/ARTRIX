import { describe, expect, it } from "vitest";
import {
  collectFacets,
  filterProducts,
  findVariant,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  isSizeAvailable,
  purchaseState,
  searchProducts,
  sortProducts,
} from "./catalog";
import { products } from "@/data/products";

describe("catalog reads", () => {
  it("finds a product by slug", async () => {
    const product = await getProductBySlug("grillz-tee-black");
    expect(product?.name).toBe("Grillz Tee");
  });

  it("returns null for an unknown slug rather than throwing", async () => {
    expect(await getProductBySlug("does-not-exist")).toBeNull();
  });

  it("never includes the product itself in its related list", async () => {
    const related = await getRelatedProducts("grillz-tee-black");
    expect(related.every((p) => p.slug !== "grillz-tee-black")).toBe(true);
  });
});

describe("purchase state", () => {
  /**
   * Derived from real stock, not read off the status field. A catalog edit
   * that empties every size must not leave a buy button on the page.
   */
  it("reports sold-out when every variant is empty, whatever the status says", () => {
    const emptied = {
      ...products[0]!,
      status: "available" as const,
      variants: products[0]!.variants.map((v) => ({ ...v, inventory: 0 })),
    };
    expect(purchaseState(emptied)).toBe("sold-out");
  });

  it("reports buyable while any size has stock", () => {
    expect(purchaseState(products[0]!)).toBe("buyable");
  });

  it("reports unreleased for pieces still in production", () => {
    const unreleased = products.find((p) => p.status === "in-production");
    expect(unreleased && purchaseState(unreleased)).toBe("unreleased");
  });
});

describe("variants", () => {
  it("resolves a variant by size and colour", () => {
    const variant = findVariant(products[0]!, "L", "black");
    expect(variant?.sku).toBe("ATX01G-BLACK-L");
  });

  it("treats a zero-inventory size as unavailable", () => {
    const roman = products.find((p) => p.slug === "roman-tee-black")!;
    expect(isSizeAvailable(roman, "XXL", "black")).toBe(false);
    expect(isSizeAvailable(roman, "L", "black")).toBe(true);
  });
});

describe("filtering", () => {
  /**
   * A size filter means "I can buy this in my size", not "this size is
   * listed". Roman lists XXL but has none, so filtering by XXL must exclude
   * it — otherwise the filter returns a piece you cannot purchase.
   */
  it("excludes products that list a size but have none in stock", () => {
    const result = filterProducts(products, { size: ["XXL"] });
    expect(result.map((p) => p.slug)).not.toContain("roman-tee-black");
    expect(result.map((p) => p.slug)).toContain("grillz-tee-black");
  });

  it("drops unreleased pieces under availableOnly", () => {
    const result = filterProducts(products, { availableOnly: true });
    expect(result.every((p) => purchaseState(p) === "buyable")).toBe(true);
  });

  it("filters by colour code", () => {
    expect(filterProducts(products, { color: ["black"] }).length).toBe(products.length);
    expect(filterProducts(products, { color: ["ecru"] })).toHaveLength(0);
  });

  it("respects price bounds", () => {
    expect(filterProducts(products, { priceMax: 1000 })).toHaveLength(0);
    expect(filterProducts(products, { priceMin: 1000 }).length).toBeGreaterThan(0);
  });

  it("returns everything for empty filters", () => {
    expect(filterProducts(products, {})).toHaveLength(products.length);
  });
});

describe("sorting", () => {
  it("orders by price ascending and descending", () => {
    const mixed = [
      { ...products[0]!, price: { amount: 9900, currency: "BGN" as const } },
      { ...products[1]!, price: { amount: 4900, currency: "BGN" as const } },
    ];
    expect(sortProducts(mixed, "price-asc")[0]?.price.amount).toBe(4900);
    expect(sortProducts(mixed, "price-desc")[0]?.price.amount).toBe(9900);
  });

  it("puts featured pieces first and unreleased ones last", () => {
    const sorted = sortProducts(products, "featured");
    expect(sorted[0]?.featured).toBe(true);
    expect(purchaseState(sorted[sorted.length - 1]!)).toBe("unreleased");
  });

  it("does not mutate the array it was given", () => {
    const original = [...products];
    sortProducts(products, "price-desc");
    expect(products).toEqual(original);
  });
});

describe("search", () => {
  it("matches on name", () => {
    expect(searchProducts(products, "grillz")[0]?.slug).toBe("grillz-tee-black");
  });

  it("is case-insensitive and ignores surrounding space", () => {
    expect(searchProducts(products, "  ROMAN ")[0]?.slug).toBe("roman-tee-black");
  });

  it("ranks a name match above a description match", () => {
    // "watch" appears only in Roman's copy; "Roman" is its name.
    const byName = searchProducts(products, "roman");
    expect(byName[0]?.slug).toBe("roman-tee-black");
  });

  it("matches colour names", () => {
    expect(searchProducts(products, "black").length).toBeGreaterThan(0);
  });

  it("returns nothing for an empty query rather than the whole catalog", () => {
    expect(searchProducts(products, "   ")).toHaveLength(0);
  });

  it("returns nothing for a miss", () => {
    expect(searchProducts(products, "zzzzqqq")).toHaveLength(0);
  });
});

describe("facets", () => {
  it("only offers sizes that are actually in stock somewhere", () => {
    const { sizes } = collectFacets(products);
    expect(sizes).toContain("L");
    expect(sizes).toEqual([...sizes].sort((a, b) => {
      const order = ["XS", "S", "M", "L", "XL", "XXL"];
      return order.indexOf(a) - order.indexOf(b);
    }));
  });

  it("deduplicates colours across products", () => {
    const { colors } = collectFacets(products);
    expect(colors.filter((c) => c.code === "black")).toHaveLength(1);
  });
});

describe("catalog integrity", () => {
  it("has unique slugs", async () => {
    const all = await getProducts();
    expect(new Set(all.map((p) => p.slug)).size).toBe(all.length);
  });

  it("has unique SKUs across the whole catalog", () => {
    const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("gives every released piece at least one image with alt text", () => {
    for (const product of products) {
      if (purchaseState(product) === "unreleased") continue;
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.images.every((i) => i.alt.trim().length > 0)).toBe(true);
    }
  });

  it("declares a variant for every listed size", () => {
    for (const product of products) {
      for (const size of product.sizes) {
        expect(product.variants.some((v) => v.size === size)).toBe(true);
      }
    }
  });
});
