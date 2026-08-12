"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { ease, spring } from "@/motion/tokens";
import { useReducedMotion } from "@/hooks/use-preferences";

const SESSION_KEY = "atrix.booted";

/**
 * First-load sequence.
 *
 * The wordmark, a counter, and a rule that fills — then the whole panel lifts
 * away as a mask, handing off to the hero's own reveal.
 *
 * Constrained deliberately:
 *   - roughly 1.1s, and it does not gate anything; the page behind it is
 *     already rendered and interactive underneath
 *   - shown once per session, not once per navigation
 *   - skipped entirely under reduced motion
 *
 * A loading screen that a returning visitor sits through on every page view is
 * a tax, not an experience. This one is a curtain going up, and it goes up
 * whether or not the audience is watching.
 */
export function BootSequence() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const progress = useMotionValue(0);
  const smoothed = useSpring(progress, spring.readout);
  const percent = useTransform(smoothed, (v) => String(Math.round(v)).padStart(3, "0"));
  const barScale = useTransform(smoothed, (v) => v / 100);

  useEffect(() => {
    setMounted(true);

    if (reducedMotion) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);

    // Stepped rather than linear: a counter that ticks in uneven jumps reads
    // as something actually loading, where a smooth ramp reads as a progress
    // bar with nothing behind it.
    const steps = [
      { at: 60, value: 34 },
      { at: 320, value: 61 },
      { at: 560, value: 79 },
      { at: 760, value: 94 },
      { at: 900, value: 100 },
    ];
    const timers = steps.map((s) => window.setTimeout(() => progress.set(s.value), s.at));
    const done = window.setTimeout(() => setVisible(false), 1180);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [reducedMotion, progress]);

  // Nothing is rendered on the server: the panel would be in the static HTML
  // and would flash for anyone who has already seen it this session.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          aria-hidden="true"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, ease: ease.inOutQuint }}
          className="fixed inset-0 z-[var(--z-boot)] flex flex-col justify-between bg-[var(--color-ink)] px-[var(--spacing-gutter)] py-8 text-[var(--color-bone)]"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="type-label"
          >
            Varna 2026
          </motion.span>

          <div className="flex items-end justify-between gap-6">
            <motion.span
              initial={{ y: "18%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, ease: ease.outExpo }}
              className="type-wordmark block text-[var(--color-bone)]"
            >
              {site.name}
            </motion.span>
          </div>

          <div className="flex items-center gap-5">
            <motion.span className="type-data text-[var(--color-chalk)]">{percent}</motion.span>
            <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-bone)_20%,transparent)]">
              <motion.div
                style={{ scaleX: barScale, transformOrigin: "left" }}
                className="h-px w-full bg-[var(--color-bone)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
