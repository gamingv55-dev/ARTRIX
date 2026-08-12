"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { media } from "@/data/generated/media";
import { productionSpec, site } from "@/config/site";
import { usePointerParallax } from "@/hooks/use-ui";
import { useWebGLEligible } from "@/hooks/use-preferences";
import { duration, ease } from "@/motion/tokens";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { DashedRule } from "@/components/ui/Rule";
import { SpecStrip } from "@/components/ui/Label";

// Kept out of the main bundle: the shader and its renderer are only fetched
// on devices that have already been cleared to run them.
const HeroCanvas = dynamic(
  () => import("@/components/visual/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false },
);

const HERO_IMAGE = media["grillz-portrait"];

/**
 * The opening frame.
 *
 * The composition is one idea: the wordmark runs the full width of the page
 * and the photograph is laid over its right-hand end, cropping it. Nothing is
 * centred, nothing is contained, and the type is allowed to run off the edge —
 * which is what makes it read as a printed spread rather than a web hero.
 *
 * Three depths move independently. On pointer, the wordmark and the photograph
 * drift by different small amounts in opposite directions, which produces
 * parallax without any element visibly sliding. On scroll, the whole frame
 * settles downward and fades slightly, so the section below arrives over it
 * rather than after it.
 *
 * The photograph is a real <Image> with `priority` — it is the LCP element and
 * must not depend on JavaScript. The WebGL layer, when it runs at all, draws
 * on top of an already-painted image.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { px, py } = usePointerParallax();
  const webglEligible = useWebGLEligible();
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll depths. Small numbers on purpose — the hero should sink, not slide.
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const panelScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Pointer depths, in pixels of travel at the extremes of the viewport.
  const wordmarkX = useTransform(px, [-1, 1], [14, -14]);
  const panelX = useTransform(px, [-1, 1], [-20, 20]);
  const panelPointerY = useTransform(py, [-1, 1], [-12, 12]);

  const onCanvasReady = useCallback(() => setCanvasReady(true), []);
  const onCanvasFail = useCallback(() => setCanvasFailed(true), []);

  const useCanvas = webglEligible === true && !canvasFailed;

  return (
    <section
      ref={sectionRef}
      data-ground="bone"
      aria-label="Drop 01"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--color-bone)] pt-16"
    >
      <div className="relative flex flex-1 flex-col lg:block">
        {/* ── Wordmark ──────────────────────────────────────────────────
            Sits at the back of the stack. Clipped by the photograph on
            desktop; full-bleed and uncropped on mobile, where there is no
            room to overlap. */}
        <motion.div
          style={{ y: wordmarkY, x: wordmarkX }}
          className="pointer-events-none relative z-0 w-full select-none pt-4 lg:absolute lg:top-0 lg:pt-6"
        >
          <motion.h1
            initial={{ y: "16%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 1.3, ease: ease.outExpo, delay: 0.1 }}
            className="type-wordmark px-[max(0px,calc(var(--spacing-gutter)-0.06em))] text-[var(--color-ink)]"
          >
            {site.name}
          </motion.h1>
        </motion.div>

        {/* ── Photograph ────────────────────────────────────────────────
            Overlaps the lower portion of the letterforms rather than a
            vertical slice of them.

            The reference this is adapted from puts a cut-out figure over the
            wordmark, so the type reads continuously through the empty
            background around the body. These photographs are full frames with
            real backgrounds — laying one over the right-hand end of the word
            would simply delete two letters and read as a mistake. Cropping
            horizontally instead keeps every glyph identifiable while still
            putting type and image in the same physical space.

            The top offset tracks the wordmark's cap height in vw so the bite
            stays at the same proportion of the letterforms at every width. */}
        <motion.div
          style={{ y: panelY, scale: panelScale }}
          className="relative z-10 mt-6 h-[46svh] w-full origin-top sm:h-[54svh] lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:h-auto lg:w-[40vw] lg:top-[calc(4.5rem+10.5vw)] xl:w-[37vw]"
        >
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.4, ease: ease.outExpo, delay: 0.25 }}
            className="relative h-full w-full overflow-hidden"
          >
            <motion.div style={{ x: panelX, y: panelPointerY }} className="absolute -inset-6">
              <Image
                src={HERO_IMAGE.src}
                alt="Grillz Tee in black, photographed on location in Varna."
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 43vw"
                placeholder="blur"
                blurDataURL={HERO_IMAGE.blurDataURL}
                className="object-cover object-[50%_28%]"
              />

              {useCanvas && (
                <HeroCanvas
                  src={HERO_IMAGE.src}
                  onReady={onCanvasReady}
                  onFail={onCanvasFail}
                  className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
                    canvasReady ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Statement ─────────────────────────────────────────────────
            Anchored to the bottom-left of the frame on desktop, below the
            photograph on mobile. Constrained so it can never run under the
            image panel at any width. */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-20 mt-auto w-full pt-10 pb-8 lg:absolute lg:bottom-0 lg:mt-0 lg:max-w-[54vw] lg:pb-14"
        >
          <div className="page-gutter">
            <motion.h2
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: duration.cinematic, ease: ease.outExpo, delay: 0.5 }}
              className="text-display-1 max-w-[14ch] font-medium text-[var(--color-ink)]"
            >
              {site.tagline}
            </motion.h2>

            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: duration.slow, ease: ease.outExpo, delay: 0.75 }}
              className="mt-8 flex flex-col gap-4"
            >
              <Magnetic strength={0.2} padding={16}>
                <ArrowLink href={`/drop/${site.currentDropSlug}`} className="w-fit">
                  Explore Drop 01
                </ArrowLink>
              </Magnetic>
              <span className="type-micro text-[var(--color-smoke)]">50 pieces per design</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Spec strip ───────────────────────────────────────────────────
          The dashed rule runs the full page width and passes behind the
          photograph, tying the two halves of the composition together. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.slow, delay: 1 }}
        className="relative z-20 shrink-0"
      >
        <div className="page-gutter">
          <DashedRule className="text-[var(--color-ink)]" />
        </div>
        <div className="page-gutter py-4">
          <SpecStrip items={productionSpec} />
        </div>
      </motion.div>
    </section>
  );
}
