"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cardGroup, cardItem, fadeUp, lineMaskGroup, lineMaskItem } from "@/motion/variants";
import { viewport } from "@/motion/tokens";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrances.
 *
 * Everything on the site enters through one of these, which is what keeps the
 * reveal language consistent across sections written weeks apart. All of them
 * resolve to their finished state under prefers-reduced-motion — the CSS in
 * globals.css collapses the durations rather than cancelling the animation, so
 * content can never be stranded at opacity 0.
 */

/**
 * Motion components are created once at module scope. Calling motion.create()
 * inside a render would mint a new component type on every pass, so React
 * would unmount and remount the subtree each time — losing the animation it
 * was in the middle of, along with any focus or scroll state inside it.
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  span: motion.span,
  p: motion.p,
  ul: motion.ul,
  li: motion.li,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  figure: motion.figure,
} as const;

type Tag = keyof typeof MOTION_TAGS;

interface BaseProps {
  children: ReactNode;
  as?: Tag;
  className?: string;
}

/** A single element fading up into place. */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  variants = fadeUp,
  className,
}: BaseProps & { delay?: number; variants?: Variants }) {
  const Component = MOTION_TAGS[as];
  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/** Wraps a list so <RevealItem> children enter in sequence. */
export function RevealGroup({ children, as = "div", className }: BaseProps) {
  const Component = MOTION_TAGS[as];
  return (
    <Component
      className={className}
      variants={cardGroup}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ children, as = "div", className }: BaseProps) {
  const Component = MOTION_TAGS[as];
  return (
    <Component className={className} variants={cardItem}>
      {children}
    </Component>
  );
}

/**
 * Line-masked heading.
 *
 * Takes one string per visual line. The split is authored rather than measured
 * because where a headline breaks is an art-direction decision — automatic
 * wrapping would re-flow at every breakpoint and put the mask edge in a
 * different place each time.
 */
export function TextReveal({
  lines,
  as = "h2",
  className,
  lineClassName,
  delay = 0,
  id,
}: {
  lines: string[];
  as?: Tag;
  className?: string;
  lineClassName?: string;
  delay?: number;
  id?: string;
}) {
  const Component = MOTION_TAGS[as];

  return (
    <Component
      id={id}
      className={className}
      variants={lineMaskGroup}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ delayChildren: delay }}
    >
      {lines.map((line, i) => (
        // The clip box needs vertical slack or descenders get shaved off.
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span className={cn("block", lineClassName)} variants={lineMaskItem}>
            {/* Each line is a separate block element, so the accessible name
                concatenates them with no separator — "smallnumbers of things".
                The explicit trailing space fixes the announced text and cannot
                affect layout, since trailing whitespace in a block collapses. */}
            {i < lines.length - 1 ? `${line} ` : line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
