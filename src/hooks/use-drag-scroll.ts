"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Click-and-drag scrolling for a natively-scrollable horizontal rail.
 *
 * The rail is a real `overflow-x: auto` element, which is the whole point:
 * touch momentum, trackpad gestures, keyboard arrows, scroll-anchoring and
 * screen-reader navigation all keep working for free. This hook adds pointer
 * dragging on top for mouse users, and reports progress so a scrubber can be
 * drawn — it never takes ownership of the scroll position itself.
 *
 * Rejected alternative: a transform-driven rail pinned with ScrollTrigger.
 * It looks identical, costs a scroll-hijack, and breaks all of the above.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  const drag = useRef({ startX: 0, startScroll: 0, pointerId: -1, moved: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScroll(max > 4);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const onPointerDown = useCallback((event: React.PointerEvent<T>) => {
    // Mouse only. Touch already has native momentum, and pen should not be
    // hijacked either.
    if (event.pointerType !== "mouse" || !ref.current) return;

    drag.current = {
      startX: event.clientX,
      startScroll: ref.current.scrollLeft,
      pointerId: event.pointerId,
      moved: 0,
    };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || drag.current.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));

    // Capture only once the gesture is unambiguously a drag, so a plain click
    // on a card still reaches the link underneath.
    if (drag.current.moved > 4 && !el.hasPointerCapture(event.pointerId)) {
      el.setPointerCapture(event.pointerId);
    }

    if (drag.current.moved > 4) {
      el.scrollLeft = drag.current.startScroll - dx;
    }
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<T>) => {
    const el = ref.current;
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
    drag.current.pointerId = -1;
    setIsDragging(false);
  }, []);

  /** True if the pointer travelled far enough that the release should not
   *  count as a click. Card links call this to suppress navigation. */
  const wasDragged = useCallback(() => drag.current.moved > 4, []);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return {
    ref,
    isDragging,
    progress,
    canScroll,
    wasDragged,
    scrollByPage,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
