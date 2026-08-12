"use client";

import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { useFlightStore } from "@/lib/flight-store";
import { useHydrated } from "@/hooks/use-ui";
import { duration, ease } from "@/motion/tokens";

/**
 * The bag control in the header.
 *
 * Also the landing target for the add-to-bag flight — <FlyToBag> finds it by
 * the `data-bag-target` attribute, which is why that lives on the count rather
 * than on the button box.
 *
 * The count renders as an empty slot until hydration. The cart lives in
 * localStorage, so server HTML cannot know it; rendering 0 and then correcting
 * would flash a wrong number on every page load for anyone with a full bag.
 */
export function BagButton() {
  const lines = useCartStore((s) => s.lines);
  const open = useCartStore((s) => s.open);
  const landings = useFlightStore((s) => s.landings);
  const hydrated = useHydrated();
  const controls = useAnimationControls();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cartCount(lines));
  }, [lines]);

  // React when something lands, not when the count changes: the count updates
  // the instant the button is pressed, but the flight is still in the air.
  useEffect(() => {
    if (landings === 0) return;
    controls.start({
      scale: [1, 1.32, 1],
      transition: { duration: 0.52, ease: ease.outExpo, times: [0, 0.35, 1] },
    });
  }, [landings, controls]);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={
        hydrated
          ? `Open bag, ${count} ${count === 1 ? "item" : "items"}`
          : "Open bag"
      }
      className="link-wipe type-label inline-flex items-center gap-2 text-[var(--figure)]"
    >
      <span>Bag</span>
      <motion.span
        data-bag-target
        animate={controls}
        className="inline-block min-w-[1ch] type-data text-[var(--figure)]"
      >
        {/* Non-breaking space holds the slot's width before hydration. */}
        {hydrated ? count : " "}
      </motion.span>
    </button>
  );
}

/** Shared transition for the count's own value change. */
export const bagCountTransition = { duration: duration.fast, ease: ease.outExpo };
