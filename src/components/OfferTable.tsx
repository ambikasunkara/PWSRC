import { formatINR } from "@/lib/catalog";
import type { Offer, ProviderStatus } from "@/lib/engine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function StatusBadge({ status }: { status: ProviderStatus }) {
  switch (status) {
    case "LIVE":
      return (
        <span className="inline-flex items-center rounded-md border border-success-soft-foreground/25 bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-soft-foreground">
          LIVE
        </span>
      );
    case "DEMO":
      return (
        <span className="inline-flex items-center rounded-md border border-warning-soft-foreground/25 bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-soft-foreground">
          DEMO
        </span>
      );
    case "NO CREDENTIALS":
      return (
        <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          NO CREDENTIALS
        </span>
      );
    case "NO RESULTS":
      return (
        <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          NO RESULTS
        </span>
      );
    case "ERROR":
      return (
        <span className="inline-flex items-center rounded-md border border-danger-soft-foreground/25 bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger-soft-foreground">
          ERROR
        </span>
      );
    default:
      return null;
  }
}

export function OfferTable({ offers }: { offers: Offer[] }) {
  // Only valid, available offers are candidates for best price highlight
  const validAvailableOffers = offers.filter(
    (o) => o.availability && o.price > 0 && o.status !== "NO RESULTS" && o.status !== "ERROR",
  );
  const best =
    validAvailableOffers.length > 0 ? Math.min(...validAvailableOffers.map((o) => o.price)) : null;

  return (
    <div className="space-y-3">
      <div
        role="note"
        className="rounded-md border border-warning-soft-foreground/25 bg-warning-soft px-3 py-2 text-sm font-medium text-warning-soft-foreground"
      >
        Marketplace discovery — provider statuses reflect real connection mode. Real provider URLs
        are preserved when available.
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-foreground">Store</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Price</TableHead>
              <TableHead className="text-foreground">Was</TableHead>
              <TableHead className="text-foreground">Availability</TableHead>
              <TableHead className="text-foreground">Delivery</TableHead>
              <TableHead className="text-foreground">Product Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o, idx) => (
              <TableRow key={`${o.marketplace}_${o.variant ?? idx}`}>
                <TableCell className="font-semibold text-foreground">
                  <div>{o.marketplace}</div>
                  {o.variant ? (
                    <div className="text-xs font-normal text-muted-foreground">{o.variant}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {o.price > 0 && o.status !== "NO RESULTS" ? (
                    <>
                      {formatINR(o.price)}
                      {best !== null && o.price === best && o.availability ? (
                        <span className="ml-2 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-soft-foreground">
                          Best price
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="font-normal text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {o.original_price > 0 && o.status !== "NO RESULTS" ? (
                    <span className="line-through">{formatINR(o.original_price)}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell
                  className={
                    o.status === "NO RESULTS"
                      ? "text-muted-foreground"
                      : o.availability
                        ? "font-medium text-success"
                        : "font-medium text-destructive"
                  }
                >
                  {o.status === "NO RESULTS"
                    ? "Not carried"
                    : o.availability
                      ? "In stock"
                      : "Out of stock"}
                </TableCell>
                <TableCell className="text-foreground">{o.delivery || "—"}</TableCell>
                <TableCell>
                  {o.url ? (
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View deal
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Link unavailable</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
