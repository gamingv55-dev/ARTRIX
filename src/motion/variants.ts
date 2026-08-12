import type { Variants } from "motion/react";
import { distance, duration, ease, stagger } from "./tokens";

/**
 * Reusable variant sets. Composing from these — rather than writing inline
 * animate props — is what makes the whole site feel like one piece of motion
 * design instead of a collection of separately-animated components.
 */

/* ── Images ────────────────────────────────────────────────────────────────
   The house reveal: the frame wipes open from the bottom while the image
   inside settles back from a slight overscale. Two elements moving at
   different rates is what gives it depth; a plain fade does not. Used by
   <Media reveal>. */

export const frameReveal: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: duration.cinematic, ease: ease.outExpo },
  },
};

export const imageSettle: Variants = {
  hidden: { scale: 1.12 },
  visible: {
    scale: 1,
    transition: { duration: 1.4, ease: ease.outExpo },
  },
};

/* ── Text ──────────────────────────────────────────────────────────────────
   Line masks. Each line sits in an overflow-hidden box and rises into place.
   Staggering by line, not by character, keeps long settings readable — a
   per-character reveal on a paragraph is noise. */

export const lineMaskGroup: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger.line, delayChildren: 0.05 },
  },
};

export const lineMaskItem: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: duration.slow, ease: ease.outExpo },
  },
};

/* ── Generic entrances ─────────────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: distance.text },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.outExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.outQuart } },
};

export const cardGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.card } },
};

export const cardItem: Variants = {
  hidden: { opacity: 0, y: distance.card },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.outExpo },
  },
};

/* ── Overlays & surfaces ───────────────────────────────────────────────── */

export const drawerPanel: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: duration.slow, ease: ease.inOutQuint } },
  exit: { x: "100%", transition: { duration: duration.base, ease: ease.inOutQuint } },
};

export const scrim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.standard } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.standard } },
};

/** Search overlay drops from the top edge rather than fading — it should feel
 *  like a panel arriving, not a modal appearing. */
export const overlayPanel: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0, transition: { duration: duration.slow, ease: ease.inOutQuint } },
  exit: { y: "-100%", transition: { duration: duration.base, ease: ease.inOutQuint } },
};

/* ── Page transition ───────────────────────────────────────────────────────
   Four columns sweep across, hold for a beat, then sweep off — the outgoing
   route is covered and the incoming one is uncovered by the same gesture.
   Kept under 700ms total: any longer and repeat navigation starts to feel
   like waiting rather than like pacing. */

export const transitionColumn: Variants = {
  hidden: { scaleY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: { duration: 0.42, ease: ease.inOutQuint, delay: i * 0.045 },
  }),
  exit: (i: number) => ({
    scaleY: 0,
    transition: { duration: 0.42, ease: ease.inOutQuint, delay: i * 0.045 },
  }),
};
