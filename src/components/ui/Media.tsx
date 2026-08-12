"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { frameReveal, imageSettle } from "@/motion/variants";
import { viewport } from "@/motion/tokens";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface MediaProps {
  image: Pick<ProductImage, "src" | "alt" | "width" | "height" | "blurDataURL">;
  /** CSS aspect-ratio for the frame. The image always cover-fills it.
   *  Ignored when `fillParent` is set. */
  ratio?: string;
  /** Stretch to the parent's box instead of holding a ratio. For full-bleed
   *  campaign frames whose height is set by the section, not the image. */
  fillParent?: boolean;
  objectPosition?: string;
  /** Responsive sizes hint. Getting this right is the single biggest lever on
   *  image weight — always pass the real rendered width. */
  sizes: string;
  priority?: boolean;
  /** Run the house mask reveal when the frame scrolls into view. */
  reveal?: boolean;
  /** Scale the image up slightly on hover of an ancestor marked `group`. */
  hoverZoom?: boolean;
  className?: string;
  imageClassName?: string;
}

/**
 * Every photograph on the site goes through here.
 *
 * Three things it guarantees that a bare <Image> does not:
 *   1. a fixed-ratio frame, so nothing shifts while images decode (CLS)
 *   2. the house reveal — frame wipes open, image settles back from overscale
 *   3. a graceful failure: if the file 404s the frame stays, tinted, rather
 *      than collapsing the layout around a broken image
 */
export function Media({
  image,
  ratio = "2 / 3",
  fillParent = false,
  objectPosition,
  sizes,
  priority = false,
  reveal = true,
  hoverZoom = false,
  className,
  imageClassName,
}: MediaProps) {
  const [failed, setFailed] = useState(false);

  const frame = (
    <div
      className={cn("media-frame", fillParent && "h-full w-full", className)}
      style={fillParent ? undefined : { aspectRatio: ratio }}
    >
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-[var(--ground-sunk)]">
          <span className="type-micro text-[var(--figure-muted)]">Image unavailable</span>
        </div>
      ) : (
        <motion.div
          className="absolute inset-0"
          variants={reveal ? imageSettle : undefined}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            placeholder={image.blurDataURL ? "blur" : "empty"}
            blurDataURL={image.blurDataURL}
            onError={() => setFailed(true)}
            style={objectPosition ? { objectPosition } : undefined}
            className={cn(
              "object-cover drag-none",
              hoverZoom &&
                "transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]",
              imageClassName,
            )}
          />
        </motion.div>
      )}
    </div>
  );

  if (!reveal) return frame;

  return (
    <motion.div
      variants={frameReveal}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className="relative"
    >
      {frame}
    </motion.div>
  );
}
