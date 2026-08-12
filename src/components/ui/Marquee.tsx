"use client";

import { cn } from "@/lib/utils";

/**
 * A slow horizontal ticker.
 *
 * Pure CSS: a duplicated track translated by exactly -50% loops seamlessly,
 * and the compositor handles it without JavaScript touching a frame. The
 * duplicate is aria-hidden so the line is announced once, not twice, and the
 * whole thing stops dead under prefers-reduced-motion (handled in globals.css
 * via the [data-marquee] hook).
 *
 * Used once, as the quiet beat between the hero and the drop rail. A second
 * one on the same page would turn a device into a tic.
 */
export function Marquee({
  items,
  speed = 48,
  className,
}: {
  items: readonly string[];
  /** Seconds for one full pass. Higher is slower. */
  speed?: number;
  className?: string;
}) {
  const track = (
    <ul className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="type-label text-[var(--figure-muted)]">{item}</span>
          <span aria-hidden="true" className="px-6 text-[var(--figure-muted)] opacity-40">
            &#9679;
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        data-marquee
        className="flex animate-[atrix-marquee_linear_infinite] will-change-transform"
        style={{ animationDuration: `${speed}s` }}
      >
        {track}
        <div aria-hidden="true" className="flex">
          {track}
        </div>
      </div>
    </div>
  );
}
