"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { primaryNav, site } from "@/config/site";
import { useHeaderState } from "@/hooks/use-header-state";
import { duration, ease } from "@/motion/tokens";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/Magnetic";
import { BagButton } from "@/components/commerce/BagButton";
import { MobileNav } from "./MobileNav";

const HEADER_HEIGHT = 64;

/**
 * Floating header.
 *
 * Sits over the content rather than above it, and adopts the ground of
 * whichever band is passing beneath — so it stays legible across the
 * alternating bone/ink sections without any per-page configuration.
 *
 * Two states: open over the hero, and compact once scrolled, where a rule and
 * a backdrop appear and the wordmark slides into the left slot. The slot is
 * reserved at full width from the start so the nav never shifts sideways when
 * the mark arrives.
 */
export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();
  const { ground, scrolled } = useHeaderState(HEADER_HEIGHT);
  const [menuOpen, setMenuOpen] = useState(false);

  // The home hero owns the wordmark, so the header's copy stays hidden until
  // the hero has scrolled away. Everywhere else it is the only mark on screen.
  const isHome = pathname === "/";
  const showMark = !isHome || scrolled;

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-boot)] focus:bg-[var(--color-ink)] focus:px-4 focus:py-3 focus:type-label focus:text-[var(--color-bone)]"
      >
        Skip to content
      </a>

      <header
        data-ground={ground}
        style={{ height: HEADER_HEIGHT }}
        className={cn(
          "fixed inset-x-0 top-0 z-[var(--z-header)] flex items-center",
          "text-[var(--figure)] transition-colors duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
        )}
      >
        {/* Backdrop and rule fade in together on scroll. Kept as a sibling so
            the header itself never animates background-color, which would
            force a repaint of everything inside it. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 border-b transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
            "bg-[var(--ground)]/88 border-[var(--rule)] backdrop-blur-[6px]",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />

        <nav
          aria-label="Primary"
          className="page-shell flex w-full items-center justify-between gap-6"
        >
          <div className="flex items-center gap-8">
            {/* Fixed-width slot: reserved whether or not the mark is visible. */}
            <div className="w-[74px] shrink-0 md:w-[86px]">
              <AnimatePresence>
                {showMark && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: duration.base, ease: ease.outExpo }}
                  >
                    <Link
                      href="/"
                      aria-label={`${site.name} — home`}
                      className="type-label font-semibold tracking-[0.22em] text-[var(--figure)]"
                    >
                      {site.name}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ul className="hidden items-center gap-7 md:flex">
              {primaryNav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Magnetic strength={0.22} padding={8}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "link-wipe type-label",
                          active ? "text-[var(--figure)]" : "text-[var(--figure)]/70 hover:text-[var(--figure)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </Magnetic>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-5 md:gap-7">
            <button
              type="button"
              onClick={onOpenSearch}
              className="link-wipe type-label text-[var(--figure)]/70 transition-colors hover:text-[var(--figure)]"
            >
              Search
            </button>

            <Magnetic strength={0.24} padding={8}>
              <BagButton />
            </Magnetic>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="type-label text-[var(--figure)] md:hidden"
            >
              Menu
            </button>
          </div>
        </nav>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={() => {
          setMenuOpen(false);
          onOpenSearch();
        }}
      />
    </>
  );
}
