import { createFileRoute } from "@tanstack/react-router";
import { Brain, Database, Gavel, ShieldCheck, Store } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — PurchaseWise" },
      {
        name: "description",
        content:
          "Walk through the five-stage deterministic PurchaseWise pipeline: requirement understanding, FAISS retrieval, critic scoring, evidence verification and marketplace deals.",
      },
      { property: "og:title", content: "How It Works — PurchaseWise" },
      {
        property: "og:description",
        content:
          "The five-stage deterministic multi-agent pipeline behind every PurchaseWise verdict.",
      },
    ],
  }),
  component: HowItWorks,
});

const STAGES = [
  {
    Icon: Brain,
    title: "1. Requirement Understanding",
    body: "The query is parsed into a structured requirement: category, budget ceiling, preferred brand and weighted priorities such as camera, battery or portability.",
    detail:
      "Rule-based extraction keeps this stage deterministic — the same sentence always yields the same requirement object.",
  },
  {
    Icon: Database,
    title: "2. FAISS Semantic Retrieval",
    body: "Catalog documents are embedded and indexed in a FAISS vector store. Retrieval returns the candidate products whose descriptions and specifications are closest to the requirement.",
    detail:
      "Only indexed catalog documents can be retrieved, which is the first guard against invented products.",
  },
  {
    Icon: Gavel,
    title: "3. Critic & Scorer",
    body: "Each candidate is scored on budget fit, buyer rating and per-priority specification coverage, producing a 0–100 score and a ranked shortlist.",
    detail:
      "Scores are additive and explainable: you can see exactly which requirement earned or lost points.",
  },
  {
    Icon: ShieldCheck,
    title: "4. Evidence Verification",
    body: "Every claim in the final answer must be backed by a catalog specification, a catalog price or a verified customer review. Unsupported claims are reported as unverified.",
    detail: "This is the anti-hallucination contract — no evidence, no claim.",
  },
  {
    Icon: Store,
    title: "5. Marketplace Deals",
    body: "The chosen product is priced across Amazon, Flipkart and Croma, flagging the best available price and any savings against the listing you were viewing.",
    detail: "Demo marketplace values are derived from the catalog and always labelled as such.",
  },
] as const;

function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">How PurchaseWise works</h1>
      <p className="mt-2 text-foreground">
        Five agents run in a fixed order. Each one hands a structured object to the next, so results
        are reproducible and auditable.
      </p>

      <ol className="mt-10 space-y-4">
        {STAGES.map((s) => (
          <li
            key={s.title}
            className="rounded-xl border border-border bg-card p-6 text-card-foreground"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <s.Icon aria-hidden className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm text-foreground">{s.body}</p>
                <p className="mt-2 rounded-md bg-info-soft px-3 py-2 text-sm text-info-soft-foreground">
                  {s.detail}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
