import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/InfoPage";
import { site } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "What ATRIX collects, why, and how to have it removed.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy"
      intro={`${site.legalName} is the data controller for personal data collected through this site.`}
      blocks={[
        {
          heading: "What is collected",
          body: [
            "Order data: name, delivery address, email, and what you bought. Needed to fulfil the contract.",
            "Newsletter: your email address, only if you enter it. Consent can be withdrawn at any time.",
            "Analytics: aggregate page and interaction data, only if analytics is enabled and you have consented to it.",
          ],
        },
        {
          heading: "What is not collected",
          body: [
            "Card details never reach this site. Payment is handled entirely by the payment provider.",
            "The bag is stored in your own browser's local storage and is never transmitted anywhere.",
          ],
        },
        {
          heading: "Retention",
          body: [
            "Order records are kept for the period required by Bulgarian accounting law. Newsletter addresses are kept until you unsubscribe.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Under the GDPR you can request access to your data, correction, erasure, restriction of processing, and portability, and you can object to processing based on legitimate interests.",
            `Write to ${site.email} and you will get an answer within one month. You may also complain to the Bulgarian Commission for Personal Data Protection.`,
          ],
        },
        {
          heading: "Placeholder notice",
          body: [
            "This page is drafted as a working starting point and has not been reviewed by a lawyer. Have it checked and completed before trading.",
          ],
        },
      ]}
    />
  );
}
