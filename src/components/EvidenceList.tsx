import { FileText, MessageSquareQuote, Tag } from "lucide-react";
import type { EvidenceItem } from "@/lib/engine";

const SOURCE_META = {
  catalog_specification: { label: "Catalog specification", Icon: FileText },
  customer_review: { label: "Verified review", Icon: MessageSquareQuote },
  catalog_price: { label: "Catalog price", Icon: Tag },
} as const;

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
        No verifiable evidence was extracted for this request.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const meta = SOURCE_META[item.source_type];
        return (
          <li key={i} className="rounded-lg border border-border bg-card p-4 text-card-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-semibold text-info-soft-foreground">
                <meta.Icon aria-hidden className="size-3.5" />
                {meta.label}
              </span>
              <span
                className={
                  item.strength === "strong"
                    ? "rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-soft-foreground"
                    : "rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning-soft-foreground"
                }
              >
                {item.strength === "strong" ? "Strong evidence" : "Moderate evidence"}
              </span>
            </div>
            <p className="mt-2 font-semibold text-card-foreground">{item.claim}</p>
            <p className="mt-1 text-sm text-foreground">{item.evidence}</p>
          </li>
        );
      })}
    </ul>
  );
}
