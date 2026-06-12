import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categorii — Admin" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Categorii</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Categoriile cu produse asociate nu pot fi șterse — mută întâi produsele.
      </p>
      <div className="mt-8">
        <CategoryManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c._count.products,
          }))}
        />
      </div>
    </div>
  );
}
