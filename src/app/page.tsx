import { notFound } from "next/navigation";
import { getDropBySlug, getProductsByDrop, purchaseState, sortProducts } from "@/lib/catalog";
import { site } from "@/config/site";
import { Hero } from "@/sections/home/Hero";
import { DropRail } from "@/sections/home/DropRail";
import { Editorial } from "@/sections/home/Editorial";
import { PrintStudy } from "@/sections/home/PrintStudy";
import { Pieces } from "@/sections/home/Pieces";

/**
 * Home.
 *
 * The order of these sections is the design. Read top to bottom it goes:
 *
 *   Hero        impact    — the brand, stated once, at full volume
 *   DropRail    product   — inverted to ink; what is actually for sale
 *   Editorial   calm      — back to bone, one statement, room to breathe
 *   PrintStudy  impact    — the artwork alone, at scale
 *   Pieces      product   — the close, with a route into the shop
 *
 * Alternating impact with calm is what stops the page reading as a stack of
 * effects. Adding a sixth section would not make it stronger.
 */
export default async function HomePage() {
  const drop = await getDropBySlug(site.currentDropSlug);
  if (!drop) notFound();

  const dropProducts = await getProductsByDrop(drop.id);
  const released = sortProducts(
    dropProducts.filter((p) => purchaseState(p) !== "unreleased"),
    "featured",
  );

  return (
    <>
      <Hero />
      <DropRail drop={drop} products={dropProducts} />
      <Editorial />
      <PrintStudy />
      <Pieces products={released} />
    </>
  );
}
