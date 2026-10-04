import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Camera,
  GitCompareArrows,
  Layers,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import { PRODUCTS } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PurchaseWise — Evidence-Backed Shopping Decisions" },
      {
        name: "description",
        content:
          "PurchaseWise is an AI shopping decision assistant that recommends, verifies and compares products using only traceable catalog evidence.",
      },
      { property: "og:title", content: "PurchaseWise — Evidence-Backed Shopping Decisions" },
      {
        property: "og:description",
        content:
          "Find, check and compare products with verdict badges, confidence scores and verifiable catalog evidence — no hallucinated claims.",
      },
    ],
  }),
  component: Home,
});

const CAPABILITIES = [
  {
    to: "/find",
    Icon: Search,
    title: "Find Product",
    body: "Describe what you need in plain language. PurchaseWise parses budget, category and priorities, then returns a verdict with evidence.",
  },
  {
    to: "/check",
    Icon: Camera,
    title: "Check Product",
    body: "Upload a listing screenshot. Specs are extracted, matched to the catalog, verified, and price-checked for savings.",
  },
  {
    to: "/compare",
    Icon: GitCompareArrows,
    title: "Compare",
    body: "Put any two or three catalog products side by side in an aligned specification matrix across all supported categories.",
  },
] as const;

function Home() {
  return (
    <div>
      <section className="pw-hero-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-ink-foreground">
            <ShieldCheck aria-hidden className="size-4" />
            Anti-hallucination by design
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold text-ink-foreground sm:text-5xl lg:text-6xl">
            Shopping decisions you can actually defend.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-foreground/85">
            PurchaseWise runs a deterministic five-stage multi-agent pipeline over an indexed
            product catalog. Every verdict, strength and trade-off links back to a specification or
            a verified review — nothing is invented.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90"
            >
              <Link to="/find">Find a product for me</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-ink-foreground hover:bg-white/15 hover:text-ink-foreground"
            >
              <Link to="/check">Check a product I found</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: `${PRODUCTS.length}`, v: "Indexed products" },
              { k: "5", v: "Pipeline agents" },
              { k: "3", v: "Stores compared" },
              { k: "0", v: "Unsourced claims" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl font-bold text-ink-foreground">{s.k}</dt>
                <dd className="text-sm text-ink-foreground/80">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Three ways to decide</h2>
        <p className="mt-2 max-w-2xl text-foreground">
          Each mode uses the same evidence contract: a verdict badge, a confidence indicator,
          strengths against weaknesses, and citations you can check.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Card key={c.to} className="border-border bg-card text-card-foreground">
              <CardHeader>
                <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <c.Icon aria-hidden className="size-5" />
                </span>
                <CardTitle className="mt-3 text-card-foreground">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground">{c.body}</p>
                <Button asChild variant="outline">
                  <Link to={c.to}>Open {c.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold text-secondary-foreground">
            Why evidence-backed matters
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                Icon: BadgeCheck,
                title: "Grounded, not generated",
                body: "Claims are drawn from indexed specifications and verified reviews. If the catalog cannot support a claim, it is reported as unverified instead of guessed.",
              },
              {
                Icon: Layers,
                title: "Deterministic pipeline",
                body: "Requirement understanding, retrieval, critique, evidence verification and deal lookup run in a fixed order, so the same query always produces the same answer.",
              },
              {
                Icon: Store,
                title: "Transparent pricing",
                body: "Amazon, Flipkart and Croma comparisons are clearly labelled as demo data derived from the catalog, never presented as live retail prices.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 text-card-foreground"
              >
                <f.Icon aria-hidden className="size-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
