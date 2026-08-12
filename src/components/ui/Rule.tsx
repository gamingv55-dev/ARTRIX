import { cn } from "@/lib/utils";

/**
 * Rules are structure in this layout, not decoration — they set the grid the
 * eye reads the page against. The dashed variant is the identity's signature
 * mark; the solid one is for quieter divisions inside a block.
 */

export function DashedRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rule-dashed text-[var(--figure)]", className)} />;
}

export function SolidRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rule-solid", className)} />;
}

export function VerticalDashedRule({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("rule-dashed-v text-[var(--figure)]", className)} />
  );
}
