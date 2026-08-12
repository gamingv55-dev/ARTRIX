/**
 * Brand-level constants. Anything that would change if ATRIX rebranded,
 * moved, or opened a second market lives here and nowhere else.
 */

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

  /** Used for canonical URLs, sitemap, Open Graph. Override per environment. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://atrix.bg",

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
