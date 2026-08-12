"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/use-preferences";

/**
 * Smooth scrolling, via Lenis.
 *
 * Worth the ~8 KB here specifically: the whole site is long-scroll editorial
 * pacing, and native wheel stepping fights that. It is switched off entirely
 * for reduced-motion, and on touch devices, where the OS momentum is better
 * than anything we would layer on top.
 *
 * Two things this has to get right or it becomes a liability:
 *   - in-page anchors must still work, so `data-lenis-prevent` is honoured and
 *     hash links are handled explicitly
 *   - the scroll position must reset on navigation, which Lenis does not do
 *     for a client-side route change
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || isTouch) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Matches the house out-expo curve so scrolling and animation share a feel.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      // Nested scrollers (the drop rail, the cart drawer) opt out with
      // data-lenis-prevent and keep their own native scrolling.
      prevent: (node) => node.hasAttribute?.("data-lenis-prevent") ?? false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Hash links: Lenis owns scroll position, so the browser's default jump
    // would be overwritten on the next frame.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -96 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  // App Router restores scroll on back/forward but does not reset it for a
  // forward navigation while Lenis holds the position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
