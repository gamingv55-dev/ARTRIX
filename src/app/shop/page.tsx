import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { ShopBrowser } from "@/sections/shop/ShopBrowser";
import { TextReveal } from "@/components/ui/Reveal";
import { Label } from "@/components/ui/Label";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description:
    "Every ATRIX piece currently made. Original artwork, 240 GSM oversized cotton, fifty pieces per design.",
  path: "/shop",
});

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div data-ground="bone" className="min-h-screen bg-[var(--color-bone)] pt-28">
      <div className="page-shell">
        <header className="pb-10">
          <Label>All pieces</Label>
          <TextReveal
            as="h1"
            lines={["Shop"]}
            className="text-display-1 mt-4 font-medium text-[var(--color-ink)]"
          />
          <p className="text-lead mt-6 max-w-[46ch] text-[var(--color-graphite)]">
            One drop, made in small numbers. Nothing is restocked once a size sells through.
          </p>
        </header>

        <ShopBrowser products={products} />
      </div>
    </div>
  );
}
