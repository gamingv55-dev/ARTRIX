import type { ReactNode } from "react";
import { TextReveal } from "@/components/ui/Reveal";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";

export interface InfoBlock {
  heading: string;
  /** Paragraphs, or a definition list for tabular content like a size chart. */
  body?: string[];
  rows?: { label: string; value: string }[];
}

/**
 * Shared layout for the information pages — shipping, terms, privacy, sizing.
 *
 * These are the pages nobody designs and everybody reads. They get the same
 * grid, the same rules and the same measure as the rest of the site, because a
 * returns policy set in default browser styles is the fastest way to make a
 * careful brand look careless.
 *
 * Measure is capped at 62ch: long-form text set across a full editorial column
 * is unreadable no matter how good the typeface is.
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  blocks,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  blocks: InfoBlock[];
  footer?: ReactNode;
}) {
  return (
    <div data-ground="bone" className="min-h-screen bg-[var(--color-bone)] pt-28">
      <div className="page-shell">
        <header className="pb-12">
          <Label>{eyebrow}</Label>
          <TextReveal
            as="h1"
            lines={[title]}
            className="text-display-2 mt-4 font-medium text-[var(--color-ink)]"
          />
          {intro && (
            <p className="text-lead mt-6 max-w-[52ch] text-[var(--color-graphite)]">{intro}</p>
          )}
          <DashedRule className="mt-12 text-[var(--color-ink)]" />
        </header>

        <div className="grid-12 pb-[var(--spacing-band-lg)]">
          <div className="col-span-12 flex flex-col gap-14 lg:col-span-8 lg:col-start-4">
            {blocks.map((block) => (
              <section key={block.heading}>
                <h2 className="text-h3 font-medium text-[var(--color-ink)]">{block.heading}</h2>

                {block.body && (
                  <div className="mt-4 flex max-w-[var(--container-prose)] flex-col gap-4">
                    {block.body.map((paragraph, i) => (
                      <p key={i} className="text-body text-[var(--color-graphite)]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {block.rows && (
                  <dl className="mt-6 flex flex-col">
                    <DashedRule className="text-[var(--color-ink)]" />
                    {block.rows.map((row) => (
                      <div key={row.label}>
                        <div className="flex items-baseline justify-between gap-6 py-3.5">
                          <dt className="type-label text-[var(--color-ink)]">{row.label}</dt>
                          <dd className="type-data text-right text-[var(--color-graphite)]">
                            {row.value}
                          </dd>
                        </div>
                        <div className="rule-solid" />
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            ))}

            {footer && <div className="pt-4">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
