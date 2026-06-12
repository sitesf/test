import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata = { title: "Produse — Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const featuredCount = products.filter((p) => p.featured && p.active).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight md:text-4xl">Produse</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} produse în catalog ·{" "}
            <span className={featuredCount === 4 ? "text-foreground" : "font-medium text-accent"}>
              {featuredCount}/4 în caruselul hero
            </span>
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produse/nou">
            <Plus className="h-4 w-4" /> Produs nou
          </Link>
        </Button>
      </div>

      {featuredCount !== 4 && (
        <p className="mt-4 rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
          Caruselul hero are nevoie de exact 4 produse active marcate „featured”. Momentan sunt {featuredCount}.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-background shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-4 font-medium">Produs</th>
              <th className="px-5 py-4 font-medium">Categorie</th>
              <th className="px-5 py-4 font-medium">Preț</th>
              <th className="px-5 py-4 font-medium">Stoc</th>
              <th className="px-5 py-4 font-medium">Stare</th>
              <th className="px-5 py-4 text-right font-medium">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0] ?? ""} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-medium">
                        {p.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />}
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{p.category.name}</td>
                <td className="px-5 py-3.5">
                  {p.salePrice !== null ? (
                    <div>
                      <span className="font-medium text-accent">{formatPrice(p.salePrice)}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                    </div>
                  ) : (
                    <span className="font-medium">{formatPrice(p.price)}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={p.stock < 5 ? "font-medium text-accent" : ""}>{p.stock}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.active ? "Activ" : "Inactiv"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/produse/${p.id}`}
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={`Editează ${p.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  Niciun produs. Adaugă primul produs sau rulează seed-ul (npm run db:seed).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
