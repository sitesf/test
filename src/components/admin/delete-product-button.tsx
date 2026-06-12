"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

/** Delete button with confirmation, used in the admin products table. */
export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Ștergi definitiv produsul „${productName}”?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/produse/${productId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      window.alert(data?.error ?? "Nu am putut șterge produsul.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
      aria-label={`Șterge ${productName}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
