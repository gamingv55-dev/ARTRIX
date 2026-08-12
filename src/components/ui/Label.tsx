import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The small tracked-out caps used for section markers, indices and spec text.
 * Muted by default: these are annotations on the content, never the content.
 */
export function Label({
  children,
  className,
  tone = "muted",
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  tone?: "muted" | "strong";
  as?: "span" | "p" | "h1" | "h2" | "div";
}) {
  return (
    <Tag
      className={cn(
        "type-label",
        tone === "muted" ? "text-[var(--figure-muted)]" : "text-[var(--figure)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * The slash-separated production credits — "DROP 01 / ORIGINAL ARTWORK /
 * 240 GSM …". Wraps to two lines on narrow screens rather than scrolling,
 * since it is read, not navigated.
 */
export function SpecStrip({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-3">
          <span className="type-micro text-[var(--figure-muted)]">{item}</span>
          {i < items.length - 1 && (
            <span aria-hidden="true" className="type-micro text-[var(--figure-muted)] opacity-45">
              /
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
