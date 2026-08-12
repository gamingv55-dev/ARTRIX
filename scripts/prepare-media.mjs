/**
 * Derives every web asset in public/media from the originals in _source-assets.
 *
 * Run with: npm run media
 *
 * Why this exists rather than dropping the camera files straight into public/:
 *   - the originals are 2-6 MB and inconsistent in size and format
 *   - the editorial crops (print details, wide campaign frames) are art-direction
 *     decisions that deserve to be versioned as code, not redone by hand
 *   - blur placeholders must be generated from the final derivative, otherwise
 *     the LQIP colour drifts away from the image it stands in for
 *
 * Output:
 *   public/media/                web-sized WebP derivatives
 *   src/data/generated/media.ts  dimensions + blur data URLs, imported by the catalog
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "_source-assets");
const OUT = path.join(ROOT, "public", "media");
const GENERATED = path.join(ROOT, "src", "data", "generated");

/** Long edge of the shipped derivative. Next/Image resizes down from here. */
const MAX_EDGE = 2000;
const QUALITY = 82;

/**
 * Crop rectangles are fractions of the source (left/top/width/height, 0..1) so
 * they survive a re-shoot or a re-export at a different resolution.
 */
const jobs = [
  // ---- GRILLZ TEE -------------------------------------------------------
  { id: "grillz-portrait", from: "src-grillz-portrait.webp" },
  { id: "grillz-worn", from: "src-grillz-fullbody.webp" },
  { id: "grillz-worn-wide", from: "src-grillz-fullbody-hi.jpg" },
  {
    id: "grillz-print",
    from: "src-grillz-portrait.webp",
    crop: { left: 0.315, top: 0.408, width: 0.465, height: 0.248 },
  },

  // ---- ROMAN TEE --------------------------------------------------------
  { id: "roman-still", from: "src-roman-chair.webp" },
  { id: "roman-worn", from: "src-roman-back.webp" },
  {
    id: "roman-print",
    from: "src-roman-back.webp",
    crop: { left: 0.405, top: 0.322, width: 0.235, height: 0.196 },
  },

  // ---- EDITORIAL --------------------------------------------------------
  {
    id: "editorial-still-wide",
    from: "src-roman-chair.webp",
    crop: { left: 0.06, top: 0.17, width: 0.88, height: 0.44 },
  },
  {
    id: "editorial-street",
    from: "src-grillz-fullbody-hi.jpg",
    crop: { left: 0.0, top: 0.12, width: 1.0, height: 0.56 },
  },
];

async function build(job) {
  const input = path.join(SRC, job.from);
  if (!existsSync(input)) throw new Error(`Missing source asset: ${job.from}`);

  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();
  const sw = meta.width ?? 0;
  const sh = meta.height ?? 0;

  if (job.crop) {
    // Round and clamp so a slightly-off fraction can never throw at build time.
    const left = Math.max(0, Math.round(job.crop.left * sw));
    const top = Math.max(0, Math.round(job.crop.top * sh));
    const width = Math.min(sw - left, Math.round(job.crop.width * sw));
    const height = Math.min(sh - top, Math.round(job.crop.height * sh));
    pipeline = pipeline.extract({ left, top, width, height });
  }

  const buffer = await pipeline
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer();

  await writeFile(path.join(OUT, `${job.id}.webp`), buffer);
  const final = await sharp(buffer).metadata();

  // 20px-wide LQIP: small enough to inline without bloating the document,
  // large enough to carry the composition's tonal structure.
  const lqip = await sharp(buffer).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

  return {
    id: job.id,
    src: `/media/${job.id}.webp`,
    width: final.width,
    height: final.height,
    blurDataURL: `data:image/webp;base64,${lqip.toString("base64")}`,
    bytes: buffer.length,
  };
}

/** Samples the direction mockup so the palette in tokens.css comes from the
 *  reference rather than from guesswork. Reported, not written. */
async function samplePalette() {
  const ref = path.join(SRC, "ref-homepage-direction.png");
  if (!existsSync(ref)) return null;

  const base = await sharp(ref).toBuffer();
  const { width = 0, height = 0 } = await sharp(base).metadata();

  const read = async (l, t, w, h) => {
    const { data } = await sharp(base)
      .extract({ left: l, top: t, width: w, height: h })
      .resize(1, 1, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const hex = (n) => n.toString(16).padStart(2, "0");
    return `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`.toUpperCase();
  };

  return {
    bone: await read(Math.round(width * 0.02), Math.round(height * 0.04), 60, 40),
    ink: await read(Math.round(width * 0.5), Math.round(height * 0.155), 80, 40),
  };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(GENERATED, { recursive: true });

  const results = [];
  for (const job of jobs) {
    const r = await build(job);
    results.push(r);
    console.log(
      `  ${r.id.padEnd(22)} ${String(r.width).padStart(4)}x${String(r.height).padEnd(5)} ${(r.bytes / 1024).toFixed(0).padStart(4)} KB`,
    );
  }

  const entries = results
    .map(
      (r) =>
        `  "${r.id}": {\n    src: "${r.src}",\n    width: ${r.width},\n    height: ${r.height},\n    blurDataURL:\n      "${r.blurDataURL}",\n  },`,
    )
    .join("\n");

  const file = `// GENERATED BY scripts/prepare-media.mjs - DO NOT EDIT BY HAND.
// Run \`npm run media\` after adding or replacing anything in _source-assets/.

export interface MediaAsset {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
}

export const media = {
${entries}
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof media;
`;

  await writeFile(path.join(GENERATED, "media.ts"), file, "utf8");

  const palette = await samplePalette();
  if (palette) {
    console.log(`\n  Sampled from direction mockup -> bone ${palette.bone} / ink ${palette.ink}`);
  }
  console.log(`\n  ${results.length} assets -> public/media, manifest -> src/data/generated/media.ts\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
