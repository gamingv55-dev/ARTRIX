"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { footerNav, primaryNav, site } from "@/config/site";
import { duration, ease, stagger } from "@/motion/tokens";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "@/hooks/use-ui";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";

/**
 * Full-screen mobile navigation.
 *
 * Designed for the medium rather than shrunk from the desktop bar: the links
 * are set at display size, sit in the lower half of the screen where a thumb
 * reaches, and enter on a line mask so opening the menu is itself a piece of
 * the motion language.
 */
export function MobileNav({
  open,
  onClose,
  onOpenSearch,
}: {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}) {
  useLockBodyScroll(open);
  useEscapeKey(open, onClose);
  const trapRef = useFocusTrap(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={trapRef}
          id="mobile-nav"
          data-ground="ink"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: duration.slow, ease: ease.inOutQuint }}
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-[var(--color-ink)] text-[var(--color-bone)] md:hidden"
        >
          <div className="page-shell flex h-16 shrink-0 items-center justify-between">
            <span className="type-label font-semibold tracking-[0.22em]">{site.name}</span>
            <button type="button" onClick={onClose} className="type-label">
              Close
            </button>
          </div>

          <motion.nav
            aria-label="Mobile"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: stagger.line, delayChildren: 0.18 } } }}
            className="page-shell mt-auto flex flex-col gap-1 pb-[max(2.5rem,env(safe-area-inset-bottom))]"
          >
            {primaryNav.map((item) => (
              <span key={item.href} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  variants={{
                    hidden: { y: "110%" },
                    visible: { y: "0%", transition: { duration: duration.slow, ease: ease.outExpo } },
                  }}
                  className="block"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block text-display-2 font-medium tracking-[-0.03em]"
                  >
                    {item.label}
                  </Link>
                </motion.span>
              </span>
            ))}

            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span
                variants={{
                  hidden: { y: "110%" },
                  visible: { y: "0%", transition: { duration: duration.slow, ease: ease.outExpo } },
                }}
                className="block"
              >
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="block text-display-2 font-medium tracking-[-0.03em] text-[var(--color-chalk)]"
                >
                  Search
                </button>
              </motion.span>
            </span>

            <DashedRule className="my-7" />

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: duration.slow } },
              }}
              className="flex flex-col gap-3"
            >
              <Label>Contact</Label>
              <a href={`mailto:${site.email}`} className="type-label text-[var(--color-bone)]">
                {site.email}
              </a>
              <ul className="mt-2 flex gap-5">
                {site.social.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="type-label text-[var(--color-chalk)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {footerNav.information.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={onClose} className="type-micro text-[var(--color-chalk)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
