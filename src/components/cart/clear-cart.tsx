"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

/** Empties the persisted cart — rendered once on the order confirmation page. */
export function ClearCart() {
  const { hydrated, clearCart } = useCart();

  useEffect(() => {
    if (hydrated) clearCart();
  }, [hydrated, clearCart]);

  return null;
}
