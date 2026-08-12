"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { track } from "@/lib/analytics";
import { FREE_SHIPPING_THRESHOLD } from "@/config/site";
import { drawerPanel, scrim } from "@/motion/variants";
import { duration, ease } from "@/motion/tokens";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "@/hooks/use-ui";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { clamp } from "@/lib/utils";

/**
 * The bag, as a drawer.
 *
 * Lines animate out with a layout transition when removed so the list closes
 * the gap rather than snapping. Quantity is capped by the store against real
 * stock, so the stepper's "+" simply stops responding at the edition limit
 * instead of showing an error.
 *
 * MOCK BOUNDARY: "Checkout" is deliberately inert and says so. There is no
 * payment provider wired up, and a button that looks live but silently does
 * nothing is worse than one that is honest. See docs/architecture.md.
 */
export function CartDrawer() {
  const { lines, isOpen, close, removeLine, setQuantity } = useCartStore();
  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);

  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, close);
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen) track({ name: "cart_view", lines, subtotal });
    // Fires on open only; re-running as lines change would double-count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal.amount;
  const shippingProgress = clamp(subtotal.amount / FREE_SHIPPING_THRESHOLD, 0, 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-drawer)]">
          <motion.button
            type="button"
            aria-label="Close bag"
            variants={scrim}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-[2px]"
          />

          <motion.aside
            ref={trapRef}
            data-ground="ink"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            variants={drawerPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-y-0 right-0 flex w-full max-w-[27rem] flex-col bg-[var(--color-ink)] text-[var(--color-bone)]"
          >
            <header className="flex shrink-0 items-center justify-between px-6 pt-6 pb-4">
              <h2 className="type-label">
                Bag <span className="type-data ml-1 text-[var(--color-chalk)]">{count}</span>
              </h2>
              <button type="button" onClick={close} className="link-wipe type-label">
                Close
              </button>
            </header>
            <div className="px-6">
              <DashedRule />
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
                <p className="text-h3 text-[var(--color-bone)]">Your bag is empty.</p>
                <p className="text-sm max-w-[28ch] text-[var(--color-chalk)]">
                  Drop 01 is fifty pieces per design. When a size goes, it does not come back.
                </p>
                <Link href="/shop" onClick={close} className="link-wipe type-label mt-1">
                  View the drop &#8594;
                </Link>
              </div>
            ) : (
              <>
                <ul
                  data-lenis-prevent
                  className="flex-1 overflow-y-auto overscroll-contain px-6"
                >
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.sku}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, transition: { duration: duration.fast } }}
                        transition={{ duration: duration.base, ease: ease.outExpo }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-5">
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={close}
                            className="relative h-[7.5rem] w-[5rem] shrink-0 overflow-hidden bg-[var(--color-ink-raised)]"
                          >
                            <Image
                              src={line.image.src}
                              alt={line.image.alt}
                              fill
                              sizes="80px"
                              placeholder={line.image.blurDataURL ? "blur" : "empty"}
                              blurDataURL={line.image.blurDataURL}
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link
                                href={`/product/${line.slug}`}
                                onClick={close}
                                className="link-wipe type-label"
                              >
                                {line.name}
                              </Link>
                              <span className="type-data shrink-0 text-[var(--color-bone)]">
                                {formatMoney({
                                  amount: line.unitPrice.amount * line.quantity,
                                  currency: line.unitPrice.currency,
                                })}
                              </span>
                            </div>

                            <p className="type-micro mt-2 text-[var(--color-chalk)]">
                              {line.colorName} / Size {line.size}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-4">
                              <div className="flex items-center border border-[var(--rule)]">
                                <button
                                  type="button"
                                  onClick={() => setQuantity(line.sku, line.quantity - 1, 99)}
                                  aria-label={`Decrease quantity of ${line.name}`}
                                  className="px-3 py-1.5 type-data text-[var(--color-chalk)] transition-colors hover:text-[var(--color-bone)]"
                                >
                                  &#8722;
                                </button>
                                <span
                                  aria-live="polite"
                                  className="min-w-[2ch] text-center type-data"
                                >
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQuantity(line.sku, line.quantity + 1, 99)}
                                  aria-label={`Increase quantity of ${line.name}`}
                                  className="px-3 py-1.5 type-data text-[var(--color-chalk)] transition-colors hover:text-[var(--color-bone)]"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  track({ name: "remove_from_cart", line });
                                  removeLine(line.sku);
                                }}
                                className="link-wipe type-micro text-[var(--color-chalk)]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="rule-solid" />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="shrink-0 px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  {remaining > 0 ? (
                    <div className="mb-5">
                      <p className="type-micro text-[var(--color-chalk)]">
                        {formatMoney({ amount: remaining, currency: subtotal.currency })} to free
                        shipping
                      </p>
                      <div className="mt-2 h-px w-full bg-[var(--rule)]">
                        <motion.div
                          className="h-px bg-[var(--color-bone)]"
                          initial={false}
                          animate={{ scaleX: shippingProgress }}
                          style={{ transformOrigin: "left" }}
                          transition={{ duration: duration.slow, ease: ease.outExpo }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="type-micro mb-5 text-[var(--color-signal)]">
                      Free shipping unlocked
                    </p>
                  )}

                  <div className="flex items-baseline justify-between">
                    <Label tone="strong">Subtotal</Label>
                    <span className="type-data text-[var(--color-bone)]">
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                  <p className="type-micro mt-2 text-[var(--color-chalk)]">
                    Taxes and shipping calculated at checkout
                  </p>

                  <Button
                    fullWidth
                    className="mt-5"
                    disabled
                    onClick={() => track({ name: "begin_checkout", lines, subtotal })}
                  >
                    Checkout
                  </Button>
                  <p className="type-micro mt-3 text-center text-[var(--color-chalk)]">
                    Checkout is not connected yet
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
