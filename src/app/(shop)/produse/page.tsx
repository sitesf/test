import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/utils";
import { ProductCard, type CardProduct } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Produse",
  description: "Catalogul complet de gadgeturi și produse practice. Filtrează după categorie, sortează după preț sau popularitate.",
};

type SearchParams = {
  categorie?: string;
  sort?: string;
  q?: string;
};

const SORT_OPTIONS = [
  { value: "noi", label: "Cele mai noi" },
  { value: "populare", label: "Popularitate" },
  { value: "pret-asc", label: "Preț crescător" },
  { value: "pret-desc", label: "Preț descrescător" },
];

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { categorie, q } = searchParams;
  const sort = SORT_OPTIONS.some((o) => o.value === searchParams.sort) ? searchParams.sort! : "noi";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(categorie ? { category: { slug: categorie } } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { category: true },
      orderBy:
        sort === "populare"
          ? [{ popularity: "desc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
    }),
  ]);

  // Price sorting uses the effective (possibly discounted) price, which
  // cannot be expressed directly in the Prisma orderBy — sort in memory.
  if (sort === "pret-asc") products.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (sort === "pret-desc") products.sort((a, b) => effectivePrice(b) - effectivePrice(a));

  const cards: CardProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? "",
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    category: p.category.name,
  }));

  /** Builds a catalog URL preserving the other active filters. */
  const buildUrl = (params: Partial<SearchParams>) => {
    const merged = { categorie, sort, q, ...params };
    const sp = new URLSearchParams();
    if (merged.categorie) sp.set("categorie", merged.categorie);
    if (merged.sort && merged.sort !== "noi") sp.set("sort", merged.sort);
    if (merged.q) sp.set("q", merged.q);
    const qs = sp.toString();
    return qs ? `/produse?${qs}` : "/produse";
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16 lg:px-20">
      <header className="mb-10">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Toate produsele</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {cards.length} {cards.length === 1 ? "produs" : "produse"}
          {q ? ` pentru căutarea „${q}”` : ""}
        </p>
      </header>

      {/* Toolbar: search + category filter + sorting */}
      <div className="mb-10 flex flex-col gap-4">
        <form action="/produse" method="get" className="flex max-w-md items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
          {categorie && <input type="hidden" name="categorie" value={categorie} />}
          {sort !== "noi" && <input type="hidden" name="sort" value={sort} />}
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Caută produse…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Caută produse"
          />
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl({ categorie: undefined })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                !categorie
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              Toate
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={buildUrl({ categorie: c.slug })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  categorie === c.slug
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <SortSelect options={SORT_OPTIONS} current={sort} categorie={categorie} q={q} />
        </div>
      </div>

      {/* Product grid */}
      {cards.length === 0 ? (
        <div className="rounded-2xl bg-secondary/50 px-6 py-20 text-center">
          <p className="font-display text-2xl">Niciun produs găsit</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Încearcă o altă căutare sau{" "}
            <Link href="/produse" className="underline underline-offset-4 hover:text-foreground">
              vezi toate produsele
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
