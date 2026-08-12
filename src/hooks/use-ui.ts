"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { spring } from "@/motion/tokens";
import { useFinePointer, useReducedMotion } from "./use-preferences";

/**
 * True only after the first client render. Anything driven by localStorage —
 * the bag count, most obviously — must wait for this or the server HTML and
 * the first client render disagree and React discards the tree.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/**
 * Freezes the page behind an overlay.
 *
 * Compensates for the vanishing scrollbar by padding the body, otherwise the
 * whole layout jumps sideways when the drawer opens. Also stops Lenis, which
 * would keep animating scroll position underneath the overlay.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement: html } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    html.classList.add("lenis-stopped");

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      html.classList.remove("lenis-stopped");
    };
  }, [locked]);
}

/** Calls back on Escape while `active`. Used by every dismissible surface. */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onEscape]);
}

/**
 * Traps Tab focus inside a container while it is open, and restores focus to
 * whatever was focused before on close. Required for the drawer and the search
 * overlay to be usable by keyboard at all.
 */
export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null,
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}

/**
 * Normalised pointer position across the viewport, as two spring-smoothed
 * motion values in the range -1..1.
 *
 * One listener for the whole page rather than one per parallax layer, and the
 * output is motion values so consumers never re-render on pointer movement.
 * Returns a locked 0,0 when reduced motion is on or there's no fine pointer.
 */
export function usePointerParallax(): { px: MotionValue<number>; py: MotionValue<number> } {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, spring.pointer);
  const py = useSpring(rawY, spring.pointer);

  useEffect(() => {
    if (reducedMotion || !finePointer) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion, finePointer, rawX, rawY]);

  return { px, py };
}
