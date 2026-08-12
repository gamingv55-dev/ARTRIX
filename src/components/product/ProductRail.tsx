"use client";

import { useDragScroll } from "@/hooks/use-drag-scroll";
import { cn, padIndex } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

/**
 * The horizontal drop rail.
 *
 * Built on a native `overflow-x` scroller, not a transform track pinned to
 * page scroll. The pinned version looks the same on a demo reel and is worse
 * in every other respect: it hijacks vertical scrolling, breaks touch
 * momentum, loses keyboard access, and confuses screen readers about where
 * they are on the page. Here, dragging is an enhancement layered on top of a
 * scroller that already works with a wheel, a trackpad, a swipe, Tab, and the
 * arrow keys.
 *
 * The scrubber underneath reflects real scroll position rather than driving
 * it, so it stays truthful no matter which input moved the rail.
 */
export function ProductRail({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  const { ref, isDragging, progress, canScroll, wasDragged, dragProps, scrollByPage } =
    useDragScroll<HTMLUListElement>();

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <ul
        ref={ref}
        {...dragProps}
        data-lenis-prevent
        tabIndex={0}
        aria-label="Drop 01 pieces"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollByPage(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollByPage(-1);
          }
        }}
        className={cn(
          "rail-scroll page-gutter flex gap-4 md:gap-5",
          // Snap on touch, where the gesture is discrete; free scrolling with a
          // trackpad, where snapping fights the input.
          "snap-x snap-mandatory md:snap-none",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab",
        )}
      >
        {products.map((product, i) => (
          <li
            key={product.id}
            className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[28vw] lg:w-[21vw] xl:w-[17vw]"
          >
            <ProductCard
              product={product}
              index={i}
              total={products.length}
              onNavigateGuard={wasDragged}
              sizes="(max-width: 640px) 68vw, (max-width: 768px) 42vw, (max-width: 1024px) 28vw, (max-width: 1280px) 21vw, 17vw"
              priority={i < 2}
            />
          </li>
        ))}
      </ul>

      {canScroll && (
        <div className="page-shell flex items-center justify-between gap-8">
          <span className="type-micro shrink-0 text-[var(--figure-muted)]">
            {padIndex(1)} &#8212; {padIndex(products.length)}
          </span>

          {/* Presentational: the list above is the accessible control. */}
          <div aria-hidden="true" className="relative h-px w-full max-w-[26rem] bg-[var(--rule)]">
            <div
              className="absolute inset-y-0 left-0 w-1/3 bg-[var(--figure)] transition-transform duration-150 ease-out"
              style={{ transform: `translateX(${progress * 200}%)` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
