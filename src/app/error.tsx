"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";

/**
 * Route-level error boundary.
 *
 * Offers a retry before offering an exit — most render errors here would be a
 * transient data or network failure, and `reset()` re-renders the segment
 * without a full page load.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with a real error reporter (Sentry, etc.) when one is added.
    console.error(error);
  }, [error]);

  return (
    <div
      data-ground="ink"
      className="flex min-h-screen flex-col justify-center bg-[var(--color-ink)] text-[var(--color-bone)]"
    >
      <div className="page-shell">
        <Label className="text-[var(--color-chalk)]">Something broke</Label>
        <h1 className="text-display-2 mt-6 max-w-[18ch] font-medium">
          That did not load properly.
        </h1>
        <p className="text-lead mt-6 max-w-[42ch] text-[var(--color-bone-dim)]">
          The fault is on our side, not yours. Try again — if it keeps happening the shop is
          still reachable.
        </p>

        {error.digest && (
          <p className="type-micro mt-6 text-[var(--color-chalk)]">Reference {error.digest}</p>
        )}

        <DashedRule className="mt-12" />

        <div className="flex flex-wrap gap-x-10 gap-y-4 py-6">
          <button type="button" onClick={reset} className="link-wipe type-label">
            Try again
          </button>
          <Link href="/" className="link-wipe type-label">
            Home
          </Link>
          <Link href="/shop" className="link-wipe type-label">
            Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
