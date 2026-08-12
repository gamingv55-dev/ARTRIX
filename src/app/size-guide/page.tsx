import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = pageMetadata({
  title: "Size guide",
  description: "Measurements for the ATRIX oversized cut, in centimetres, garment flat.",
  path: "/size-guide",
});

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Fit"
      title="Size guide"
      intro="Every piece is cut oversized with a dropped shoulder. If you want it to sit closer to the body, take your usual size; for the fit shown in the lookbook, size up once."
      blocks={[
        {
          heading: "Chest, garment flat",
          body: ["Measured across the chest one centimetre below the armhole, then doubled."],
          rows: [
            { label: "S", value: "56 cm" },
            { label: "M", value: "59 cm" },
            { label: "L", value: "62 cm" },
            { label: "XL", value: "65 cm" },
            { label: "XXL", value: "68 cm" },
          ],
        },
        {
          heading: "Body length",
          body: ["High point of the shoulder to the hem."],
          rows: [
            { label: "S", value: "70 cm" },
            { label: "M", value: "72 cm" },
            { label: "L", value: "74 cm" },
            { label: "XL", value: "76 cm" },
            { label: "XXL", value: "78 cm" },
          ],
        },
        {
          heading: "The fit shown",
          body: [
            "The model is 186 cm and wears a size L in every lookbook frame.",
            "Measurements are taken from a finished garment and can vary by about a centimetre either way. Cotton this heavy will shrink slightly on a first hot wash — washing at 30°C avoids it.",
          ],
        },
      ]}
    />
  );
}
