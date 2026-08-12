/**
 * ═══════════════════════════════════════════════════════════════════════
 * MOTION TOKENS
 *
 * The JS half of the motion system. These mirror the CSS custom properties
 * in src/styles/tokens.css exactly — if you change a duration or curve, change
 * it in both places or the interface will drift apart.
 *
 * No component should write a raw duration, curve or spring config. If a value
 * isn't here, it either belongs here or the animation doesn't belong.
 *
 * Rationale for the curve choices: docs/motion.md
 * ═══════════════════════════════════════════════════════════════════════
 */

/** Seconds — Framer Motion's unit. CSS uses the ms equivalents. */
export const duration = {
  micro: 0.16,
  fast: 0.26,
  base: 0.42,
  slow: 0.72,
  cinematic: 1.1,
} as const;

/**
 * One easing family. `outExpo` is the house curve — it leaves quickly and
 * settles slowly, which reads as confident rather than springy. `inOutQuint`
 * is for things that travel across the screen and must feel weighted at both
 * ends (page transitions, the drawer).
 */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inOutQuint: [0.83, 0, 0.17, 1],
  standard: [0.4, 0, 0.2, 1],
} as const;

/**
 * Springs are used only where a gesture is being tracked and the motion should
 * feel physical — magnetic buttons, cursor follow, drag release. Never for
 * entrances; a spring entrance is where "premium" turns into "bouncy".
 */
export const spring = {
  /** Cursor and pointer-tracked parallax. Fast, almost no overshoot. */
  pointer: { stiffness: 420, damping: 42, mass: 0.6 },
  /** Magnetic elements pulling toward the cursor. */
  magnetic: { stiffness: 260, damping: 22, mass: 0.7 },
  /** Larger surfaces settling — drawer, overlay panels. */
  surface: { stiffness: 210, damping: 30, mass: 1 },
  /** Numeric counters, progress bars. Heavily damped, no overshoot at all. */
  readout: { stiffness: 180, damping: 34, mass: 1 },
} as const;

/** Stagger intervals, in seconds. */
export const stagger = {
  tight: 0.035,
  line: 0.06,
  card: 0.08,
  section: 0.12,
} as const;

/**
 * How far an element travels on a reveal. Small on purpose — long travel
 * distances read as a slideshow, not as editorial.
 */
export const distance = {
  text: 24,
  card: 40,
  section: 64,
} as const;

/** Shared viewport config so every scroll reveal fires at the same threshold. */
export const viewport = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -12% 0px",
} as const;
