# Motion

Two files hold the system: **`src/motion/tokens.ts`** (durations, easing,
springs, stagger, viewport thresholds) and **`src/motion/variants.ts`** (reusable
variant sets). The CSS half mirrors them in `src/styles/tokens.css`.

**No component writes a raw duration, curve or spring config.** If a value isn't
in the tokens file, either it belongs there or the animation doesn't belong.

---

## The language

Motion here should read as *confident*, not playful. Concretely:

- **One easing family.** `outExpo` — `cubic-bezier(0.16, 1, 0.3, 1)` — is the
  house curve. It leaves fast and settles slowly, which is what separates
  expensive-feeling motion from bouncy motion.
- **Short travel distances.** 24px for text, 40px for cards. Long travel reads as
  a slideshow.
- **Springs only for tracked gestures.** Magnetic pull, pointer parallax, drag
  release. Never for entrances — a spring entrance is exactly where "premium"
  turns into "cartoon".
- **Stagger by line, not by character.** Per-character reveals on a paragraph are
  noise.
- **Nothing loops.** One marquee, once, as the quiet beat between two sections.
  A second one would turn a device into a tic.

### Curves

| Token          | Value                              | Used for                              |
| -------------- | ---------------------------------- | --------------------------------------- |
| `outExpo`      | `cubic-bezier(0.16, 1, 0.3, 1)`    | Everything entering. The house curve.  |
| `outQuart`     | `cubic-bezier(0.25, 1, 0.5, 1)`    | Cross-fades, the add-to-bag arc.       |
| `inOutQuint`   | `cubic-bezier(0.83, 0, 0.17, 1)`   | Things travelling across screen — drawer, page transition, mobile nav. Weighted at both ends. |
| `standard`     | `cubic-bezier(0.4, 0, 0.2, 1)`     | Scrims, opacity-only changes.          |

### Durations

`micro` 160ms · `fast` 260ms · `base` 420ms · `slow` 720ms · `cinematic` 1100ms

Rule of thumb: functional feedback under 300ms, editorial reveals 700ms+.

---

## The house reveal

The gesture repeated across the whole site, in `frameReveal` + `imageSettle`:

> The frame wipes open from the bottom via `clip-path`, while the image inside
> settles back from a 1.12 overscale over a slightly longer duration.

Two elements moving at different rates is what gives it depth. A plain fade does
not. Every photograph enters this way via `<Media reveal>`.

Text uses `lineMaskGroup` + `lineMaskItem`: each line sits in an
`overflow-hidden` box and rises from `y: 110%`, staggered 60ms.

`TextReveal` takes **one string per visual line** — the split is authored, not
measured. Where a headline breaks is an art-direction decision, and automatic
wrapping would put the mask edge somewhere different at every breakpoint.

---

## Interaction tiers

Not every interaction gets the same intensity. Escalating everything is what
makes an interface exhausting.

| Tier | What                                       | Where                                                |
| ---- | ------------------------------------------ | ------------------------------------------------------ |
| 1    | Colour and underline on hover              | Every link (`.link-wipe`), nav, footer                |
| 2    | Transform, scale, magnetic pull            | Buttons, product cards, bag, primary CTAs             |
| 3    | Masked reveals, scroll parallax, page transitions | Section entrances, sticky frames, route changes |
| 4    | WebGL                                      | The hero photograph. Once, on the whole site.         |

Tier 4 appears in exactly one place on the entire site. That is what makes it
register as a moment rather than a texture.

---

## Page transitions

`src/components/layout/PageTransition.tsx`. Five ink columns already covering the
viewport when a new route mounts, sweeping upward in sequence to uncover it.

**Why a reveal rather than a cover-then-reveal:** the App Router commits a
navigation as soon as the segment is ready. Any attempt to play an exit
animation first either delays every click by its duration or races the commit and
gets clipped. Uncovering sidesteps that — the animation always plays in full, and
starts exactly when the new page is available.

Under 600ms end to end. Repeat navigation is the common case, and a transition
that is beautiful the first time is an obstacle the fifth.

---

## Scroll

**Lenis** for smooth scrolling, off for touch (the OS momentum is better) and off
for reduced motion. Nested scrollers opt out with `data-lenis-prevent`.

Two scroll set pieces, both built on browser primitives rather than a pinning
library:

- **`PrintStudy`** — `position: sticky` with two scroll-linked transforms. The
  page keeps scrolling at its natural rate; the frame simply stays put for a
  while. A flick of the wheel still moves you through at the speed you asked for.
- **`ProductRail`** — a native `overflow-x` scroller with pointer dragging
  layered on top. A transform track pinned to page scroll looks identical on a
  demo reel and is worse in every other respect: it hijacks vertical scrolling,
  breaks touch momentum, loses keyboard access, and confuses screen readers about
  position. Here, wheel, trackpad, swipe, Tab and arrow keys all work before the
  drag enhancement is added.

Neither needed GSAP.

---

## The cursor: removed

There was a custom cursor — a dot that expanded into a labelled disc over
products and the drag rail. It has been taken out at the client's request, and
the native cursor is used throughout.

Worth stating plainly because it is a recurring temptation on sites like this: a
custom cursor is a tier-4 cost paid on *every* pointer movement across the whole
site, in exchange for an effect that competes with the photography and that many
people simply find worse than the pointer they chose. This site already spends
its one tier-4 budget on the hero shader.

Native cursors still carry meaning where they should — `cursor-grab` /
`cursor-grabbing` on the drop rail, `cursor-not-allowed` on sold-out sizes. Those
are affordances, not decoration.

If it is ever wanted back, the pattern that worked was attribute-driven
(`data-cursor="view"` read by one delegated `pointerover` listener), which meant
no component had to import or reset anything.

---

## Add-to-bag

The one interaction with real choreography. `FlyToBag` copies the gallery's first
frame, then animates it along an **arc** into the bag while shrinking.

The arc is the point. A straight tween between two points reads as a UI
affordance; a path that rises before it falls reads as an object being thrown.
Built from three-stop keyframes on `x` and `y` with different timing — cheaper
and more controllable than a motion path.

Sequence: launch → commit line to cart → open the drawer at ~720ms, as the image
lands. The drawer is delayed deliberately; opening it immediately would cover the
animation it is meant to be the payoff for.

Skipped entirely under reduced motion — the item still lands, the bag still
reacts, there is simply nothing in flight.

---

## Reduced motion

Honoured everywhere, and treated as *remove the cinema, keep the meaning*:

- Durations collapse to ~0 in CSS, so reveals **resolve to their finished state**
  rather than being cancelled mid-way. Content can never be stranded at
  opacity 0.
- Lenis does not initialise.
- The boot sequence is skipped.
- Page transitions are skipped.
- The WebGL hero does not load.
- The marquee stops.
- Grain is removed.

Everything remains fully usable. Nothing that carries information is animation-only.

---

## Adding an animation

1. Is it tier 1 or 2? Use CSS with the token durations and curves. Do not reach
   for Motion for a hover.
2. Tier 3? Compose from `src/motion/variants.ts`. Add a new variant set there if
   the gesture is genuinely new.
3. Tier 4? Justify it against what the site already has. There is one, and one is
   the right number.
