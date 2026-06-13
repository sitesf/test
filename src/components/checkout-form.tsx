"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Lock } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, JUDETE } from "@/lib/validations";
import type { StoreSettingsData } from "@/lib/store-settings";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "address" | "county" | "city", string>>;

/**
 * Shipping details form. Validation runs with the SAME Zod schema on the
 * client (instant feedback) and on the server (/api/checkout — source of
 * truth). On success the browser is redirected to Stripe Checkout.
 */
export function CheckoutForm({ settings, cancelled }: { settings: StoreSettingsData; cancelled: boolean }) {
  const { items, subtotal, hydrated } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", county: "", city: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
  const total = subtotal + shipping;

  function setField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const payload = {
      customer: form,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    // Client-side validation for instant feedback.
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[1] as keyof FieldErrors;
        if (issue.path[0] === "customer" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
        if (issue.path[0] === "items") {
          setApiError("Coșul este gol. Adaugă produse înainte de a plasa comanda.");
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setApiError(data.error ?? "A apărut o eroare. Încearcă din nou.");
        setSubmitting(false);
        return;
      }
      // Redirect to the Stripe-hosted payment page.
      window.location.href = data.url;
    } catch {
      setApiError("Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-6 py-24 text-center text-sm text-muted-foreground">Se încarcă…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Coșul tău este gol</h1>
        <p className="text-sm text-muted-foreground">Adaugă produse în coș înainte de a finaliza comanda.</p>
        <Button asChild size="lg">
          <Link href="/produse">Vezi produsele</Link>
        </Button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring";
  const errorClass = "mt-1.5 text-xs text-accent";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-12 md:py-16">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">Finalizare comandă</h1>

      {cancelled && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            Plata a fost anulată. Produsele sunt în continuare în coș — poți relua plata oricând. Comanda nu este
            înregistrată ca plătită până la confirmarea plății.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Shipping form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <h2 className="text-lg font-semibold">Date de livrare</h2>

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Nume complet *
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ion Popescu"
              autoComplete="name"
              className={inputClass}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="ion@exemplu.ro"
                autoComplete="email"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                Telefon *
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="07xx xxx xxx"
                autoComplete="tel"
                className={inputClass}
              />
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
              Adresă (stradă, număr, bloc, apartament) *
            </label>
            <input
              id="address"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Str. Exemplu nr. 10, bl. A2, ap. 5"
              autoComplete="street-address"
              className={inputClass}
            />
            {errors.address && <p className={errorClass}>{errors.address}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="county" className="mb-1.5 block text-sm font-medium">
                Județ *
              </label>
              <select
                id="county"
                value={form.county}
                onChange={(e) => setField("county", e.target.value)}
                className={inputClass}
              >
                <option value="">Selectează județul</option>
                {JUDETE.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
              {errors.county && <p className={errorClass}>{errors.county}</p>}
            </div>
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
                Localitate *
              </label>
              <input
                id="city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="ex. Cluj-Napoca"
                autoComplete="address-level2"
                className={inputClass}
              />
              {errors.city && <p className={errorClass}>{errors.city}</p>}
            </div>
          </div>

          {apiError && (
            <div className="flex items-start gap-3 rounded-2xl bg-accent/10 p-4 text-sm text-accent">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto sm:min-w-[280px]">
            <Lock className="h-4 w-4" />
            {submitting ? "Se redirecționează către Stripe…" : `Plătește ${formatPrice(total)}`}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Vei fi redirecționat către pagina securizată Stripe pentru plata cu cardul. Prin plasarea comenzii ești
            de acord cu{" "}
            <Link href="/termeni-si-conditii" className="underline underline-offset-4 hover:text-foreground">
              termenii și condițiile
            </Link>
            .
          </p>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl bg-background p-6 shadow-card">
          <h2 className="text-lg font-semibold">Comanda ta</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                    {item.quantity}
                  </span>
                </div>
                <p className="flex-1 text-sm leading-snug">{item.name}</p>
                <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Livrare</dt>
              <dd className="font-medium">{shipping === 0 ? "Gratuită" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
