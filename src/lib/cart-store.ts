"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, Money } from "@/types";
import { addMoney, money, multiplyMoney } from "./money";

/**
 * Cart state.
 *
 * Lines are keyed by SKU, not product id — a Large and an XL of the same tee
 * are two independent lines. Quantity is clamped against the stock passed in
 * at add-time so the drawer can never hold more than the edition contains.
 *
 * MOCK BOUNDARY: this is client-side state persisted to localStorage. It is
 * a real cart in the sense that it is correct and durable, but there is no
 * server reservation behind it. Checkout is not implemented — see
 * docs/architecture.md → "Wiring up checkout".
 */

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  /** SKU of the line added most recently, so the drawer can highlight it. */
  lastAddedSku: string | null;

  addLine: (line: CartLine, maxQuantity: number) => void;
  removeLine: (sku: string) => void;
  setQuantity: (sku: string, quantity: number, maxQuantity: number) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      lastAddedSku: null,

      addLine: (line, maxQuantity) =>
        set((state) => {
          const existing = state.lines.find((l) => l.sku === line.sku);

          const lines = existing
            ? state.lines.map((l) =>
                l.sku === line.sku
                  ? { ...l, quantity: Math.min(l.quantity + line.quantity, maxQuantity) }
                  : l,
              )
            : [...state.lines, { ...line, quantity: Math.min(line.quantity, maxQuantity) }];

          return { lines, lastAddedSku: line.sku };
        }),

      removeLine: (sku) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.sku !== sku),
          lastAddedSku: state.lastAddedSku === sku ? null : state.lastAddedSku,
        })),

      setQuantity: (sku, quantity, maxQuantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { lines: state.lines.filter((l) => l.sku !== sku) };
          }
          return {
            lines: state.lines.map((l) =>
              l.sku === sku ? { ...l, quantity: Math.min(quantity, maxQuantity) } : l,
            ),
          };
        }),

      clear: () => set({ lines: [], lastAddedSku: null }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "atrix.cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // `isOpen` is view state, not cart contents — persisting it would pop the
      // drawer open on every page load.
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

/* ── Derived values ────────────────────────────────────────────────────── */

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): Money {
  return lines.reduce(
    (total, line) => addMoney(total, multiplyMoney(line.unitPrice, line.quantity)),
    money(0, lines[0]?.unitPrice.currency ?? "BGN"),
  );
}
