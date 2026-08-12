"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { duration, ease } from "@/motion/tokens";
import { DashedRule } from "@/components/ui/Rule";
import { cn } from "@/lib/utils";

interface Section {
  title: string;
  /** Rendered as a list when given rows; as paragraphs when given strings. */
  rows?: { label: string; value: string }[];
  body?: string[];
}

/**
 * Specification, care and shipping detail on the product page.
 *
 * Collapsed by default so the buy decision — image, price, size, button — is
 * never pushed below the fold by reference material. Height animates from
 * `auto` via the layout engine rather than a hard-coded max-height, so long
 * and short sections both open at the same speed.
 */
export function ProductAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();

  return (
    <div className="flex flex-col">
      <DashedRule />
      {sections.map((section) => {
        const isOpen = open === section.title;
        const panelId = `${baseId}-${section.title.replace(/\s+/g, "-")}`;

        return (
          <div key={section.title}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : section.title)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-4 text-left type-label text-[var(--figure)]"
              >
                {section.title}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative h-3 w-3 shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
                    isOpen && "rotate-90",
                  )}
                >
                  {/* Plus that rotates into a minus. */}
                  <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                  <span
                    className={cn(
                      "absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current transition-opacity duration-[var(--dur-base)]",
                      isOpen && "opacity-0",
                    )}
                  />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: duration.base, ease: ease.outExpo }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    {section.rows && (
                      <dl className="flex flex-col gap-2.5">
                        {section.rows.map((row) => (
                          <div key={row.label} className="flex justify-between gap-6">
                            <dt className="type-micro text-[var(--figure-muted)]">{row.label}</dt>
                            <dd className="type-data text-right text-[var(--figure)]">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {section.body && (
                      <ul className="flex flex-col gap-2">
                        {section.body.map((line) => (
                          <li key={line} className="text-sm text-[var(--figure-body)]">
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DashedRule />
          </div>
        );
      })}
    </div>
  );
}
