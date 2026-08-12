"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/motion/tokens";
import { useReducedMotion } from "@/hooks/use-preferences";

const COLUMNS = 5;

/**
 * Route transition.
 *
 * Five ink columns that are already covering the viewport when a new route
 * mounts, then sweep upward in sequence to uncover it.
 *
 * Modelled as a reveal rather than a cover-then-reveal on purpose. The App
 * Router commits a navigation as soon as the new segment is ready, so any
 * attempt to play an exit animation first either delays every click by its
 * duration or races the commit and gets cut off. Uncovering sidesteps that
 * entirely: the animation always plays in full, and it starts at the exact
 * moment the new page becomes available.
 *
 * Under 600ms end to end. Repeat navigation is the common case, and a
 * transition that is beautiful the first time is an obstacle the fifth.
 * Skipped on the initial load, where the boot sequence already covers the
 * screen, and skipped entirely under reduced motion.
 */
export function PageTransition() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setKey(pathname);
  }, [pathname]);

  if (reducedMotion || isFirstRender.current) return null;

  return (
    <div
      key={key}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-transition)] flex"
    >
      {Array.from({ length: COLUMNS }, (_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{
            duration: 0.55,
            ease: ease.inOutQuint,
            // Sweeps left to right; the stagger is what makes it read as a
            // gesture instead of a curtain.
            delay: i * 0.055,
          }}
          style={{ transformOrigin: "top" }}
          className="h-full flex-1 bg-[var(--color-ink)]"
        />
      ))}
    </div>
  );
}
