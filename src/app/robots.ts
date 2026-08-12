import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /search is query-driven and duplicates /shop; /api serves no pages.
      disallow: ["/api/", "/search"],
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
