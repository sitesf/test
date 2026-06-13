"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsSchema } from "@/lib/validations";
import type { StoreSettingsData } from "@/lib/store-settings";

/** Store settings editor — amounts are typed in RON and stored in bani. */
export function SettingsForm({ initial }: { initial: StoreSettingsData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    storeName: initial.storeName,
    contactEmail: initial.contactEmail,
    contactPhone: initial.contactPhone,
    shippingCost: (initial.shippingCost / 100).toString(),
    freeShippingThreshold: (initial.freeShippingThreshold / 100).toString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      storeName: form.storeName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      shippingCost: Math.round(Number.parseFloat(form.shippingCost.replace(",", ".")) * 100),
      freeShippingThreshold: Math.round(Number.parseFloat(form.freeShippingThreshold.replace(",", ".")) * 100),
    };

    const parsed = settingsSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Date invalide.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/setari", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Nu am putut salva setările.");
      return;
    }
    setMessage("Setările au fost salvate ✓");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-background p-6 shadow-card">
      <div>
        <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium">
          Nume magazin
        </label>
        <input id="storeName" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-medium">
            Email de contact
          </label>
          <input
            id="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className="mb-1.5 block text-sm font-medium">
            Telefon de contact
          </label>
          <input
            id="contactPhone"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="shippingCost" className="mb-1.5 block text-sm font-medium">
            Cost livrare (RON)
          </label>
          <input
            id="shippingCost"
            type="number"
            min="0"
            step="0.01"
            value={form.shippingCost}
            onChange={(e) => set("shippingCost", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="freeShippingThreshold" className="mb-1.5 block text-sm font-medium">
            Prag livrare gratuită (RON)
          </label>
          <input
            id="freeShippingThreshold"
            type="number"
            min="0"
            step="0.01"
            value={form.freeShippingThreshold}
            onChange={(e) => set("freeShippingThreshold", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-accent/10 p-4 text-sm text-accent">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Se salvează…" : "Salvează setările"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </form>
  );
}
