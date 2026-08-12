/**
 * Centralised analytics.
 *
 * Components call `track(...)` with a typed event and never touch gtag, fbq or
 * dataLayer directly. Adding a provider means editing the dispatch list at the
 * bottom of this file — not hunting for call sites.
 *
 * With no provider script present every call is a no-op, so this is safe to
 * ship before any vendor is chosen.
 */

import type { CartLine, Money, Product } from "@/types";

type AnalyticsEvent =
  | { name: "product_view"; product: Product }
  | { name: "product_list_view"; listId: string; products: Product[] }
  | { name: "add_to_cart"; line: CartLine }
  | { name: "remove_from_cart"; line: CartLine }
  | { name: "cart_view"; lines: CartLine[]; subtotal: Money }
  | { name: "begin_checkout"; lines: CartLine[]; subtotal: Money }
  | { name: "search"; query: string; resultCount: number }
  | { name: "filter_apply"; facet: string; value: string }
  | { name: "newsletter_signup"; source: string };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (name: string, data?: Record<string, unknown>) => void };
  }
}

const isEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

/** Flattens a domain event into the shape most vendors expect. */
function toPayload(event: AnalyticsEvent): Record<string, unknown> {
  switch (event.name) {
    case "product_view":
      return {
        currency: event.product.price.currency,
        value: event.product.price.amount / 100,
        items: [
          {
            item_id: event.product.id,
            item_name: event.product.name,
            price: event.product.price.amount / 100,
          },
        ],
      };
    case "product_list_view":
      return {
        item_list_id: event.listId,
        items: event.products.map((p) => ({ item_id: p.id, item_name: p.name })),
      };
    case "add_to_cart":
    case "remove_from_cart":
      return {
        currency: event.line.unitPrice.currency,
        value: (event.line.unitPrice.amount * event.line.quantity) / 100,
        items: [
          {
            item_id: event.line.sku,
            item_name: event.line.name,
            item_variant: event.line.size,
            quantity: event.line.quantity,
            price: event.line.unitPrice.amount / 100,
          },
        ],
      };
    case "cart_view":
    case "begin_checkout":
      return {
        currency: event.subtotal.currency,
        value: event.subtotal.amount / 100,
        items: event.lines.map((l) => ({
          item_id: l.sku,
          item_name: l.name,
          quantity: l.quantity,
        })),
      };
    case "search":
      return { search_term: event.query, result_count: event.resultCount };
    case "filter_apply":
      return { facet: event.facet, value: event.value };
    case "newsletter_signup":
      return { source: event.source };
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const payload = toPayload(event);

  if (process.env.NODE_ENV === "development" && !isEnabled) {
    // Visible during development so event wiring can be verified without a
    // vendor account; silent in production.
    console.debug(`[analytics] ${event.name}`, payload);
    return;
  }

  if (!isEnabled) return;

  // ── Dispatch. Add new providers here and nowhere else. ────────────────
  window.dataLayer?.push({ event: event.name, ...payload });
  window.gtag?.("event", event.name, payload);

  const metaEventMap: Partial<Record<AnalyticsEvent["name"], string>> = {
    product_view: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    search: "Search",
  };
  const metaName = metaEventMap[event.name];
  if (metaName) window.fbq?.("track", metaName, payload);
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined" || !isEnabled) return;
  window.dataLayer?.push({ event: "page_view", page_path: path });
  window.gtag?.("event", "page_view", { page_path: path });
}
