"use client";

import { useEffect, useState } from "react";

export type Ground = "bone" | "ink";

/**
 * Which ground is currently passing under the header, and whether the page has
 * been scrolled away from the top.
 *
 * The ground question matters because the header floats over full-bleed bands
 * that alternate bone and ink — without this it would be invisible over half
 * the page. Solved with an IntersectionObserver whose rootMargin collapses the
 * viewport to a thin band at the header's own height, so "which section is
 * under the header" becomes a plain intersection test. A scroll handler doing
 * getBoundingClientRect on every section would cost a layout read per frame.
 */
export function useHeaderState(headerHeight = 64) {
  const [ground, setGround] = useState<Ground>("bone");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-ground]");
    if (sections.length === 0) return;

    // Detection band: a few pixels tall, sitting at the header's midline.
    const band = Math.round(headerHeight / 2);
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
  }, [headerHeight]);

  return { ground, scrolled };
}
