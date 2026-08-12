import type { CurrencyCode, Money } from "@/types";

/**
 * Money helpers. Amounts are integers in minor units everywhere; the only
 * place a decimal appears is at the moment of display.
 */

const MINOR_UNITS = 100;

export function money(amount: number, currency: CurrencyCode = "BGN"): Money {
  return { amount, currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add ${a.currency} to ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function multiplyMoney(m: Money, factor: number): Money {
  return { amount: Math.round(m.amount * factor), currency: m.currency };
}

/**
 * "79.00 BGN" — currency code trailing, matching Bulgarian retail convention
 * and the spacing used throughout the interface.
 */
export function formatMoney(m: Money, opts?: { compact?: boolean }): string {
  const value = (m.amount / MINOR_UNITS).toFixed(opts?.compact ? 0 : 2);
  return `${value} ${m.currency}`;
}

/** Bare number, for cases where the currency is already stated in the column. */
export function formatAmount(m: Money): string {
  return (m.amount / MINOR_UNITS).toFixed(2);
}
