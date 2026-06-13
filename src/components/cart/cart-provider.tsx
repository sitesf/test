"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CART_STORAGE_KEY } from "@/lib/config";

/** A cart line. `price` is the effective unit price in bani at add time —
 *  shown in the UI only; the server recomputes real prices at checkout. */
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  /** Total number of units in the cart. */
  count: number;
  /** Subtotal in bani. */
  subtotal: number;
  /** True after the cart has been read from localStorage (avoids SSR mismatch). */
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Restore the persisted cart once, on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Corrupted storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  // Persist on every change (only after the initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable — the cart still works in memory.
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const maxQty = Math.max(1, item.stock);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, maxQty) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, maxQty) }];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(Math.max(quantity, 0), Math.max(1, i.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, hydrated, isOpen, openCart, closeCart, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart trebuie folosit în interiorul <CartProvider>.");
  return ctx;
}
