"use client";

import { useCallback, useRef } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { spring } from "@/motion/tokens";
import { useFinePointer, useReducedMotion } from "./use-preferences";

interface MagneticOptions {
  /** Fraction of the cursor's offset the element travels. Keep well under 1 —
   *  anything above ~0.4 makes the interface feel unmoored. */
  strength?: number;
  /** Extra pixels beyond the element's box that still count as "near". */
  padding?: number;
}

/**
 * Pulls an element gently toward the cursor while the cursor is over it.
 *
 * Implemented on pointer events over the element itself rather than a global
 * mousemove listener: with a dozen magnetic elements on a page, a shared
 * listener would run hit-testing for all of them on every frame.
 *
 * Returns motion values to bind to a motion component's `style`, so the
 * animation stays entirely off the React render path.
 */
export function useMagnetic({ strength = 0.28, padding = 0 }: MagneticOptions = {}): {
  ref: React.RefObject<HTMLElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
} {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, spring.magnetic);
  const y = useSpring(rawY, spring.magnetic);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (reducedMotion || !finePointer || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;

      // Normalise against the padded half-extent so the pull tapers off at the
      // edge of the hit area instead of snapping when the pointer leaves.
      const halfW = rect.width / 2 + padding;
      const halfH = rect.height / 2 + padding;
      const dx = (event.clientX - centreX) / halfW;
      const dy = (event.clientY - centreY) / halfH;

      rawX.set(dx * halfW * strength);
      rawY.set(dy * halfH * strength);
    },
    [reducedMotion, finePointer, padding, strength, rawX, rawY],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, x, y, onPointerMove, onPointerLeave };
}
