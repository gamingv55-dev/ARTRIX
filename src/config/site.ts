/**
 * Brand-level constants. Anything that would change if ATRIX rebranded,
 * moved, or opened a second market lives here and nowhere else.
 */

const FALLBACK_ORIGIN = "https://atrix.bg";

/**
 * The canonical origin, resolved defensively.
 *
 * This value feeds `metadataBase` in the root layout, so a bad one throws
 * `TypeError: Invalid URL` while Next is collecting page data — which fails
 * every route at once, including /_not-found, with an error that names the
 * page rather than the cause. It is worth being paranoid here.
 *
 * Guards against, in order:
 *   - an env var set but empty. `??` does not catch this: "" is not nullish,
 *     so it passes straight through to new URL() and throws. This is exactly
 *     how the first Vercel deploy failed.
 *   - a bare host with no protocol ("atrix.bg", "artrix.vercel.app"), which is
 *     the natural thing to paste into a dashboard field
 *   - a trailing slash or a path, normalised away via .origin
 *   - anything else malformed, caught and replaced rather than thrown
 *
 * Falls back to the deployment URL Vercel injects, so a preview deploy gets
 * correct absolute URLs without anyone configuring anything.
 */
function resolveSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();

  const candidate =
    (configured && configured.length > 0 ? configured : undefined) ??
    (vercelHost && vercelHost.length > 0 ? vercelHost : undefined) ??
    FALLBACK_ORIGIN;

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export const site = {
  name: "ATRIX",
  legalName: "ATRIX LTD",
  /** Company registration number. Placeholder until the real EIK is issued. */
  registration: "EIK 000000000",
  tagline: "Wear the unexpected.",
  description:
    "Independent apparel from Varna. Original hand-drawn artwork, printed in editions of fifty on 240 GSM oversized cotton.",
  city: "Varna",
  country: "Bulgaria",
  founded: 2026,

  email: "hello@atrix.bg",

  /** Canonical origin, no trailing slash. Used for canonical URLs, sitemap,
   *  Open Graph and structured data. Never assign this directly — see
   *  resolveSiteOrigin above for why it is guarded. */
  url: resolveSiteOrigin(),

  social: [
    { label: "Instagram", href: "https://instagram.com/atrix.bg" },
    { label: "TikTok", href: "https://tiktok.com/@atrix.bg" },
  ],

  /** The single active drop. Drives the home page and the header link. */
  currentDropSlug: "01",
} as const;

/** Primary navigation. Order is the order it renders. */
export const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "About", href: "/about" },
] as const;

export const footerNav = {
  shop: [
    { label: "Drop 01", href: "/drop/01" },
    { label: "All pieces", href: "/shop" },
    { label: "Lookbook", href: "/lookbook" },
    { label: "Size guide", href: "/size-guide" },
  ],
  information: [
    { label: "About", href: "/about" },
    { label: "Shipping & returns", href: "/shipping" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;

/** Free shipping threshold in minor units (BGN stotinki). */
export const FREE_SHIPPING_THRESHOLD = 15000;

/** Repeated in the hero spec strip and the drop header. */
export const productionSpec = [
  "Drop 01",
  "Original artwork",
  "240 GSM",
  "Oversized fit",
  "Varna 2026",
] as const;
