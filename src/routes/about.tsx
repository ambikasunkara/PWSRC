import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUCTS, REVIEWS } from "@/lib/catalog";
import { downloadCsv, downloadJson } from "@/lib/export";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PurchaseWise" },
      {
        name: "description",
        content:
          "About PurchaseWise: technical stack, academic project scope, accessibility standards and catalog data exports.",
      },
      { property: "og:title", content: "About — PurchaseWise" },
      {
        property: "og:description",
        content:
          "Technical stack and academic documentation for the PurchaseWise shopping decision assistant.",
      },
    ],
  }),
  component: About,
});

const STACK = [
  [
    "Decision pipeline",
    "Five deterministic agents: requirement understanding, retrieval, critic/scorer, evidence verification, marketplace deals.",
  ],
  ["Retrieval", "FAISS vector index over catalog documents with sentence embeddings."],
  ["Backend reference", "Python FastAPI service with Pydantic models and a 119-test pytest suite."],
  [
    "This interface",
    "React 19 + TanStack Start, Tailwind CSS v4 semantic tokens, shadcn/ui components.",
  ],
  ["Vision", "Screenshot OCR pipeline for the Check Product flow."],
  [
    "Data",
    `${PRODUCTS.length} catalog products and ${REVIEWS.length} reviews across laptops, smartphones and headphones.`,
  ],
] as const;

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">About PurchaseWise</h1>
      <p className="mt-2 text-foreground">
        PurchaseWise is a final-year academic project exploring whether a shopping assistant can be
        genuinely trustworthy by refusing to state anything it cannot evidence.
      </p>

      <Card className="mt-8 border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-card-foreground">Technical stack</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {STACK.map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold text-foreground">{k}</dt>
                <dd className="text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-card-foreground">Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          <p>
            Every surface in this build pairs with an explicit foreground token, so text is never
            rendered light-on-light or dark-on-dark. Body and heading colours target WCAG 2.1 AA
            contrast, placeholders use the muted foreground token rather than a faint grey, and
            focus outlines are visible on all interactive elements.
          </p>
          <p>
            Status is never communicated by colour alone: verdicts, availability and evidence
            strength all carry text labels and icons alongside their colour.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-card-foreground">Exports &amp; artifacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">
            Download the underlying data for your report, or export individual decisions from the
            Find and Check pages.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => downloadJson("purchasewise-catalog.json", PRODUCTS)}
            >
              <Download aria-hidden className="size-4" /> Catalog (JSON)
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv("purchasewise-catalog.csv", [
                  ["Product ID", "Name", "Brand", "Category", "Price (INR)", "Rating", "Reviews"],
                  ...PRODUCTS.map((p) => [
                    p.product_id,
                    p.name,
                    p.brand,
                    p.category,
                    p.price_inr,
                    p.rating,
                    p.review_count,
                  ]),
                ])
              }
            >
              <Download aria-hidden className="size-4" /> Catalog (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadJson("purchasewise-reviews.json", REVIEWS)}
            >
              <Download aria-hidden className="size-4" /> Reviews (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
