import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Produs nou — Admin" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Produs nou</h1>
      <p className="mt-1 text-sm text-muted-foreground">Completează detaliile și salvează.</p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
