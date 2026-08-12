"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { duration, ease } from "@/motion/tokens";
import { track } from "@/lib/analytics";
import { cn, padIndex } from "@/lib/utils";
import { DashedRule } from "@/components/ui/Rule";
import { Label } from "@/components/ui/Label";
import type { CatalogFilters, SizeCode, SortKey } from "@/types";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price, low" },
  { key: "price-desc", label: "Price, high" },
];

interface Facets {
  sizes: SizeCode[];
  colors: { code: string; name: string }[];
}

/**
 * Shop filtering.
 *
 * A single line that expands downward into a panel, rather than a sidebar.
 * A sidebar would take a permanent third of the page away from the
 * photography, and with a catalogue this size it would sit mostly empty —
 * which makes the shop look under-stocked before anyone has read a word.
 *
 * The bar itself always shows the active count, so filters can never be left
 * on invisibly. Everything inside is a real checkbox or radio underneath its
 * styling, so the whole panel is keyboard-operable and announces its state.
 */
export function FilterBar({
  filters,
  sort,
  facets,
  resultCount,
  onChange,
  onSortChange,
  onReset,
}: {
  filters: CatalogFilters;
  sort: SortKey;
  facets: Facets;
  resultCount: number;
  onChange: (next: CatalogFilters) => void;
  onSortChange: (next: SortKey) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);

  const activeCount =
    (filters.size?.length ?? 0) +
    (filters.color?.length ?? 0) +
    (filters.availableOnly ? 1 : 0);

  function toggleSize(size: SizeCode) {
    const current = filters.size ?? [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    track({ name: "filter_apply", facet: "size", value: size });
    onChange({ ...filters, size: next.length ? next : undefined });
  }

  function toggleColor(code: string) {
    const current = filters.color ?? [];
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    track({ name: "filter_apply", facet: "color", value: code });
    onChange({ ...filters, color: next.length ? next : undefined });
  }

  return (
    <div className="sticky top-16 z-[var(--z-sticky)] bg-[var(--ground-veil)] backdrop-blur-[6px]">
      <DashedRule className="text-[var(--figure)]" />

      <div className="flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className="group inline-flex items-center gap-2.5 type-label text-[var(--figure)]"
          >
            Filter
            {activeCount > 0 && (
              <span className="type-data text-[var(--signal)]">
                {padIndex(activeCount)}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "inline-block transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
                open && "rotate-180",
              )}
            >
              &#8595;
            </span>
          </button>

          <span aria-live="polite" className="type-micro text-[var(--figure-muted)]">
            {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {/* Sort as inline radios: four options do not need a select, and this
            keeps every control on the page visible at a glance. */}
        <fieldset className="hidden items-center gap-4 sm:flex">
          <legend className="sr-only">Sort by</legend>
          {SORT_OPTIONS.map((option) => (
            <label key={option.key} className="cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={option.key}
                checked={sort === option.key}
                onChange={() => onSortChange(option.key)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "type-micro transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--signal)]",
                  sort === option.key
                    ? "text-[var(--figure)]"
                    : "text-[var(--figure-muted)] hover:text-[var(--figure)]",
                )}
              >
                {option.label}
              </span>
            </label>
          ))}
        </fieldset>

        {/* Narrow screens get a real select — four inline radios do not fit. */}
        <label className="sm:hidden">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="type-micro bg-transparent text-[var(--figure)]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: duration.base, ease: ease.outExpo }}
            className="overflow-hidden"
          >
            <DashedRule className="text-[var(--figure)]" />
            <div className="grid gap-10 py-8 sm:grid-cols-2 lg:grid-cols-4">
              <fieldset>
                <legend className="mb-4">
                  <Label>Size</Label>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {facets.sizes.map((size) => {
                    const checked = filters.size?.includes(size) ?? false;
                    return (
                      <label key={size} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSize(size)}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "inline-block min-w-[3rem] border px-3.5 py-2.5 text-center type-label transition-colors",
                            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--signal)]",
                            checked
                              ? "border-[var(--figure)] bg-[var(--figure)] text-[var(--ground)]"
                              : "border-[var(--rule-strong)] text-[var(--figure)] hover:border-[var(--figure)]",
                          )}
                        >
                          {size}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-4">
                  <Label>Colour</Label>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {facets.colors.map((colour) => {
                    const checked = filters.color?.includes(colour.code) ?? false;
                    return (
                      <label key={colour.code} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleColor(colour.code)}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "inline-block border px-3.5 py-2.5 type-label transition-colors",
                            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--signal)]",
                            checked
                              ? "border-[var(--figure)] bg-[var(--figure)] text-[var(--ground)]"
                              : "border-[var(--rule-strong)] text-[var(--figure)] hover:border-[var(--figure)]",
                          )}
                        >
                          {colour.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-4">
                  <Label>Availability</Label>
                </legend>
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly ?? false}
                    onChange={(e) =>
                      onChange({ ...filters, availableOnly: e.target.checked || undefined })
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "inline-block border px-3.5 py-2.5 type-label transition-colors",
                      "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--signal)]",
                      filters.availableOnly
                        ? "border-[var(--figure)] bg-[var(--figure)] text-[var(--ground)]"
                        : "border-[var(--rule-strong)] text-[var(--figure)] hover:border-[var(--figure)]",
                    )}
                  >
                    In stock only
                  </span>
                </label>
              </fieldset>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onReset}
                  disabled={activeCount === 0}
                  className="link-wipe type-label text-[var(--figure-muted)] disabled:opacity-40"
                >
                  Clear all
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DashedRule className="text-[var(--figure)]" />
    </div>
  );
}
