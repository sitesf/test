import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class combiner (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount stored in bani (1 RON = 100 bani) as Romanian currency.
 * Whole amounts are shown without decimals: 12900 -> "129 RON".
 */
export function formatPrice(bani: number): string {
  const lei = bani / 100;
  const hasDecimals = bani % 100 !== 0;
  return (
    lei.toLocaleString("ro-RO", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }) + " RON"
  );
}

/** The price actually charged: sale price when present, base price otherwise. */
export function effectivePrice(product: { price: number; salePrice: number | null }): number {
  return product.salePrice ?? product.price;
}

/** Discount percentage for the "Reducere" badge, e.g. 25 for -25%. */
export function discountPercent(product: { price: number; salePrice: number | null }): number {
  if (!product.salePrice || product.salePrice >= product.price) return 0;
  return Math.round((1 - product.salePrice / product.price) * 100);
}

/** Generates a URL-friendly slug from a Romanian product name. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ăâ]/g, "a")
    .replace(/î/g, "i")
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Formats a date in Romanian, e.g. "12 iunie 2026, 14:30". */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Spec entries stored in Product.specs (Json column). */
export type SpecItem = { label: string; value: string };

/** Safely parses the Json specs column into a typed array. */
export function parseSpecs(specs: unknown): SpecItem[] {
  if (!Array.isArray(specs)) return [];
  return specs.filter(
    (s): s is SpecItem =>
      typeof s === "object" && s !== null && typeof (s as SpecItem).label === "string" && typeof (s as SpecItem).value === "string"
  );
}
