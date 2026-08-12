import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/lib/catalog";
import { organizationJsonLd } from "@/lib/seo";
import { site } from "@/config/site";
import "@/styles/globals.css";

/**
 * Archivo carries the entire typographic identity. Loading the width axis
 * alongside weight is what makes the wordmark possible without shipping a
 * second display cut — `font-stretch: 112%` on .type-wordmark is doing the
 * work a bespoke expanded face would otherwise be needed for.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
});

/** Reserved for genuine data: prices, SKUs, indices, spec values. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-jb",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetched on the server so the client bundle never contains the catalog
  // module itself — only the small serialised list search needs.
  const products = await getProducts();

  return (
    <html lang="en" data-ground="bone" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Static, author-controlled JSON-LD built from src/config/site.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <AppShell products={products}>
          {children}
          <Footer />
        </AppShell>
      </body>
    </html>
  );
}
