"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { cn, discountPercent, effectivePrice, formatPrice } from "@/lib/utils";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  salePrice: number | null;
  stock: number;
  category: string;
};

/** Product card used on the homepage grid and in the catalog. */
export function ProductCard({ product, className }: { product: CardProduct; className?: string }) {
  const { addItem } = useCart();
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock < 5;

  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-2xl bg-background shadow-card", className)}>
      <Link href={`/produs/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Reducere −{discount}%
            </span>
          )}
          {lowStock && (
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
              Stoc limitat
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Stoc epuizat
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</p>
        <Link href={`/produs/${product.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {product.salePrice !== null ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <span className="text-base font-semibold text-accent">{formatPrice(product.salePrice)}</span>
              </div>
            ) : (
              <span className="text-base font-semibold">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={() =>
              addItem({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: effectivePrice(product),
                stock: product.stock,
              })
            }
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-150 hover:scale-105 hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Adaugă ${product.name} în coș`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
