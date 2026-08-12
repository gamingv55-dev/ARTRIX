import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The solid action button — add to bag, checkout, subscribe.
 *
 * Square, full-bleed, tracked-out caps. The hover state is an inversion
 * driven by a wipe from the bottom rather than a colour transition, which
 * matches the mask language used by the reveals.
 */

type Variant = "solid" | "outline";

interface ButtonProps extends ComponentProps<"button"> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "solid",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "group relative isolate overflow-hidden px-6 py-4 type-label",
        "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
        "disabled:pointer-events-none disabled:opacity-35",
        fullWidth && "w-full",
        variant === "solid"
          ? "bg-[var(--figure)] text-[var(--ground)] hover:text-[var(--figure)]"
          : "border border-[var(--rule-strong)] text-[var(--figure)] hover:text-[var(--ground)]",
        className,
      )}
    >
      {/* Wipe layer. Sits behind the label and rises to fill on hover. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform",
          "duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
          "group-hover:scale-y-100 group-focus-visible:scale-y-100",
          variant === "solid" ? "bg-[var(--ground)]" : "bg-[var(--figure)]",
        )}
      />
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
