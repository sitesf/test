import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { discountPercent, formatPrice, parseSpecs } from "@/lib/utils";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard, type CardProduct } from "@/components/product-card";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: "Produs negăsit" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  const similar = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    orderBy: { popularity: "desc" },
    take: 4,
  });

  const specs = parseSpecs(product.specs);
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock < 5;

  const similarCards: CardProduct[] = similar.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? "",
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    category: p.category.name,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 md:py-14 lg:px-20">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-foreground">
          Acasă
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/produse" className="transition-colors hover:text-foreground">
          Produse
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/produse?categorie=${product.category.slug}`} className="transition-colors hover:text-foreground">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Details */}
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.category.name}</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">{product.name}</h1>

          {/* Price */}
          <div className="mt-5 flex items-center gap-3">
            {product.salePrice !== null ? (
              <>
                <span className="text-3xl font-semibold text-accent">{formatPrice(product.salePrice)}</span>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Reducere −{discount}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Stock state */}
          <p className="mt-3 text-sm">
            {outOfStock ? (
              <span className="font-medium text-muted-foreground">Stoc epuizat — revine în curând</span>
            ) : lowStock ? (
              <span className="font-medium text-accent">Stoc limitat: doar {product.stock} bucăți rămase</span>
            ) : (
              <span className="font-medium text-foreground">✓ În stoc, gata de expediere</span>
            )}
          </p>

          {/* Add to cart */}
          <div className="mt-7">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0] ?? "",
                price: product.salePrice ?? product.price,
                stock: product.stock,
              }}
            />
          </div>

          {/* Shipping perks */}
          <div className="mt-8 grid gap-3 rounded-2xl bg-secondary/60 p-5 text-sm">
            <p className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 shrink-0 text-accent" /> Livrare prin curier în 1-3 zile lucrătoare
            </p>
            <p className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 shrink-0 text-accent" /> Retur gratuit în 14 zile calendaristice
            </p>
            <p className="flex items-center gap-2.5">
              <PackageCheck className="h-4 w-4 shrink-0 text-accent" /> Plată securizată cu cardul prin Stripe
            </p>
          </div>

          {/* Long description */}
          <div className="mt-10">
            <h2 className="font-display text-2xl">Descriere</h2>
            <div className="mt-3 space-y-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </div>
          </div>

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl">Specificații</h2>
              <dl className="mt-4 overflow-hidden rounded-2xl border border-border">
                {specs.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`flex flex-col gap-0.5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
                      i % 2 === 0 ? "bg-secondary/50" : "bg-background"
                    }`}
                  >
                    <dt className="text-sm font-medium">{spec.label}</dt>
                    <dd className="text-sm text-muted-foreground sm:text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Similar products */}
      {similarCards.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl tracking-tight">Produse similare</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {similarCards.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
