import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { SearchPanel } from "@/sections/search/SearchPanel";
import { Label } from "@/components/ui/Label";

export const metadata: Metadata = pageMetadata({
  title: "Search",
  description: "Search everything ATRIX has made.",
  path: "/search",
  // Thin, query-driven, and duplicates /shop. Useful to people, not to an index.
  noIndex: true,
});

export default async function SearchPage() {
  const products = await getProducts();

  return (
    <div data-ground="bone" className="min-h-screen bg-[var(--color-bone)] pt-28">
      <div className="page-shell pb-2">
        {/* The search field is the visual focus of this page, so the heading
            is the small label above it rather than a display setting. It is
            still a real h1 — every page needs exactly one, and an input is
            not one. */}
        <Label as="h1">Search</Label>
      </div>
      <SearchPanel products={products} />
    </div>
  );
}
