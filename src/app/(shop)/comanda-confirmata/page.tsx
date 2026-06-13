import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ClearCart } from "@/components/cart/clear-cart";

export const metadata: Metadata = {
  title: "Comandă confirmată",
};

/**
 * Stripe success page. The order may briefly still be NOUA if the webhook
 * has not arrived yet — we show "în curs de procesare" in that case and
 * never mark anything as paid from this redirect.
 */
export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  const order = sessionId
    ? await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: { items: true },
      })
    : null;

  const isPaid = order?.status === "PLATITA" || order?.status === "EXPEDIATA" || order?.status === "LIVRATA";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      {/* The payment went through — clear the local cart. */}
      <ClearCart />

      <div className="rounded-2xl bg-background p-8 text-center shadow-card md:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          {isPaid ? <CheckCircle2 className="h-8 w-8 text-accent" /> : <Clock className="h-8 w-8 text-accent" />}
        </span>

        <h1 className="mt-6 font-display text-3xl tracking-tight md:text-4xl">
          {isPaid ? "Mulțumim pentru comandă!" : "Plata este în curs de procesare"}
        </h1>

        {order ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Comanda <span className="font-semibold text-foreground">{order.orderNumber}</span> a fost înregistrată.
              {isPaid
                ? " Plata a fost confirmată — pregătim coletul pentru expediere."
                : " Confirmarea plății durează de obicei câteva secunde. Vei primi un email când plata este confirmată."}
            </p>

            <div className="mt-8 rounded-2xl bg-secondary/60 p-5 text-left">
              <p className="text-sm font-semibold">Sumar comandă</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between gap-3">
                  <span>Livrare</span>
                  <span className="shrink-0 font-medium text-foreground">
                    {order.shippingCost === 0 ? "Gratuită" : formatPrice(order.shippingCost)}
                  </span>
                </li>
                <li className="flex justify-between gap-3 border-t border-border pt-2 text-foreground">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Livrare la: {order.address}, {order.city}, jud. {order.county}
              </p>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Plata a fost procesată. Vei primi un email de confirmare în scurt timp.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/produse">Continuă cumpărăturile</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Ai o întrebare?</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
