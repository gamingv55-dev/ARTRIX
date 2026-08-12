import Link from "next/link";
import { site } from "@/config/site";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";

/**
 * 404.
 *
 * Given the same treatment as a real page rather than a system message —
 * a wrong URL is often someone's first impression, usually from a stale link.
 */
export default function NotFound() {
  return (
    <div
      data-ground="ink"
      className="flex min-h-screen flex-col justify-between bg-[var(--color-ink)] pt-32 text-[var(--color-bone)]"
    >
      <div className="page-shell">
        <Label className="text-[var(--color-chalk)]">Error 404</Label>
        <h1 className="text-display-1 mt-6 max-w-[16ch] font-medium">
          This page does not exist.
        </h1>
        <p className="text-lead mt-6 max-w-[40ch] text-[var(--color-bone-dim)]">
          It may have been a piece that sold through, or a link that was never right.
        </p>

        <DashedRule className="mt-12" />

        <nav aria-label="Recovery" className="flex flex-wrap gap-x-10 gap-y-4 py-6">
          <Link href="/" className="link-wipe type-label">
            Home
          </Link>
          <Link href="/shop" className="link-wipe type-label">
            Shop
          </Link>
          <Link href={`/drop/${site.currentDropSlug}`} className="link-wipe type-label">
            Drop 01
          </Link>
          <Link href="/lookbook" className="link-wipe type-label">
            Lookbook
          </Link>
        </nav>
      </div>

      <div aria-hidden="true" className="select-none overflow-hidden">
        <span className="type-wordmark block translate-y-[0.16em] px-[max(0px,calc(var(--spacing-gutter)-0.06em))] text-[var(--color-ink-raised)]">
          {site.name}
        </span>
      </div>
    </div>
  );
}
