import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthModal, type AuthMode } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/find", label: "Find Product" },
  { to: "/check", label: "Check Product" },
  { to: "/compare", label: "Compare" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border bg-card text-card-foreground ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-card-foreground">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag aria-hidden className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">PurchaseWise</span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => openAuth("login")}
          >
            Log in
          </Button>
          <Button size="sm" onClick={() => openAuth("register")}>
            Sign up
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav aria-label="Mobile" className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: l.to === "/" }}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground"
                  activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <Button variant="outline" className="w-full" onClick={() => openAuth("login")}>
                Log in
              </Button>
            </li>
          </ul>
        </nav>
      ) : null}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onOpenChange={setAuthOpen}
        onModeChange={setAuthMode}
      />
    </header>
  );
}
