import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Download, Scale, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { EvidenceList } from "@/components/EvidenceList";
import { OfferTable } from "@/components/OfferTable";
import { ProductCard } from "@/components/ProductCard";
import { ConfidenceMeter, VerdictBadge } from "@/components/VerdictBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/catalog";
import { evaluate, priorityLabel, VERDICT_LABEL, type Decision } from "@/lib/engine";
import { downloadJson } from "@/lib/export";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find Product — PurchaseWise" },
      {
        name: "description",
        content:
          "Describe your shopping requirement in plain language and get a verdict, confidence score, evidence and multi-store price comparison.",
      },
      { property: "og:title", content: "Find Product — PurchaseWise" },
      {
        property: "og:description",
        content:
          "Natural language product search with requirement understanding and verifiable catalog evidence.",
      },
    ],
  }),
  component: FindPage,
});

const EXAMPLES = [
  "I want a laptop under 60000 with good battery life for coding",
  "Comfortable running shoes under 5000 with good grip",
  "Gentle moisturizer for dry skin with ceramides and hyaluronic acid",
  "Ergonomic mesh office chair with lumbar support under 7000",
];

function FindPage() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Decision | null>(null);

  const run = (q: string) => {
    if (!q.trim()) {
      setError("Please describe what you are looking for.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(evaluate(q));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Find a product for me</h1>
      <p className="mt-2 max-w-2xl text-foreground">
        Write your requirement the way you would say it. PurchaseWise extracts the category, budget
        and priorities, then scores every catalog candidate against them.
      </p>

      <Card className="mt-8 border-border bg-card text-card-foreground">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(query);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="requirement">Your shopping requirement</Label>
              <Textarea
                id="requirement"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. I need a lightweight laptop under 70000 with long battery life for college"
                aria-describedby={error ? "requirement-error" : undefined}
              />
              {error ? (
                <p
                  id="requirement-error"
                  role="alert"
                  className="flex items-center gap-2 rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger-soft-foreground"
                >
                  <AlertTriangle aria-hidden className="size-4" /> {error}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit">
                <Search aria-hidden className="size-4" /> Get recommendation
              </Button>
              {EXAMPLES.map((ex) => (
                <Button
                  key={ex}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(ex);
                    run(ex);
                  }}
                >
                  {ex.length > 38 ? `${ex.slice(0, 38)}…` : ex}
                </Button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {result ? <Results result={result} /> : null}
    </div>
  );
}

function Results({ result }: { result: Decision }) {
  const r = result.requirement;
  return (
    <div className="mt-10 space-y-8">
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-card-foreground">Requirement understanding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Category"
            value={r.category ? r.category : "Not specified — all categories searched"}
          />
          <Field
            label="Budget"
            value={r.budget_max ? `Up to ${formatINR(r.budget_max)}` : "No budget stated"}
          />
          <Field label="Preferred brand" value={r.brand ?? "None stated"} />
          <div className="sm:col-span-3">
            <p className="text-sm font-semibold text-muted-foreground">Detected priorities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.priorities.length === 0 ? (
                <span className="text-sm text-foreground">
                  None detected — ranking by rating and value.
                </span>
              ) : (
                r.priorities.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-info-soft px-3 py-1 text-sm font-semibold text-info-soft-foreground"
                  >
                    {priorityLabel(p)}
                  </span>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {result.product ? (
        <>
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-card-foreground">Recommendation</CardTitle>
                <VerdictBadge verdict={result.verdict} />
              </div>
              <ConfidenceMeter value={result.confidence} />
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="rounded-lg border border-border bg-info-soft p-4 text-sm text-info-soft-foreground">
                {result.explanation}
              </p>
              <ProductCard product={result.product} specCount={6} />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-success-soft p-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-success-soft-foreground">
                    <ThumbsUp aria-hidden className="size-4" /> Strengths &amp; matches
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-success-soft-foreground">
                    {[...result.satisfied, ...result.strengths].map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-warning-soft p-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-warning-soft-foreground">
                    <ThumbsDown aria-hidden className="size-4" /> Weaknesses &amp; trade-offs
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-warning-soft-foreground">
                    {[...result.unmet, ...result.weaknesses, ...result.tradeOffs].map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                    {result.unmet.length + result.weaknesses.length + result.tradeOffs.length ===
                    0 ? (
                      <li>• No material trade-offs found for this requirement.</li>
                    ) : null}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold">Verifiable evidence</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  Each item names its source so you can check it in the catalog.
                </p>
                <EvidenceList items={result.evidence} />
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Scale aria-hidden className="size-4" /> Alternatives considered
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.alternatives.map((a) => (
                    <li
                      key={a.product.product_id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-foreground">{a.product.name}</span>
                      <span className="text-foreground">{formatINR(a.product.price_inr)}</span>
                      <span className="text-muted-foreground">{a.reason}</span>
                      <span className="font-semibold text-foreground">Score {a.score}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold">Where to buy</h3>
                <div className="mt-3">
                  <OfferTable offers={result.offers} />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  downloadJson("purchasewise-recommendation.json", {
                    query: r.original_query,
                    requirement: r,
                    verdict: VERDICT_LABEL[result.verdict],
                    confidence: result.confidence,
                    product: result.product?.name,
                    evidence: result.evidence,
                    offers: result.offers,
                  })
                }
              >
                <Download aria-hidden className="size-4" /> Export this decision (JSON)
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="rounded-lg border border-border bg-muted p-4 text-foreground">
          No catalog product matched this requirement.
        </p>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
