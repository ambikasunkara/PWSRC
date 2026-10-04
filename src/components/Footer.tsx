import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-ink-foreground">PurchaseWise</p>
          <p className="mt-2 text-sm text-ink-foreground/80">
            Evidence-backed shopping decisions from a deterministic multi-agent pipeline.
          </p>
        </div>
        <nav aria-label="Product" className="text-sm">
          <p className="font-semibold text-ink-foreground">Product</p>
          <ul className="mt-2 space-y-2">
            {[
              { to: "/find", label: "Find Product" },
              { to: "/check", label: "Check Product" },
              { to: "/compare", label: "Compare" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-ink-foreground/85 underline-offset-4 hover:text-ink-foreground hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Project" className="text-sm">
          <p className="font-semibold text-ink-foreground">Project</p>
          <ul className="mt-2 space-y-2">
            {[
              { to: "/how-it-works", label: "How It Works" },
              { to: "/about", label: "About" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-ink-foreground/85 underline-offset-4 hover:text-ink-foreground hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-semibold text-ink-foreground">Data disclosure</p>
          <p className="mt-2 text-ink-foreground/80">
            Marketplace prices shown for Amazon, Flipkart and Croma are demo values derived from the
            local catalog. No live retailer API is connected.
          </p>
        </div>
      </div>
      <div className="border-t border-white/15 px-4 py-4 text-center text-sm text-ink-foreground/75">
        PurchaseWise
      </div>
    </footer>
  );
}
