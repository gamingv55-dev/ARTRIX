import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // A stray lockfile in the user's home directory makes Next infer the wrong
  // workspace root, which breaks build-trace collection for deployment.
  outputFileTracingRoot: import.meta.dirname,

  images: {
    // AVIF first: the product photography is large-format and photographic,
    // which is exactly where AVIF's advantage over WebP is biggest.
    formats: ["image/avif", "image/webp"],
    // Matches the layout breakpoints in src/config/breakpoints.ts.
    deviceSizes: [400, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [128, 200, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  async headers() {
    return [
      {
        // Hashed/derived media is immutable — it is regenerated under a new
        // name by `npm run media` rather than edited in place.
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
