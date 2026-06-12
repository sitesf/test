"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { STORE_NAME } from "@/lib/config";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Produse" },
  { href: "/categorii", label: "Categorii" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const router = useRouter();
  const { count, hydrated, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch() {
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
    router.push(q ? `/produse?q=${encodeURIComponent(q)}` : "/produse");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <nav className="flex items-center justify-between px-6 py-5 font-body md:px-12 lg:px-20">
        {/* Logo — the name comes from the single STORE_NAME constant */}
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ✦ {STORE_NAME}
        </Link>

        {/* Center links (hidden on mobile) */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: search + cart (+ mobile menu) */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5"
            >
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută produse…"
                className="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-48"
                aria-label="Caută produse"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Închide căutarea"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Caută produse"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={openCart}
            className="relative rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
            aria-label="Deschide coșul de cumpărături"
          >
            <ShoppingBag className="h-5 w-5" />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Meniu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <div
        className={cn(
          "overflow-hidden border-border transition-all duration-300 md:hidden",
          menuOpen ? "max-h-64 border-t" : "max-h-0"
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
