# Architecture

How the storefront is put together, where the seams are, and what to change when
a real backend arrives.

---

## The shape of it

```
   src/data/*.ts            the catalog — plain TypeScript arrays
        │
        ▼
   src/lib/catalog.ts       ← the only route from UI to data. All async.
        │
        ├─────────────────► server components (pages)
        │                   render products, drops, metadata, JSON-LD
        │
        └─────────────────► AppShell (client)
                            receives a serialised product list for search
```

**No component imports from `src/data` for product data.** Pages call
`getProducts()`, `getProductBySlug()`, `getProductsByDrop()`. Two files break
this rule on purpose — `src/sections/home/Editorial.tsx` and `PrintStudy.tsx`
import the media manifest directly, because the photographs they use are
art-direction decisions belonging to those compositions, not catalogue data.

---

## Server and client

Every page is a server component. The client boundary is drawn as tightly as
possible, and the split is deliberate:

| Client                        | Why                                          |
| ----------------------------- | ---------------------------------------------- |
| `AppShell`                     | Owns the persistent layer across navigations. |
| `Header`, `MobileNav`          | Scroll and ground-crossing state.             |
| `ProductGallery`               | Carousel index, scroll tracking.              |
| `ProductPurchase`              | Size selection, cart writes.                  |
| `ProductAccordion`             | Open/closed state.                            |
| `CartDrawer`, `BagButton`      | Cart state.                                   |
| `SearchOverlay`, `FilterBar`   | Query and filter state.                       |
| `Cursor`, `HeroCanvas`         | Pointer and GL.                               |
| Sections using scroll motion   | `useScroll` needs the DOM.                    |

The product page ships almost no JavaScript for what is mostly text and images:
gallery, purchase controls and accordion are client, everything else is not.

`ProductViewTracker` exists solely so the product page can stay a server
component — it is a client component that renders `null` and fires one analytics
event.

---

## Money

**Every amount is an integer in minor units** (stotinki). Floats are never used.

`79.90 * 3` is `239.70000000000002` in binary floating point, and a cart subtotal
is exactly where that surfaces. `src/lib/money.ts` is the only place amounts are
converted for display. There is a test for this.

---

## The cart

`src/lib/cart-store.ts`. Zustand with `persist` to localStorage.

- **Keyed by SKU, not product id.** A Large and an XL are two independent lines.
- **Quantity clamped at write time** against the stock passed in by the caller,
  so the store can never hold more than the edition contains.
- **`isOpen` is not persisted.** Persisting view state would pop the drawer open
  on every page load.
- **Lines carry a denormalised snapshot** — name, price, image — of what the
  customer saw. If a price changes while an item sits in someone's bag, the drift
  is detectable at checkout instead of silently repricing their cart.

The bag count renders as an empty slot until hydration. The cart lives in
localStorage, so server HTML cannot know it; rendering `0` and correcting after
would flash a wrong number for anyone with a full bag.

---

## Mock boundaries

Three things are deliberately unfinished. Each is marked `MOCK BOUNDARY` in the
source.

### 1. Checkout — not implemented

`src/components/commerce/CartDrawer.tsx`. The button is `disabled` and the copy
underneath says checkout is not connected. A button that looks live and silently
does nothing is worse than an honest one.

**To connect it:** create a server action or route handler that builds a session
from `useCartStore.getState().lines`, re-reads real prices from the catalog
server-side (never trust the client's snapshot), and redirects to the provider.

```ts
// src/app/api/checkout/route.ts
export async function POST(request: Request) {
  const { lines } = await request.json();
  // Re-price server-side from the catalog before creating the session.
  // const session = await stripe.checkout.sessions.create({ ... });
  // return NextResponse.json({ url: session.url });
}
```

Keep `STRIPE_SECRET_KEY` server-side only.

### 2. Newsletter — validates, stores nothing

`src/app/api/newsletter/route.ts`. Validates the address and responds. No
provider is connected and the response message says so. Replace the marked block
with the provider call; the API key stays in an environment variable and the
call stays in that file.

### 3. Two products have no photography

`src/data/products.ts`. `Piece 03` and `Piece 04` are `status: "in-production"`.
They render as typographic cards with a dashed frame and are not purchasable.

This is the honest option. A blurred placeholder or a stock photograph standing
in for a real garment would undermine the one claim the label rests on. Either
delete them, or promote them by adding images and switching status.

---

## Replacing the data source

`src/lib/catalog.ts` is the seam. **Every reader is already `async`** even though
the current source is a local array — that is the entire point. Swapping in a
network-backed catalog means rewriting the bodies of those functions and nothing
else. If the callers were synchronous today, the change would ripple through
every page.

### Shopify

```ts
// src/lib/catalog.ts
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await shopifyFetch(PRODUCT_QUERY, { handle: slug });
  return data.product ? toProduct(data.product) : null;
}
```

Write one `toProduct()` adapter mapping the Storefront API response onto the
`Product` type in `src/types/index.ts`. The type is already shaped like a
commerce API's output rather than like the components that render it, so the
mapping is mechanical:

| ATRIX                  | Shopify                                    |
| ---------------------- | -------------------------------------------- |
| `Product.slug`         | `handle`                                     |
| `Product.variants[]`   | `variants.edges[].node`                      |
| `ProductVariant.sku`   | `variant.sku`                                |
| `Money.amount`         | `price.amount` × 100 (Shopify returns decimal strings) |
| `ProductImage`         | `images.edges[].node`, `altText`             |
| `Product.dropId`       | a collection handle, or a metafield          |

Then add `revalidate` or `cache: "force-cache"` with tags to the page exports.

### Medusa / WooCommerce / custom

Identical shape. One adapter function, same seam.

### What will need attention beyond the adapter

1. **Search** currently runs in the browser against the full list, passed down
   from the server layout. At a few hundred products that becomes wasteful —
   move `searchProducts` behind a route handler and add a debounce in
   `SearchOverlay`. The overlay is already written so the loading state has one
   obvious home.
2. **Filtering** is client-side in `ShopBrowser`. The `CatalogFilters` type is
   already the shape a query string would carry, so moving it to URL search
   params with server-side filtering is contained to that one file.
3. **Blur placeholders** come from the build-time media script. A CMS-hosted
   image needs its LQIP from the CMS (Shopify and Sanity both provide one).

---

## Adding a CMS

Editorial copy currently lives in `src/data/drops.ts`, `src/config/site.ts` and
the page files. To move it to Sanity or Contentful, follow the same pattern:
add `src/lib/content.ts` with async readers, and have pages call those instead of
importing the data modules.

Do not connect a CMS before there is a second drop. The abstraction is cheap to
add later and is a real cost to maintain against a single drop's worth of copy.

---

## Analytics

`src/lib/analytics.ts` is a single `track()` taking a typed event union.
Components never touch `gtag`, `fbq` or `dataLayer`. Adding a provider means
editing the dispatch list at the bottom of that file — not hunting for call
sites. With no provider present every call is a no-op, so the site ships fine
before a vendor is chosen.

---

## Error handling

| Failure                | Behaviour                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| Unknown route          | `app/not-found.tsx` — designed, with routes back in.                   |
| Render error           | `app/error.tsx` — offers `reset()` before offering an exit.            |
| Product image 404s     | `Media` keeps the frame at its ratio and tints it. Layout never collapses. |
| WebGL unavailable/lost | `HeroCanvas` unmounts; the static `<Image>` was always underneath.     |
| Newsletter POST fails  | Inline message, form stays filled.                                     |
| Empty filter result    | Written empty state, not a blank grid.                                 |

The priority order is content → product → usability → motion → effects. Every
advanced layer is additive over something that already works.
