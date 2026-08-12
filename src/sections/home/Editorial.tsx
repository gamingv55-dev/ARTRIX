"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { media } from "@/data/generated/media";
import { Media } from "@/components/ui/Media";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Label } from "@/components/ui/Label";

/**
 * The calm section. After the ink band, the page returns to bone and slows
 * down: one photograph, one statement, one detail crop.
 *
 * The two images move at different rates as the section passes, which is the
 * only motion here. Everything else simply arrives. Following an impact
 * section with another impact section is what flattens a page — this is the
 * pause that makes the next one land.
 */
export function Editorial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const tallY = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const detailY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section
      ref={ref}
      data-ground="bone"
      aria-labelledby="editorial-heading"
      className="bg-[var(--color-bone)] py-[var(--spacing-band-lg)]"
    >
      <div className="page-shell grid-12 items-start gap-y-14">
        <motion.figure style={{ y: tallY }} className="col-span-12 md:col-span-6 lg:col-span-5">
          <Media
            image={{
              ...media["roman-worn"],
              alt: "Roman Tee photographed from behind against a concrete wall.",
            }}
            ratio="4 / 5"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 42vw"
          />
          <figcaption className="mt-3 type-micro text-[var(--color-smoke)]">
            Roman Tee &#8212; Black / 240 GSM
          </figcaption>
        </motion.figure>

        <div className="col-span-12 flex flex-col md:col-span-6 lg:col-span-6 lg:col-start-7 lg:pt-[8vw]">
          <Reveal>
            <Label>Drop 01 / Editorial</Label>
          </Reveal>

          <TextReveal
            as="h2"
            id="editorial-heading"
            lines={["Made in small numbers.", "Worn by people who", "do not want what", "everyone else is wearing."]}
            className="text-display-2 mt-6 font-medium text-[var(--color-ink)]"
            delay={0.08}
          />

          <Reveal delay={0.2} className="mt-8">
            <ArrowLink href="/lookbook" className="w-fit">
              View the lookbook
            </ArrowLink>
          </Reveal>

          <motion.figure style={{ y: detailY }} className="mt-14 max-w-[26rem]">
            <Media
              image={{
                ...media["roman-print"],
                alt: "Macro detail of the hand-painted watch dial on the Roman Tee.",
              }}
              ratio="4 / 5"
              sizes="(max-width: 768px) 100vw, 26rem"
            />
            <figcaption className="mt-3 type-micro text-[var(--color-smoke)]">
              Print detail / painted in gouache
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
