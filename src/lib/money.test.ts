import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, money, multiplyMoney } from "./money";

describe("money", () => {
  it("formats minor units as a decimal with the currency trailing", () => {
    expect(formatMoney(money(7900))).toBe("79.00 BGN");
    expect(formatMoney(money(5))).toBe("0.05 BGN");
    expect(formatMoney(money(0))).toBe("0.00 BGN");
  });

  /**
   * The reason every amount in this codebase is an integer. Held as floats,
   * 79.90 * 3 is 239.70000000000002, and that lands in a cart subtotal.
   */
  it("multiplies without floating-point drift", () => {
    const unit = money(7990);
    expect(multiplyMoney(unit, 3).amount).toBe(23970);
    expect(formatMoney(multiplyMoney(unit, 3))).toBe("239.70 BGN");
  });

  it("adds amounts of the same currency", () => {
    expect(addMoney(money(7900), money(2100)).amount).toBe(10000);
  });

  it("refuses to add across currencies rather than producing a wrong total", () => {
    expect(() => addMoney(money(100, "BGN"), money(100, "EUR"))).toThrow();
  });
});
