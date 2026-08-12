"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { media } from "@/data/generated/media";
import { TextReveal } from "@/components/ui/Reveal";
import { Label } from "@/components/ui/Label";

/**
 * The impact moment.
 *
 * A sticky full-height frame that the page scrolls past while the print
 * detail slowly pushes in. It is the closest the site comes to a cinematic
 * device, and it earns the position by being the one place the artwork —
 * rather than the garment — is the subject.
 *
 * Implemented with position: sticky and two scroll-linked transforms. No pin
 * library, no scroll hijacking: the page keeps scrolling at its natural rate
 * and the frame simply stays put for a while, so a flick of the wheel still
 * moves you through it at the speed you asked for.
 */
export function PrintStudy() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const captionY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const veil = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.32, 0.6]);

  return (
    <section
      ref={ref}
      data-ground="ink"
      aria-labelledby="print-heading"
      // Two viewports tall: one for the frame to hold, one for it to release.
      className="relative h-[200svh] bg-[var(--color-ink)] text-[var(--color-bone)]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ scale }} className="absolute inset-0">
          <Image
            src={media["grillz-print"].src}
            alt="Macro detail of the halftone mouth print, dot structure clearly visible."
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={media["grillz-print"].blurDataURL}
            className="object-cover"
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: veil }}
          className="absolute inset-0 bg-[var(--color-ink)]"
        />

        <div className="page-shell relative flex h-full flex-col justify-end pb-[var(--spacing-band)]">
          <motion.div style={{ y: captionY }}>
            <Label className="text-[var(--color-chalk)]">The print</Label>
            <TextReveal
              as="h2"
              id="print-heading"
              lines={["A photograph pushed", "through a halftone", "until it fell apart."]}
              className="text-display-2 mt-5 max-w-[18ch] font-medium"
            />
            <p className="text-sm mt-6 max-w-[42ch] text-[var(--color-bone-dim)]">
              Enlarged past the point where the dots resolve back into an image. What is left is
              the structure of the print itself.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
