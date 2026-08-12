/**
 * Small shared helpers. Nothing here should grow domain knowledge — if a
 * function starts caring about products or carts it belongs in lib/catalog
 * or lib/cart-store instead.
 */

/** Conditional className join. Enough for this codebase; avoids a dependency. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Maps a value from one range to another, clamped to the output range. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** "01", "02" … — used for the piece indices throughout the interface. */
export function padIndex(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Splits a string into words, keeping the spaces, for per-word text reveals. */
export function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter((s) => s.length > 0);
}
