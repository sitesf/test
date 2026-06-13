"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/cart-provider";

/**
 * Quantity selector + "Adaugă în coș" button with a small success
 * micro-interaction (scale pulse + checkmark swap) before the cart
 * drawer slides in.
 */
export function AddToCart({ product }: { product: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (outOfStock || justAdded) return;
    setJustAdded(true);
    window.setTimeout(() => {
      addItem(product, quantity);
      setJustAdded(false);
    }, 650);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Quantity stepper */}
      <div className="flex items-center gap-3 rounded-full border border-border px-3 py-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={outOfStock || quantity <= 1}
          className="rounded-full p-1 transition-colors hover:bg-secondary disabled:opacity-40"
          aria-label="Scade cantitatea"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
          disabled={outOfStock || quantity >= product.stock}
          className="rounded-full p-1 transition-colors hover:bg-secondary disabled:opacity-40"
          aria-label="Crește cantitatea"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add button with micro-interaction */}
      <motion.button
        onClick={handleAdd}
        disabled={outOfStock}
        whileTap={{ scale: 0.96 }}
        animate={justAdded ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="inline-flex h-12 min-w-[200px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        <AnimatePresence mode="wait" initial={false}>
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> Adăugat în coș
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? "Stoc epuizat" : "Adaugă în coș"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
