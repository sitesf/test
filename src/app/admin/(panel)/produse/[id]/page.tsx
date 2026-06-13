import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseSpecs } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Editare produs — Admin" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Editare produs</h1>
      <p className="mt-1 truncate text-sm text-muted-foreground">{product.name}</p>
      <div className="mt-8">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            description: product.description,
            specs: parseSpecs(product.specs),
            price: product.price,
            salePrice: product.salePrice,
            stock: product.stock,
            images: product.images,
            active: product.active,
            featured: product.featured,
            heroColor: product.heroColor,
          }}
        />
      </div>
    </div>
  );
}
