"use client";

import { create } from "zustand";

/**
 * Coordinates the add-to-bag flight animation.
 *
 * The button that starts the flight and the element that draws it are far
 * apart in the tree (a product page vs. the root layout), so they meet through
 * this tiny store rather than through prop drilling or a context provider
 * wrapping the whole app.
 *
 * The store holds only the geometry and the image — the animation itself lives
 * entirely in <FlyToBag>.
 */

export interface Flight {
  /** Distinguishes consecutive flights so React remounts the animated node. */
  id: number;
  /** Viewport rect of the source image at the moment the button was pressed. */
  from: { top: number; left: number; width: number; height: number };
  image: { src: string; alt: string };
}

interface FlightState {
  flight: Flight | null;
  /** Increments each time an item lands, so the bag can react. */
  landings: number;
  launch: (from: Flight["from"], image: Flight["image"]) => void;
  land: () => void;
}

let nextId = 0;

export const useFlightStore = create<FlightState>((set) => ({
  flight: null,
  landings: 0,
  launch: (from, image) => set({ flight: { id: ++nextId, from, image } }),
  land: () => set((s) => ({ flight: null, landings: s.landings + 1 })),
}));

/** Where the flight is headed. Resolved at launch time — the bag can move. */
export function getBagRect(): DOMRect | null {
  const el = document.querySelector<HTMLElement>("[data-bag-target]");
  return el?.getBoundingClientRect() ?? null;
}
