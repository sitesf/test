"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

const STATUSES: OrderStatus[] = ["NOUA", "PLATITA", "EXPEDIATA", "LIVRATA", "ANULATA"];

/** Status + AWB editor on the admin order detail page. */
export function OrderActions({
  orderId,
  currentStatus,
  currentAwb,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  currentAwb: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [awb, setAwb] = useState(currentAwb ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/comenzi/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, awb: awb.trim() || null }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "Nu am putut salva modificările.");
      return;
    }
    setMessage("Salvat ✓");
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium">
          Status comandă
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Statusul „Plătită” este setat automat de webhook-ul Stripe la confirmarea plății.
        </p>
      </div>

      <div>
        <label htmlFor="awb" className="mb-1.5 block text-sm font-medium">
          AWB (număr de urmărire curier)
        </label>
        <input
          id="awb"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          placeholder="ex. 123456789RO"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Se salvează…" : "Salvează"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
