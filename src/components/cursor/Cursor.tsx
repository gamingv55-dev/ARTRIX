"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { duration, ease, spring } from "@/motion/tokens";
import { useFinePointer, useReducedMotion } from "@/hooks/use-preferences";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * CUSTOM CURSOR
 *
 * Driven entirely by markup: any element can declare `data-cursor="view"` and
 * optionally `data-cursor-label="…"`. There is no context, no hook and no
 * import for consumers — which means a component can never leave the cursor
 * stuck in a stale state because it forgot to reset on unmount.
 *
 * Position is tracked through motion values, so the cursor never triggers a
 * React render. State changes ride on `pointerover`, which fires when the
 * hovered element changes rather than on every pixel of movement.
 *
 * Renders nothing at all without a fine pointer or with reduced motion on;
 * the native cursor is only hidden once this one is actually live.
 * ═══════════════════════════════════════════════════════════════════════
 */

type CursorState = "default" | "view" | "drag" | "link" | "close";

const RING_SIZE: Record<CursorState, number> = {
  default: 8,
  view: 78,
  drag: 62,
  link: 34,
  close: 46,
};

export function Cursor() {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, spring.pointer);
  const y = useSpring(rawY, spring.pointer);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    // pointerover fires on element transitions, not continuously.
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const holder = target?.closest?.<HTMLElement>("[data-cursor]");

      if (holder) {
        const next = (holder.dataset.cursor ?? "default") as CursorState;
        setState(next in RING_SIZE ? next : "default");
        setLabel(holder.dataset.cursorLabel ?? null);
        return;
      }

      // Interactive elements get a subtle acknowledgement without being
      // individually annotated.
      const interactive = target?.closest?.("a, button, input, select, textarea, [role='button']");
      setState(interactive ? "link" : "default");
      setLabel(null);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled, rawX, rawY, visible]);

  // Only hide the native cursor once the replacement is genuinely running —
  // otherwise a failure here would leave the site with no cursor at all.
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.style.cursor = "none";
    return () => {
      document.documentElement.style.cursor = "";
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = RING_SIZE[state];
  const isDisc = state !== "default";

  return (
    <div
      data-cursor-root
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-cursor)] overflow-hidden"
    >
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center"
        style={{ x, y }}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={{
            width: size,
            height: size,
            scale: pressed ? 0.86 : 1,
            opacity: visible ? 1 : 0,
            backgroundColor: isDisc ? "var(--color-bone)" : "var(--color-bone)",
            mixBlendMode: isDisc ? "normal" : "difference",
          }}
          transition={{ duration: duration.base, ease: ease.outExpo }}
          style={{
            borderRadius: "50%",
            marginLeft: -size / 2,
            marginTop: -size / 2,
            // `difference` on the small dot keeps it legible over bone and ink
            // alike without any per-section logic.
            mixBlendMode: isDisc ? "normal" : "difference",
          }}
        >
          <AnimatePresence mode="wait">
            {label && isDisc ? (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: duration.fast, ease: ease.outExpo }}
                className="type-micro whitespace-nowrap text-[var(--color-ink)]"
              >
                {label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
