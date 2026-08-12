import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/InfoPage";
import { site } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "Terms and conditions for purchases from ATRIX.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms & conditions"
      intro={`These terms cover purchases from ${site.url.replace(/^https?:\/\//, "")}, operated by ${site.legalName}, ${site.registration}, registered in ${site.city}, ${site.country}.`}
      blocks={[
        {
          heading: "Orders",
          body: [
            "An order is an offer to buy. It is accepted when we send a dispatch confirmation, and a contract is formed at that point.",
            "Editions are limited and stock is held only while an order is being completed. If a piece sells out between adding it to a bag and paying, the order will be cancelled and refunded in full.",
          ],
        },
        {
          heading: "Pricing",
          body: [
            "Prices are shown in Bulgarian lev and include VAT where applicable. Obvious pricing errors are not binding; if one occurs we will contact you before dispatch and you may cancel.",
          ],
        },
        {
          heading: "Right of withdrawal",
          body: [
            "Consumers in the EU may withdraw from a distance contract within 14 days of receiving the goods, without giving a reason, under the Bulgarian Consumer Protection Act and Directive 2011/83/EU.",
            "Goods must be returned unworn and in a resaleable condition. This right does not affect your statutory rights in respect of faulty goods.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            "All artwork, photography and copy on this site is original and owned by the label. It may not be reproduced, printed or used commercially without written permission.",
          ],
        },
        {
          heading: "Disputes",
          body: [
            "Bulgarian law governs these terms. Consumers may also use the European Commission's Online Dispute Resolution platform.",
            `Complaints can be sent to ${site.email} and will be answered within 14 days.`,
          ],
        },
        {
          heading: "Placeholder notice",
          body: [
            "This page is drafted as a working starting point and has not been reviewed by a lawyer. Have it checked against current Bulgarian and EU consumer law before trading.",
          ],
        },
      ]}
    />
  );
}
