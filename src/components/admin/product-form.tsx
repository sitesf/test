"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations";
import type { SpecItem } from "@/lib/utils";

export type ProductFormCategory = { id: string; name: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  specs: SpecItem[];
  price: number; // bani
  salePrice: number | null; // bani
  stock: number;
  images: string[];
  active: boolean;
  featured: boolean;
  heroColor: string | null;
};

/** Converts bani to a "129.99"-style string for number inputs. */
const baniToInput = (bani: number | null) => (bani === null ? "" : (bani / 100).toString());

/**
 * Shared create/edit product form. Prices are typed in RON and converted
 * to bani before validation; specs use one "Etichetă | Valoare" per line,
 * images one URL per line.
 */
export function ProductForm({
  categories,
  initial,
}: {
  categories: ProductFormCategory[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    description: initial?.description ?? "",
    specsText: (initial?.specs ?? []).map((s) => `${s.label} | ${s.value}`).join("\n"),
    price: baniToInput(initial?.price ?? null),
    salePrice: baniToInput(initial?.salePrice ?? null),
    stock: initial ? String(initial.stock) : "0",
    imagesText: (initial?.images ?? []).join("\n"),
    active: initial?.active ?? true,
    featured: initial?.featured ?? false,
    heroColor: initial?.heroColor ?? "#FFE8DD",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Parse the friendly text fields into the API payload.
    const specs: SpecItem[] = form.specsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...rest] = line.split("|");
        return { label: (label ?? "").trim(), value: rest.join("|").trim() };
      });

    const images = form.imagesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const priceNumber = Number.parseFloat(form.price.replace(",", "."));
    const salePriceNumber = form.salePrice.trim()
      ? Number.parseFloat(form.salePrice.replace(",", "."))
      : null;

    const payload = {
      name: form.name,
      slug: form.slug,
      categoryId: form.categoryId,
      description: form.description,
      specs,
      price: Number.isFinite(priceNumber) ? Math.round(priceNumber * 100) : -1,
      salePrice:
        salePriceNumber !== null && Number.isFinite(salePriceNumber)
          ? Math.round(salePriceNumber * 100)
          : null,
      stock: Number.parseInt(form.stock, 10) || 0,
      images,
      active: form.active,
      featured: form.featured,
      heroColor: form.featured ? form.heroColor : null,
    };

    // Same Zod schema as the server — instant feedback.
    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Date invalide.");
      return;
    }

    setSaving(true);
    const res = await fetch(initial ? `/api/admin/produse/${initial.id}` : "/api/admin/produse", {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Nu am putut salva produsul.");
      return;
    }

    router.push("/admin/produse");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring";
  const labelClass = "mb-1.5 block text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl bg-background p-6 shadow-card">
        <h2 className="font-semibold">Informații de bază</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelClass}>
              Nume produs *
            </label>
            <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug (URL) *
            </label>
            <div className="flex gap-2">
              <input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
              <button
                type="button"
                onClick={() => set("slug", slugify(form.name))}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Generează din nume"
              >
                <Wand2 className="h-4 w-4" /> Generează
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className={labelClass}>
              Categorie *
            </label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className={labelClass}>
              Preț (RON) *
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="salePrice" className={labelClass}>
              Preț redus (RON) — opțional
            </label>
            <input
              id="salePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => set("salePrice", e.target.value)}
              placeholder="lasă gol dacă nu există reducere"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stock" className={labelClass}>
              Stoc (bucăți) *
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-background p-6 shadow-card">
        <h2 className="font-semibold">Conținut</h2>
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="description" className={labelClass}>
              Descriere *
            </label>
            <textarea
              id="description"
              rows={8}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="specs" className={labelClass}>
              Specificații * <span className="font-normal text-muted-foreground">(una pe linie: Etichetă | Valoare)</span>
            </label>
            <textarea
              id="specs"
              rows={5}
              value={form.specsText}
              onChange={(e) => set("specsText", e.target.value)}
              placeholder={"Material | Silicon alimentar\nGreutate | 250 g"}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          <div>
            <label htmlFor="images" className={labelClass}>
              Imagini * <span className="font-normal text-muted-foreground">(un URL pe linie; prima este imaginea principală)</span>
            </label>
            <textarea
              id="images"
              rows={4}
              value={form.imagesText}
              onChange={(e) => set("imagesText", e.target.value)}
              placeholder="https://exemplu.ro/imagine.jpg"
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-background p-6 shadow-card">
        <h2 className="font-semibold">Vizibilitate</h2>
        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-current"
            />
            Produs activ (vizibil în magazin)
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 accent-current"
            />
            Featured — apare în caruselul hero (exact 4 produse active)
          </label>

          {form.featured && (
            <div className="flex items-center gap-3 pl-7">
              <label htmlFor="heroColor" className="text-sm text-muted-foreground">
                Culoare pastel fundal hero:
              </label>
              <input
                id="heroColor"
                type="color"
                value={form.heroColor}
                onChange={(e) => set("heroColor", e.target.value)}
                className="h-9 w-14 cursor-pointer rounded-lg border border-border bg-background"
              />
              <span className="font-mono text-xs text-muted-foreground">{form.heroColor}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-accent/10 p-4 text-sm text-accent">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} size="lg">
          {saving ? "Se salvează…" : initial ? "Salvează modificările" : "Creează produsul"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/produse")}>
          Renunță
        </Button>
      </div>
    </form>
  );
}
