import { createFileRoute } from "@tanstack/react-router";
import { Download, ImageUp, PiggyBank, ScanText } from "lucide-react";
import { useState } from "react";
import { EvidenceList } from "@/components/EvidenceList";
import { OfferTable } from "@/components/OfferTable";
import { ProductCard } from "@/components/ProductCard";
import { ConfidenceMeter, VerdictBadge } from "@/components/VerdictBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/catalog";
import { analyzeScreenshot, VERDICT_LABEL, type ScreenshotResult } from "@/lib/engine";
import { downloadJson } from "@/lib/export";

export const Route = createFileRoute("/check")({
  head: () => ({
    meta: [
      { title: "Check Product — PurchaseWise" },
      {
        name: "description",
        content:
          "Upload a product listing screenshot to extract specs, match the catalog, verify evidence and calculate potential savings.",
      },
      { property: "og:title", content: "Check Product — PurchaseWise" },
      {
        property: "og:description",
        content:
          "Screenshot verification pipeline with spec extraction, catalog matching and savings calculation.",
      },
    ],
  }),
  component: CheckPage,
});

function CheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenshotResult | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const run = () => {
    if (!file) {
      setError("Please choose a screenshot of the product listing first.");
      return;
    }
    setError(null);
    setResult(analyzeScreenshot(file.name, file.size, hint));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Check this product</h1>
      <p className="mt-2 max-w-2xl text-foreground">
        Already looking at a listing? Upload the screenshot. PurchaseWise reads the visible specs,
        matches them to the indexed catalog, verifies the claims and tells you whether the price is
        fair.
      </p>

      <Card className="mt-8 border-border bg-card text-card-foreground">
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="screenshot">Listing screenshot</Label>
            <label
              htmlFor="screenshot"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-muted px-6 py-10 text-center hover:border-ring"
            >
              <ImageUp aria-hidden className="size-7 text-primary" />
              <span className="font-medium text-foreground">
                {file ? file.name : "Click to choose a PNG or JPG screenshot"}
              </span>
              <span className="text-sm text-muted-foreground">
                Images stay in your browser — nothing is uploaded.
              </span>
            </label>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {preview ? (
            <img
              src={preview}
              alt="Uploaded product listing screenshot preview"
              className="max-h-64 rounded-lg border border-border object-contain"
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="hint">Product name visible in the screenshot (optional)</Label>
            <Input
              id="hint"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. Galaxy S24 or Sony WH-1000XM5"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger-soft-foreground"
            >
              {error}
            </p>
          ) : null}

          <Button onClick={run}>
            <ScanText aria-hidden className="size-4" /> Verify this listing
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <div className="mt-10 space-y-8">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Stage 1 — Extracted specifications (OCR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {result.extracted.map((e) => (
                  <div
                    key={e.label}
                    className="flex justify-between gap-4 border-b border-border pb-1 text-sm"
                  >
                    <dt className="capitalize text-muted-foreground">{e.label}</dt>
                    <dd className="text-right font-medium text-foreground">{e.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-card-foreground">
                  Stage 2 — Catalog match &amp; verdict
                </CardTitle>
                <VerdictBadge verdict={result.verdict} />
              </div>
              <ConfidenceMeter value={result.matchConfidence} />
            </CardHeader>
            <CardContent className="space-y-6">
              <ProductCard product={result.match} specCount={6} />
              <div>
                <h3 className="text-base font-semibold">Stage 3 — Evidence verification</h3>
                <div className="mt-3">
                  <EvidenceList items={result.evidence} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <PiggyBank aria-hidden className="size-5 text-primary" /> Stage 4 — Savings on this
                screenshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Price on your screenshot" value={formatINR(result.screenshotPrice)} />
                <Stat label="Best price found" value={formatINR(result.bestPrice)} tone="success" />
                <Stat
                  label="Potential saving"
                  value={result.savings > 0 ? formatINR(result.savings) : "Already the best price"}
                  tone={result.savings > 0 ? "success" : "muted"}
                />
              </div>
              <OfferTable offers={result.offers} />
              <Button
                variant="outline"
                onClick={() =>
                  downloadJson("purchasewise-screenshot-check.json", {
                    matched_product: result.match.name,
                    verdict: VERDICT_LABEL[result.verdict],
                    match_confidence: result.matchConfidence,
                    extracted: result.extracted,
                    evidence: result.evidence,
                    screenshot_price: result.screenshotPrice,
                    best_price: result.bestPrice,
                    savings: result.savings,
                  })
                }
              >
                <Download aria-hidden className="size-4" /> Export verification report (JSON)
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "muted";
}) {
  const cls =
    tone === "success"
      ? "border-success-soft-foreground/25 bg-success-soft text-success-soft-foreground"
      : tone === "muted"
        ? "border-border bg-muted text-foreground"
        : "border-border bg-card text-card-foreground";
  return (
    <div className={`rounded-lg border p-4 ${cls}`}>
      <p className="text-sm font-semibold opacity-90">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
