# Performance

A photography-led fashion site is an image-delivery problem with some JavaScript
attached. Almost everything here follows from that.

---

## Where it stands

From `npm run build` (gzipped, First Load JS):

```
Shared by all                 103 kB
/                             171 kB
/shop                         164 kB
/product/[slug]               167 kB
/about                        156 kB
/lookbook                     155 kB
/terms, /privacy, /size-guide 146 kB
```

Twenty routes prerendered as static HTML. Only `/api/newsletter` is dynamic.

The ~103 kB shared baseline is React 19 plus Motion. Motion is the single largest
dependency and it earns it — page transitions, the reveal system, layout
animation and springs all run on it. Nothing else non-trivial is in the shared
bundle: no Three.js, no GSAP, no icon library, no UI framework.

---

## Images

The largest lever by far, so it gets a build step rather than runtime guessing.

**`npm run media`** takes the originals in `_source-assets/` (2–6 MB each) and
produces:

- WebP derivatives capped at a 2000px long edge, quality 82
- Art-directed crops, defined as fractions of the source so they survive a
  re-export
- A 20px LQIP per image, inlined as a data URI
- A manifest with real dimensions, so no layout is ever guessed

Result: 9 assets, ~1.6 MB total, from ~8 MB of originals.

At request time, `next/image` serves **AVIF first**, then WebP, resized to the
device. AVIF is ordered first because this photography is large-format and
photographic, which is exactly where its advantage over WebP is biggest.

### The two rules that matter

1. **Every `<Image>` gets a truthful `sizes`.** Getting this wrong is the most
   common way to ship a 2000px file into a 300px slot. Grep for `sizes=` — every
   call site states the real rendered width.
2. **Every image sits in a ratio-locked frame.** `.media-frame` plus an explicit
   `aspect-ratio` reserves the space before decode. This is the CLS defence, and
   it is why filtering the shop grid can animate without the page jumping.

### LCP

The LCP element is a real `<Image>` with `priority` and `fetchPriority="high"` —
the hero photograph on `/`, the first gallery frame on a product page. It never
depends on JavaScript. The WebGL layer, where it runs at all, draws on top of an
image that has already painted.

---

## What is lazy, and why

| Thing            | Loading                                                                 |
| ---------------- | ------------------------------------------------------------------------- |
| `HeroCanvas`     | `next/dynamic`, `ssr: false`, and only after capability checks pass. No shader code reaches any other route. |
| Below-fold images| `loading="lazy"` via `Media`.                                            |
| JetBrains Mono   | `preload: false` — nothing above the fold uses it.                       |
| Product data     | Server-side. The client receives a small serialised list for search only. |

---

## WebGL budget

The hero shader is the only GPU work on the site, and it is fenced in:

- **Capability gate** (`useWebGLEligible`): reduced motion off, fine pointer,
  desktop viewport, and a WebGL2 context that actually creates with
  `failIfMajorPerformanceCaveat: true`. Any failure and it never loads.
- **DPR capped at 1.5.** Beyond that the fill cost doubles for an effect measured
  in fractions of a pixel.
- **Suspended off-screen** via IntersectionObserver, and on `visibilitychange`.
  A backgrounded tab costs nothing.
- **One draw call.** Two triangles, one texture, three-octave value noise. No
  render targets, no post chain, no scene graph.
- **Context loss** unmounts back to the static image rather than leaving a blank
  canvas.

---

## Animation cost

- Everything animated is `transform`, `opacity` or `clip-path`. Nothing animates
  a property that triggers layout.
- Pointer-driven values (cursor, parallax, magnetic) ride on motion values and
  **never trigger a React render**.
- One global `pointermove` listener for parallax, not one per layer. The cursor
  uses `pointerover`, which fires on element change rather than per pixel.
- Scroll state uses IntersectionObserver, not `getBoundingClientRect` in a scroll
  handler. `useHeaderState` collapses the viewport to a thin band with
  `rootMargin` so "which section is under the header" is a plain intersection
  test.
- The marquee is CSS on the compositor. Grain is a static layer — animating it
  would repaint the full viewport every frame for no perceptible gain.

---

## Caching

`public/media/*` is served `immutable` for a year. Derivatives are regenerated
under a new name rather than edited in place, so this is safe.

Everything except the newsletter route is static HTML, cacheable at the edge
indefinitely until a redeploy.

---

## Watch items

- **`/` at 171 kB** is the heaviest route — hero scroll transforms, the rail, and
  the dynamic import shell. Fine, but it is the first thing to look at if the
  budget tightens.
- **Search ships the full catalog to the client.** A few hundred bytes today,
  wasteful at a few hundred products. Move it behind a route handler then; see
  `docs/architecture.md`.
- **Lenis** is ~8 KB and changes scroll feel globally. If Core Web Vitals ever
  argue with it, INP is where it would show.

---

## Before shipping a change

```bash
npm run build     # watch the route table for regressions
```

Then check on a real mid-range phone over throttled network, not just a desktop
with fast refresh. The mobile experience has its own layouts, and the effects
that are cheap on a desktop GPU are exactly the ones that are not on a phone —
which is why most of them are switched off there entirely.
