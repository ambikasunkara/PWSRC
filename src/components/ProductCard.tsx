import { Star } from "lucide-react";
import { formatINR, specLabel, type Product } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProductCard({
  product,
  footer,
  specCount = 4,
}: {
  product: Product;
  footer?: React.ReactNode;
  specCount?: number;
}) {
  const specs = Object.entries(product.specifications).slice(0, specCount);
  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{product.brand}</p>
            <h3 className="text-lg font-semibold text-card-foreground">{product.name}</h3>
          </div>
          <Badge variant="secondary" className="capitalize">
            {product.category}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xl font-bold text-card-foreground">{formatINR(product.price_inr)}</p>
          <p className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
            <Star aria-hidden className="size-4 fill-accent-brand text-accent-brand" />
            {product.rating} / 5
            <span className="text-muted-foreground">({product.review_count} reviews)</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground">{product.description}</p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {specs.map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between gap-3 border-b border-border pb-1 text-sm"
            >
              <dt className="text-muted-foreground">{specLabel(key)}</dt>
              <dd className="text-right font-medium text-foreground">{String(value)}</dd>
            </div>
          ))}
        </dl>
        {footer}
      </CardContent>
    </Card>
  );
}
