"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { StoreSettingsData } from "@/lib/store-settings";

/** Slide-in cart drawer, rendered globally from the root layout. */
export function CartDrawer({ settings }: { settings: StoreSettingsData }) {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  const freeShippingGap = settings.freeShippingThreshold - subtotal;
  const progress = Math.min(100, Math.round((subtotal / settings.freeShippingThreshold) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-foreground/40"
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col bg-background shadow-card"
            role="dialog"
            aria-label="Coș de cumpărături"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <p className="text-lg font-semibold">Coșul tău</p>
              <button
                onClick={closeCart}
                className="rounded-full p-2 transition-colors hover:bg-secondary"
                aria-label="Închide coșul"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </span>
                <p className="font-display text-2xl">Coșul tău este gol</p>
                <p className="text-sm text-muted-foreground">
                  Descoperă produsele noastre și adaugă-le în coș.
                </p>
                <Button asChild onClick={closeCart}>
                  <Link href="/produse">Vezi produsele</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <Link
                        href={`/produs/${item.slug}`}
                        onClick={closeCart}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/produs/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm font-medium leading-snug hover:underline"
                          >
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
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="rounded-full p-0.5 transition-colors hover:bg-secondary"
                              aria-label="Scade cantitatea"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="rounded-full p-0.5 transition-colors hover:bg-secondary disabled:opacity-40"
                              disabled={item.quantity >= item.stock}
                              aria-label="Crește cantitatea"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-4 border-t border-border px-6 py-5">
                  <div>
                    {freeShippingGap > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Mai adaugă <span className="font-semibold text-foreground">{formatPrice(freeShippingGap)}</span>{" "}
                        pentru livrare gratuită.
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-accent">🎉 Ai livrare gratuită!</p>
                    )}
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-lg font-semibold">{formatPrice(subtotal)}</p>
                  </div>

                  <div className="grid gap-2">
                    <Button asChild size="lg" onClick={closeCart}>
                      <Link href="/checkout">Finalizează comanda</Link>
                    </Button>
                    <Button asChild variant="outline" onClick={closeCart}>
                      <Link href="/cos">Vezi coșul</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
