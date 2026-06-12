"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { StoreSettingsData } from "@/lib/store-settings";

/** Full cart page (/cos) — same data as the drawer, persisted in localStorage. */
export function CartPageContent({ settings }: { settings: StoreSettingsData }) {
  const { items, subtotal, hydrated, updateQuantity, removeItem } = useCart();

  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
  const total = subtotal + shipping;

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-6 py-24 text-center text-sm text-muted-foreground">Se încarcă coșul…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-6 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </span>
        <h1 className="font-display text-3xl">Coșul tău este gol</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Nu ai niciun produs în coș momentan. Descoperă gadgeturile noastre și găsește ceva pe placul tău.
        </p>
        <Button asChild size="lg">
          <Link href="/produse">Vezi produsele</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-12 md:py-16">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">Coșul meu</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-2xl bg-background p-4 shadow-card sm:gap-6 sm:p-5">
              <Link href={`/produs/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-28 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/produs/${item.slug}`} className="font-medium leading-snug hover:underline">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Elimină ${item.name} din coș`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.price)} / buc</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="rounded-full p-0.5 transition-colors hover:bg-secondary"
                      aria-label="Scade cantitatea"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="rounded-full p-0.5 transition-colors hover:bg-secondary disabled:opacity-40"
                      aria-label="Crește cantitatea"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl bg-background p-6 shadow-card">
          <h2 className="text-lg font-semibold">Sumar comandă</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Livrare</dt>
              <dd className="font-medium">{shipping === 0 ? "Gratuită" : formatPrice(shipping)}</dd>
            </div>
            {shipping > 0 && (
              <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent">
                Mai adaugă {formatPrice(settings.freeShippingThreshold - subtotal)} pentru livrare gratuită.
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Finalizează comanda</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Plată securizată prin Stripe · RON</p>
        </aside>
      </div>
    </div>
  );
}
