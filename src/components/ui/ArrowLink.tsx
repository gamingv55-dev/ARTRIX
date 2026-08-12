"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The primary call to action: tracked-out caps, an arrow that steps right on
 * hover, and the dashed rule underneath.
 *
 * The whole identity's CTA language is this one component, so a link never
 * has to reinvent its own hover behaviour. The arrow is a text glyph rather
 * than an icon — it inherits weight and colour for free, and it means no icon
 * request on first paint.
 */

interface ArrowLinkProps extends Omit<ComponentProps<typeof Link>, "children"> {
  children: ReactNode;
  /** Hide the dashed rule where the surrounding layout already provides one. */
  underline?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ArrowLink({
  children,
  underline = true,
  size = "md",
  className,
  ...props
}: ArrowLinkProps) {
  return (
    <Link
      {...props}
      className={cn("group inline-flex flex-col gap-2 text-[var(--figure)]", className)}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2.5",
          size === "md" ? "type-label" : "type-micro",
        )}
      >
        {children}
        <span
          aria-hidden="true"
          className="inline-block translate-x-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5"
        >
          &#8594;
        </span>
      </span>
      {underline && (
        <span
          aria-hidden="true"
          className="rule-dashed origin-left scale-x-100 text-[var(--figure)] transition-opacity duration-[var(--dur-base)] group-hover:opacity-80"
        />
      )}
    </Link>
  );
}

/** Same treatment for actions that aren't navigation. */
export function ArrowButton({
  children,
  underline = true,
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & {
  children: ReactNode;
  underline?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      {...props}
      className={cn(
        "group inline-flex flex-col gap-2 text-left text-[var(--figure)] disabled:opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2.5",
          size === "md" ? "type-label" : "type-micro",
        )}
      >
        {children}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5"
        >
          &#8594;
        </span>
      </span>
      {underline && (
        <span aria-hidden="true" className="rule-dashed text-[var(--figure)]" />
      )}
    </button>
  );
}
