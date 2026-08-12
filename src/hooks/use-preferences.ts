"use client";

import { useEffect, useState } from "react";

/**
 * Environment and capability detection.
 *
 * All of these start at a conservative value on the server and during first
 * paint, then correct after mount. That ordering matters: it means the
 * expensive path (WebGL, custom cursor, smooth scroll) is opt-in as the
 * client proves it can handle it, rather than opt-out after it has already
 * rendered and janked.
 */

function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when the visitor has asked for reduced motion. Assume false until
 *  proven, then every motion system checks this before running. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** A real mouse, not a touch screen. Gates the cursor and hover affordances. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useBreakpoint(min: number): boolean {
  return useMediaQuery(`(min-width: ${min}px)`);
}

/**
 * Whether this device should run the WebGL hero.
 *
 * Gated on four things, all of which have to pass:
 *   - reduced motion is off
 *   - a fine pointer exists (the effect is pointer-driven; on touch it would
 *     render an extra GPU surface that nobody can interact with)
 *   - the viewport is desktop-sized
 *   - a WebGL2 context can actually be created
 *
 * Returns null while undecided so callers can render the static fallback
 * rather than flashing an empty canvas.
 */
export function useWebGLEligible(): boolean | null {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const isDesktop = useBreakpoint(1024);
  const [contextOk, setContextOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Probe once, on an offscreen canvas that is immediately discarded.
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
      setContextOk(Boolean(gl));
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setContextOk(false);
    }
  }, []);

  if (contextOk === null) return null;
  return contextOk && !reducedMotion && finePointer && isDesktop;
}
