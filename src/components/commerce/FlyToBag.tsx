"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { getBagRect, useFlightStore } from "@/lib/flight-store";
import { ease } from "@/motion/tokens";
import { useReducedMotion } from "@/hooks/use-preferences";

/**
 * The product image travelling to the bag on add.
 *
 * Mounted once in the root layout. It renders a copy of the source image at
 * exactly the source's viewport position, then animates it along an arc into
 * the bag while shrinking.
 *
 * The arc is the point. A straight tween between two points reads as a UI
 * affordance; a path that rises before it falls reads as an object being
 * thrown, and that is what makes the interaction feel physical rather than
 * decorative. It is built from three-stop keyframes on x and y with different
 * timing, which is cheaper and more controllable than a motion path.
 *
 * Skipped entirely under reduced motion — the item still lands and the bag
 * still reacts, there is simply nothing in flight.
 */
export function FlyToBag() {
  const flight = useFlightStore((s) => s.flight);
  const land = useFlightStore((s) => s.land);
  const reducedMotion = useReducedMotion();
  const [target, setTarget] = useState<{ dx: number; dy: number } | null>(null);

  // Resolve the destination when a flight starts. Read once, at launch — the
  // header can move between flights but not during one.
  useEffect(() => {
    if (!flight) {
      setTarget(null);
      return;
    }

    if (reducedMotion) {
      land();
      return;
    }

    const bag = getBagRect();
    if (!bag) {
      land();
      return;
    }

    setTarget({
      dx: bag.left + bag.width / 2 - (flight.from.left + flight.from.width / 2),
      dy: bag.top + bag.height / 2 - (flight.from.top + flight.from.height / 2),
    });
  }, [flight, reducedMotion, land]);

  return (
    <AnimatePresence>
      {flight && target && (
        <motion.div
          key={flight.id}
          aria-hidden="true"
          className="pointer-events-none fixed z-[var(--z-flight)] overflow-hidden"
          style={{
            top: flight.from.top,
            left: flight.from.left,
            width: flight.from.width,
            height: flight.from.height,
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            // Lateral travel eases out; vertical travel overshoots upward at
            // the midpoint before dropping into the bag.
            x: [0, target.dx * 0.62, target.dx],
            y: [0, target.dy * 0.3 - 90, target.dy],
            scale: [1, 0.46, 0.08],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.78,
            times: [0, 0.55, 1],
            ease: ease.outQuart,
          }}
          onAnimationComplete={land}
        >
          <Image
            src={flight.image.src}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
            priority
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
