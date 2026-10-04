import { CheckCircle2, CircleAlert, ShieldCheck, XCircle } from "lucide-react";
import { VERDICT_LABEL, type Verdict } from "@/lib/engine";
import { cn } from "@/lib/utils";

const STYLES: Record<Verdict, string> = {
  strong_buy: "bg-success text-success-foreground border-success",
  good_buy: "bg-success-soft text-success-soft-foreground border-success-soft-foreground/25",
  consider: "bg-warning-soft text-warning-soft-foreground border-warning-soft-foreground/25",
  avoid: "bg-danger-soft text-danger-soft-foreground border-danger-soft-foreground/25",
};

const ICONS: Record<Verdict, typeof ShieldCheck> = {
  strong_buy: ShieldCheck,
  good_buy: CheckCircle2,
  consider: CircleAlert,
  avoid: XCircle,
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const Icon = ICONS[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold",
        STYLES[verdict],
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}

export function ConfidenceMeter({ value }: { value: number }) {
  const tone = value >= 75 ? "bg-success" : value >= 55 ? "bg-warning" : "bg-destructive";
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm font-medium text-foreground">
        <span>Confidence</span>
        <span>{value}%</span>
      </div>
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence ${value} percent`}
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
