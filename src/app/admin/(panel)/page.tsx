import Link from "next/link";
import { Banknote, CalendarDays, Package, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, PAID_STATUSES } from "@/lib/orders";
import { SalesChart, type ChartPoint } from "@/components/admin/sales-chart";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const chartStart = new Date(startOfToday);
  chartStart.setDate(chartStart.getDate() - 13);

  const [salesAggregate, ordersToday, ordersWeek, activeProducts, paidOrders, topProducts, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: PAID_STATUSES } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        where: { status: { in: PAID_STATUSES }, createdAt: { gte: chartStart } },
        select: { total: true, createdAt: true },
      }),
      prisma.product.findMany({
        where: { popularity: { gt: 0 } },
        orderBy: { popularity: "desc" },
        take: 5,
        select: { id: true, name: true, popularity: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, orderNumber: true, customerName: true, total: true, status: true },
      }),
    ]);

  // Build the last-14-days revenue series for the SVG chart.
  const points: ChartPoint[] = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(chartStart);
    day.setDate(day.getDate() + i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const value = paidOrders
      .filter((o) => o.createdAt >= day && o.createdAt < next)
      .reduce((sum, o) => sum + o.total, 0);
    points.push({
      label: day.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }),
      value,
    });
  }

  const maxPopularity = Math.max(...topProducts.map((p) => p.popularity), 1);

  const stats = [
    { icon: Banknote, label: "Vânzări totale", value: formatPrice(salesAggregate._sum.total ?? 0) },
    { icon: ShoppingCart, label: "Comenzi azi", value: String(ordersToday) },
    { icon: CalendarDays, label: "Comenzi în ultimele 7 zile", value: String(ordersWeek) },
    { icon: Package, label: "Produse active", value: String(activeProducts) },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Privire de ansamblu asupra magazinului.</p>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-background p-5 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <s.icon className="h-5 w-5 text-accent" />
            </span>
            <p className="mt-4 text-2xl font-semibold">{s.value}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mt-6 rounded-2xl bg-background p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Vânzări — ultimele 14 zile</h2>
          <p className="text-sm text-muted-foreground">doar comenzi plătite</p>
        </div>
        <SalesChart points={points} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-2xl bg-background p-6 shadow-card">
          <h2 className="font-semibold">Top produse vândute</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Încă nu există vânzări confirmate. Topul apare după primele comenzi plătite.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {topProducts.map((p, i) => (
                <li key={p.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">
                      <span className="mr-2 font-semibold text-muted-foreground">{i + 1}.</span>
                      {p.name}
                    </span>
                    <span className="shrink-0 font-medium">{p.popularity} buc</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-accent/15">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round((p.popularity / maxPopularity) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl bg-background p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Comenzi recente</h2>
            <Link href="/admin/comenzi" className="text-sm text-muted-foreground hover:text-foreground">
              Vezi toate →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nicio comandă deocamdată.</p>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/comenzi/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="truncate text-muted-foreground">{o.customerName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_CLASSES[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                      <span className="font-medium">{formatPrice(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
