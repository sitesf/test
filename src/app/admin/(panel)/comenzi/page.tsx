import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata = { title: "Comenzi — Admin" };

const STATUS_FILTERS = ["TOATE", "NOUA", "PLATITA", "EXPEDIATA", "LIVRATA", "ANULATA"] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = STATUS_FILTERS.includes(searchParams.status as (typeof STATUS_FILTERS)[number])
    ? (searchParams.status as (typeof STATUS_FILTERS)[number])
    : "TOATE";

  const orders = await prisma.order.findMany({
    where: statusFilter === "TOATE" ? {} : { status: statusFilter as OrderStatus },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Comenzi</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} comenzi afișate.</p>

      {/* Status filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "TOATE" ? "/admin/comenzi" : `/admin/comenzi?status=${s}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              statusFilter === s
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {s === "TOATE" ? "Toate" : ORDER_STATUS_LABELS[s as OrderStatus]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-background shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-4 font-medium">Comandă</th>
              <th className="px-5 py-4 font-medium">Client</th>
              <th className="px-5 py-4 font-medium">Data</th>
              <th className="px-5 py-4 font-medium">Produse</th>
              <th className="px-5 py-4 font-medium">Total</th>
              <th className="px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="transition-colors hover:bg-secondary/40">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/comenzi/${o.id}`} className="font-medium text-foreground hover:underline">
                    {o.orderNumber}
                  </Link>
                  {o.awb && <p className="text-xs text-muted-foreground">AWB: {o.awb}</p>}
                </td>
                <td className="px-5 py-3.5">
                  <p>{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.city}, {o.county}</p>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatDate(o.createdAt)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{o._count.items}</td>
                <td className="px-5 py-3.5 font-medium">{formatPrice(o.total)}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_CLASSES[o.status]}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  Nicio comandă pentru acest filtru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
