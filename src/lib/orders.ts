import type { OrderStatus } from "@prisma/client";
import { ORDER_PREFIX } from "@/lib/config";

/** Romanian labels for order statuses (UI is fully in Romanian). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NOUA: "Nouă",
  PLATITA: "Plătită",
  EXPEDIATA: "Expediată",
  LIVRATA: "Livrată",
  ANULATA: "Anulată",
};

/** Badge styling per status — design tokens only, no raw colors. */
export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  NOUA: "bg-muted text-muted-foreground",
  PLATITA: "bg-accent/10 text-accent",
  EXPEDIATA: "bg-accent text-accent-foreground",
  LIVRATA: "bg-primary text-primary-foreground",
  ANULATA: "bg-foreground/5 text-muted-foreground line-through",
};

/** Statuses that count as revenue (payment confirmed). */
export const PAID_STATUSES: OrderStatus[] = ["PLATITA", "EXPEDIATA", "LIVRATA"];

/** Generates a human-friendly unique order number, e.g. TUF-M4K2P8QZ. */
export function generateOrderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${ORDER_PREFIX}-${code}`;
}
