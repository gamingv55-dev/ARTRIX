import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/InfoPage";
import { site } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Shipping & returns",
  description: "Delivery times, costs and the returns window for ATRIX orders.",
  path: "/shipping",
});

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Information"
      title="Shipping & returns"
      intro="Orders are packed by hand in Varna, usually within one working day."
      blocks={[
        {
          heading: "Delivery",
          rows: [
            { label: "Bulgaria", value: "2–4 working days" },
            { label: "European Union", value: "5–8 working days" },
            { label: "Rest of world", value: "7–14 working days" },
          ],
        },
        {
          heading: "Cost",
          body: [
            "Shipping within Bulgaria is free on orders over 150.00 BGN, and 6.00 BGN below that.",
            "Rates elsewhere are calculated at checkout from the delivery address. Duties and import taxes outside the EU are the recipient's responsibility.",
          ],
        },
        {
          heading: "Returns",
          body: [
            "Unworn pieces in original condition can be returned within 14 days of delivery for a full refund of the item price.",
            "Return postage is paid by the customer unless the piece arrived faulty or we sent the wrong size. Refunds are issued to the original payment method within five working days of the parcel arriving back.",
            `To start a return, email ${site.email} with your order number.`,
          ],
        },
        {
          heading: "Faults",
          body: [
            "Screen prints are made by hand and small variations in registration and ink coverage are characteristic of the process, not defects.",
            "Anything that cracks, peels or fails at a seam within six months of normal wear will be replaced or refunded.",
          ],
        },
      ]}
    />
  );
}
