"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Media } from "@/components/ui/Media";
import { padIndex } from "@/lib/utils";
import type { ProductImage } from "@/types";

/**
 * Product photography on the detail page.
 *
 * Two genuinely different layouts rather than one responsive compromise:
 *
 *   desktop — a vertical column the page scrolls through, each frame revealing
 *             as it arrives. The product information sits sticky alongside, so
 *             browsing the images never costs access to the buy controls.
 *   mobile  — a full-bleed horizontal snap carousel with a counter. Swiping is
 *             the native gesture; a stacked column on a phone would mean five
 *             screens of scrolling before reaching the size selector.
 *
 * The first frame carries `data-flight-source` — the add-to-bag animation
 * reads its position from the DOM at click time rather than through a ref, so
 * nothing has to be threaded across the server/client boundary.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);

  if (images.length === 0) {
    return (
      <div
        className="media-frame grid place-items-center border border-dashed border-[var(--rule-strong)]"
        style={{ aspectRatio: "2 / 3" }}
      >
        <span className="type-micro text-[var(--figure-muted)]">Photography in production</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: swipe carousel ─────────────────────────────────────── */}
      <div className="lg:hidden">
        <ul
          ref={trackRef}
          data-lenis-prevent
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="rail-scroll flex snap-x snap-mandatory"
        >
          {images.map((image, i) => (
            <li key={image.src} className="w-full shrink-0 snap-center">
              <div
                className="media-frame"
                style={{ aspectRatio: "2 / 3" }}
                {...(i === 0 ? { "data-flight-source": "" } : {})}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  placeholder={image.blurDataURL ? "blur" : "empty"}
                  blurDataURL={image.blurDataURL}
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="page-gutter mt-3 flex items-center justify-between">
          <span className="type-micro text-[var(--figure-muted)]">
            {padIndex(active + 1)} / {padIndex(images.length)}
          </span>
          {images[active]?.caption && (
            <span className="type-micro text-[var(--figure-muted)]">
              {images[active]?.caption}
            </span>
          )}
        </div>
      </div>

      {/* ── Desktop: scrolling column ──────────────────────────────────── */}
      <ul className="hidden flex-col gap-3 lg:flex">
        {images.map((image, i) => (
          <li key={image.src}>
            {i === 0 ? (
              // First frame is the LCP candidate — rendered without the reveal
              // mask so it paints immediately rather than waiting on an
              // intersection callback.
              <div
                className="media-frame"
                style={{ aspectRatio: "2 / 3" }}
                data-flight-source=""
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1280px) 55vw, 48vw"
                  priority
                  placeholder={image.blurDataURL ? "blur" : "empty"}
                  blurDataURL={image.blurDataURL}
                  className="object-cover"
                />
              </div>
            ) : (
              <figure>
                <Media
                  image={image}
                  ratio={image.role === "detail" ? "5 / 4" : "2 / 3"}
                  sizes="(max-width: 1280px) 55vw, 48vw"
                />
                {image.caption && (
                  <figcaption className="mt-3 type-micro text-[var(--figure-muted)]">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </li>
        ))}
      </ul>

      <span className="sr-only">
        {images.length} photographs of {productName}
      </span>
    </>
  );
}

/**
 * The frame the add-to-bag flight departs from.
 *
 * Located by attribute rather than by ref: the button that reads this lives in
 * a sibling column, and threading a ref between two client components through
 * a server parent would mean lifting both into one client boundary.
 */
export const FLIGHT_SOURCE_SELECTOR = "[data-flight-source]";

export function measureFlightSource(): DOMRect | null {
  if (typeof document === "undefined") return null;
  // Whichever copy is laid out — mobile carousel or desktop column — the other
  // is display:none and reports a zero rect, so the visible one is picked.
  const candidates = document.querySelectorAll<HTMLElement>(FLIGHT_SOURCE_SELECTOR);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  return null;
}
