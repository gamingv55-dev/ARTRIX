"use client";

import { useMemo, useState } from "react";
import { collectFacets, filterProducts, sortProducts } from "@/lib/catalog";
import { FilterBar } from "@/components/overlay/FilterBar";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { CatalogFilters, Product, SortKey } from "@/types";

/**
 * Client half of the shop.
 *
 * Filtering and sorting run in the browser against the full list rendered by
 * the server. For a drop-sized catalogue that is the right trade: no round
 * trip, no loading state, instant feedback, and the grid can animate between
 * results rather than replacing them.
 *
 * At a few hundred products this should move to the URL as search params with
 * server-side filtering — the shape of `CatalogFilters` is already what a
 * query string would carry, so that change stays contained to this file.
 */
export function ShopBrowser({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [sort, setSort] = useState<SortKey>("featured");

  const facets = useMemo(() => collectFacets(products), [products]);

  const visible = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort],
  );

  return (
    <>
      <FilterBar
        filters={filters}
        sort={sort}
        facets={facets}
        resultCount={visible.length}
        onChange={setFilters}
        onSortChange={setSort}
        onReset={() => setFilters({})}
      />

      <ProductGrid products={visible} className="pt-14 pb-[var(--spacing-band)]" />
    </>
  );
}
