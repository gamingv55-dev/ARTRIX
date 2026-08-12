import Link from "next/link";
import { footerNav, site } from "@/config/site";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import { NewsletterForm } from "./NewsletterForm";

/**
 * The last scene.
 *
 * Ends on the wordmark, cropped by the bottom edge of the document the same
 * way the hero is cropped by the photograph — so the page closes with the
 * gesture it opened with. The mark is decorative here (the header already
 * carries the accessible one), so it is hidden from assistive technology.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-ground="ink"
      className="relative overflow-hidden bg-[var(--color-ink)] text-[var(--color-bone)]"
    >
      <div className="page-shell pt-[var(--spacing-band)]">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <h2 className="text-h1 max-w-[20ch] font-medium">
              Drop 02 is already on paper. Be first to know.
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-2">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid-12 mt-[var(--spacing-band)] gap-y-10">
          <nav aria-label="Shop" className="col-span-6 md:col-span-3">
            <Label>Shop</Label>
            <ul className="mt-5 flex flex-col gap-3">
              {footerNav.shop.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-wipe text-sm text-[var(--color-bone-dim)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Information" className="col-span-6 md:col-span-3">
            <Label>Information</Label>
            <ul className="mt-5 flex flex-col gap-3">
              {footerNav.information.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-wipe text-sm text-[var(--color-bone-dim)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <Label>Contact</Label>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="link-wipe text-sm text-[var(--color-bone-dim)]"
                >
                  {site.email}
                </a>
              </li>
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-wipe text-sm text-[var(--color-bone-dim)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DashedRule className="mt-[var(--spacing-band-sm)]" />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-5">
          <span className="type-micro text-[var(--color-chalk)]">{site.legalName}</span>
          <span aria-hidden="true" className="type-micro text-[var(--color-chalk)] opacity-40">/</span>
          <span className="type-micro text-[var(--color-chalk)]">{site.registration}</span>
          <span aria-hidden="true" className="type-micro text-[var(--color-chalk)] opacity-40">/</span>
          <span className="type-micro text-[var(--color-chalk)]">
            {site.city}, {site.country}
          </span>
          <span aria-hidden="true" className="type-micro text-[var(--color-chalk)] opacity-40">/</span>
          <span className="type-micro text-[var(--color-chalk)]">&#169; {year}</span>
        </div>
      </div>

      {/* Cropped wordmark. Overflow-hidden on the footer clips the descender
          band, so the mark runs off the bottom of the document. */}
      <div aria-hidden="true" className="select-none pt-2">
        <span className="type-wordmark block translate-y-[0.16em] px-[max(0px,calc(var(--spacing-gutter)-0.06em))] text-[var(--color-bone)]">
          {site.name}
        </span>
      </div>
    </footer>
  );
}
