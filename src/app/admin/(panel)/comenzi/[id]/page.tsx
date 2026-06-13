import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS } from "@/lib/orders";
import { OrderActions } from "@/components/admin/order-actions";

export const metadata = { title: "Detalii comandă — Admin" };

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/comenzi"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Înapoi la comenzi
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plasată la {formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${ORDER_STATUS_CLASSES[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Customer details */}
        <div className="rounded-2xl bg-background p-6 shadow-card">
          <h2 className="font-semibold">Date client</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nume</dt>
              <dd className="text-right font-medium">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all text-right font-medium">{order.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Telefon</dt>
              <dd className="text-right font-medium">{order.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Adresă</dt>
              <dd className="text-right font-medium">{order.address}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Localitate</dt>
              <dd className="text-right font-medium">
                {order.city}, jud. {order.county}
              </dd>
            </div>
          </dl>
        </div>

        {/* Status management */}
        <div className="rounded-2xl bg-background p-6 shadow-card">
          <h2 className="font-semibold">Administrare comandă</h2>
          <OrderActions orderId={order.id} currentStatus={order.status} currentAwb={order.awb} />
        </div>
      </div>

      {/* Items (price snapshots from the moment of purchase) */}
      <div className="mt-6 rounded-2xl bg-background p-6 shadow-card">
        <h2 className="font-semibold">Produse comandate</h2>
        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Livrare</dt>
            <dd className="font-medium">{order.shippingCost === 0 ? "Gratuită" : formatPrice(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
