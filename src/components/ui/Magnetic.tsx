"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMagnetic } from "@/hooks/use-magnetic";
import { cn } from "@/lib/utils";

/**
 * Wraps a single interactive child so it drifts toward the cursor.
 *
 * Reserved for genuinely primary controls — the hero CTA, the bag, the header
 * links. Applying it broadly is what makes an interface feel like a toy; the
 * effect only reads as considered while it stays rare.
 *
 * Purely presentational: it renders a span around the child rather than
 * cloning it, so it can never interfere with the child's own event handlers,
 * focus behaviour or semantics.
 */
export function Magnetic({
  children,
  strength = 0.28,
  padding = 12,
  className,
}: {
  children: ReactNode;
  strength?: number;
  padding?: number;
  className?: string;
}) {
  const { ref, x, y, onPointerMove, onPointerLeave } = useMagnetic({ strength, padding });

  return (
    <motion.span
      ref={ref as React.RefObject<HTMLSpanElement>}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.span>
  );
}
