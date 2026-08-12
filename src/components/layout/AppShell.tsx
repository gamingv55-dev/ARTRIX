"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { SmoothScroll } from "./SmoothScroll";
import { PageTransition } from "./PageTransition";
import { BootSequence } from "./BootSequence";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { FlyToBag } from "@/components/commerce/FlyToBag";
import { SearchOverlay } from "@/components/overlay/SearchOverlay";
import type { Product } from "@/types";

/**
 * The persistent client layer wrapped around every route.
 *
 * Everything here survives navigation: the header, the bag, the cursor, the
 * scroll engine. The page itself stays a server component, so no product data
 * or rendering logic is pushed into the client bundle to get these.
 *
 * `products` is passed down from the server layout purely so search can run
 * without a round trip. At catalogue scale that is a few hundred bytes; if it
 * ever stops being, search moves to a route handler and this prop goes away.
 */
export function AppShell({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // ⌘K / Ctrl-K from anywhere. Registered once, here, rather than in the
  // overlay, so the shortcut works while the overlay is closed.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <SmoothScroll />
      <BootSequence />
      <PageTransition />

      <Header onOpenSearch={openSearch} />

      <main id="main" className="relative z-[var(--z-base)]">
        {children}
      </main>

      <CartDrawer />
      <FlyToBag />
      <SearchOverlay open={searchOpen} onClose={closeSearch} products={products} />

      <div className="grain" aria-hidden="true" />
    </>
  );
}
