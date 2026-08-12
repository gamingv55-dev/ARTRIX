"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Ground = "bone" | "ink";

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * The ground has to be settled *before* the browser paints. With a plain
 * useEffect the header paints once with the default bone ground and is
 * corrected a frame later — on a page that opens on an ink band, that is a
 * visible flash of dark-on-dark controls on every load.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Which ground is currently passing under the header, and whether the page has
 * been scrolled away from the top.
 *
 * The ground question matters because the header floats over full-bleed bands
 * that alternate bone and ink — without this it would be invisible over half
 * the page.
 *
 * Two things this has to get right, both of which were bugs:
 *
 *   1. Only page content counts. The query is scoped to `main` because the
 *      header itself carries data-ground, as do the cart drawer, the search
 *      overlay and the mobile nav. An unscoped query makes the header observe
 *      itself — it always intersects its own band, so it just re-asserts
 *      whatever it already was and can never change again.
 *
 *   2. It has to re-run on navigation. The observer holds references to the
 *      sections that existed when it was created; after a client-side route
 *      change those are detached, nothing reports, and the header keeps the
 *      previous page's ground. Land on a bone page holding "ink" and the
 *      controls render bone-on-bone — invisible.
 *
 * Solved with an IntersectionObserver whose rootMargin collapses the viewport
 * to a thin band at the header's own height, so "which section is under the
 * header" becomes a plain intersection test. A scroll handler doing
 * getBoundingClientRect over every section would cost a layout read per frame.
 */
export function useHeaderState(headerHeight = 64) {
  const pathname = usePathname();
  const [ground, setGround] = useState<Ground>("bone");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const band = Math.round(headerHeight / 2);

    // Scoped to main: page content only, never the header or an overlay.
    const sections = document.querySelectorAll<HTMLElement>("main [data-ground]");
    if (sections.length === 0) return;

    /**
     * One synchronous pass so a new route paints with the right ground
     * immediately. The observer alone would leave the previous page's value on
     * screen until its first callback, which is a visible flash of the wrong
     * colour on every navigation.
     */
    const settleNow = () => {
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= band && rect.bottom > band) {
          const value = section.getAttribute("data-ground");
          if (value === "ink" || value === "bone") {
            setGround(value);
            return;
          }
        }
      }
      // Nothing under the band yet (a route that starts scrolled, say) — fall
      // back to the first section's ground rather than the last page's.
      const first = sections[0]?.getAttribute("data-ground");
      if (first === "ink" || first === "bone") setGround(first);
    };

    settleNow();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const value = entry.target.getAttribute("data-ground");
          if (value === "ink" || value === "bone") setGround(value);
        }
      },
      {
        rootMargin: `-${band}px 0px -${Math.max(0, window.innerHeight - band - 4)}px 0px`,
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [headerHeight, pathname]);

  return { ground, scrolled };
}
