import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categorii",
  description: "Explorează categoriile de produse: bucătărie, casă, pet, wellness & beauty, auto & travel, lifestyle.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { active: true } } } },
      products: {
        where: { active: true },
        orderBy: { popularity: "desc" },
        take: 1,
        select: { images: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16 lg:px-20">
      <header className="mb-10">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Categorii</h1>
        <p className="mt-2 text-sm text-muted-foreground">Alege categoria potrivită și descoperă produsele.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/produse?categorie=${c.slug}`}
            className="group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl bg-background p-6 shadow-card transition-transform duration-300 hover:-translate-y-1"
          >
            {c.products[0]?.images[0] && (
              <div className="absolute -right-4 -top-4 h-28 w-28 overflow-hidden rounded-2xl opacity-90 transition-transform duration-300 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.products[0].images[0]} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="relative">
              <h2 className="max-w-[60%] font-display text-2xl">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {c._count.products} {c._count.products === 1 ? "produs" : "produse"}
              </p>
            </div>
            <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent">
              Vezi produsele <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
