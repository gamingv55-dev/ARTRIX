import { beforeEach, describe, expect, it } from "vitest";
import { cartCount, cartSubtotal, useCartStore } from "./cart-store";
import { formatMoney } from "./money";
import type { CartLine } from "@/types";

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    sku: "ATX01G-BLACK-L",
    productId: "atx-01-grillz",
    slug: "grillz-tee-black",
    name: "Grillz Tee",
    size: "L",
    colorName: "Black",
    quantity: 1,
    unitPrice: { amount: 7900, currency: "BGN" },
    image: { src: "/media/grillz-portrait.webp", alt: "", width: 1333, height: 2000 },
    ...overrides,
  };
}

describe("cart", () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [], isOpen: false, lastAddedSku: null });
  });

  it("adds a line", () => {
    useCartStore.getState().addLine(line(), 10);
    expect(useCartStore.getState().lines).toHaveLength(1);
  });

  it("merges a repeat add of the same sku instead of duplicating it", () => {
    const { addLine } = useCartStore.getState();
    addLine(line(), 10);
    addLine(line(), 10);

    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(2);
  });

  /** Two sizes of one product are two lines — this is why the cart is keyed
   *  by SKU rather than by product id. */
  it("keeps different sizes of the same product as separate lines", () => {
    const { addLine } = useCartStore.getState();
    addLine(line({ sku: "ATX01G-BLACK-L", size: "L" }), 10);
    addLine(line({ sku: "ATX01G-BLACK-M", size: "M" }), 10);

    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("never exceeds available stock, however many times it is added", () => {
    const { addLine } = useCartStore.getState();
    addLine(line({ quantity: 1 }), 2);
    addLine(line({ quantity: 1 }), 2);
    addLine(line({ quantity: 1 }), 2);

    expect(useCartStore.getState().lines[0]?.quantity).toBe(2);
  });

  it("clamps an oversized initial quantity to stock", () => {
    useCartStore.getState().addLine(line({ quantity: 99 }), 3);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(3);
  });

  it("removes the line when quantity is stepped down to zero", () => {
    const { addLine, setQuantity } = useCartStore.getState();
    addLine(line(), 10);
    setQuantity("ATX01G-BLACK-L", 0, 10);

    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("removes a line by sku", () => {
    const { addLine, removeLine } = useCartStore.getState();
    addLine(line({ sku: "A" }), 10);
    addLine(line({ sku: "B" }), 10);
    removeLine("A");

    expect(useCartStore.getState().lines.map((l) => l.sku)).toEqual(["B"]);
  });

  it("totals quantities across lines", () => {
    const { addLine } = useCartStore.getState();
    addLine(line({ sku: "A", quantity: 2 }), 10);
    addLine(line({ sku: "B", quantity: 3 }), 10);

    expect(cartCount(useCartStore.getState().lines)).toBe(5);
  });

  it("computes a subtotal from unit price and quantity", () => {
    const { addLine } = useCartStore.getState();
    addLine(line({ sku: "A", quantity: 2 }), 10); // 79.00 x 2 = 158.00
    addLine(line({ sku: "B", quantity: 1, unitPrice: { amount: 4550, currency: "BGN" } }), 10); // 45.50

    expect(formatMoney(cartSubtotal(useCartStore.getState().lines))).toBe("203.50 BGN");
  });

  it("reports a zero subtotal for an empty bag rather than throwing", () => {
    expect(formatMoney(cartSubtotal([]))).toBe("0.00 BGN");
  });
});
