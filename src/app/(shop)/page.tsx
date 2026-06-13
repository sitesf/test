import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HERO_FALLBACK_COLORS } from "@/lib/config";
import { HeroCarousel, type HeroProduct } from "@/components/hero-carousel";
import { ProductCard, type CardProduct } from "@/components/product-card";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: Truck,
    title: "Livrare rapidă",
    text: "Expediem în 24h prin curier rapid, oriunde în România. Primești coletul în 1-3 zile lucrătoare.",
  },
  {
    icon: RotateCcw,
    title: "Retur în 14 zile",
    text: "Te-ai răzgândit? Ai 14 zile calendaristice să returnezi produsele, fără întrebări, conform legii.",
  },
  {
    icon: ShieldCheck,
    title: "Plată securizată",
    text: "Plăți procesate prin Stripe, cu criptare completă. Acceptăm carduri Visa, Mastercard, Apple Pay și Google Pay.",
  },
];

/** Builds the 4 hero items: featured products first, newest fill the gaps. */
async function getHeroItems(): Promise<HeroProduct[]> {
  const featured = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  if (featured.length < 4) {
    const fill = await prisma.product.findMany({
      where: { active: true, featured: false },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4 - featured.length,
    });
    featured.push(...fill);
  }

  return featured.map((p, index) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images[0] ?? "",
    color: p.heroColor ?? HERO_FALLBACK_COLORS[index % HERO_FALLBACK_COLORS.length],
    category: p.category.name,
  }));
}

export default async function HomePage() {
  const [heroItems, popular, bannerCategory] = await Promise.all([
    getHeroItems(),
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: [{ popularity: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.category.findFirst({
      where: { slug: "wellness-beauty" },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
  ]);

  const popularCards: CardProduct[] = popular.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? "",
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    category: p.category.name,
  }));

  return (
    <>
      <HeroCarousel items={heroItems} />

      {/* Popular products */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24 lg:px-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">Produse populare</h2>
            <p className="mt-2 text-sm text-muted-foreground">Cele mai cumpărate gadgeturi ale momentului.</p>
          </div>
          <Link
            href="/produse"
            className="hidden shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Vezi toate →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {popularCards.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/produse">Vezi toate produsele</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3 md:px-12 lg:px-20">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl bg-background p-8 shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <b.icon className="h-6 w-6 text-accent" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category banner */}
      {bannerCategory && (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24 lg:px-20">
          <div className="relative overflow-hidden rounded-3xl bg-accent px-8 py-16 text-accent-foreground md:px-16 md:py-24">
            <span
              className="pointer-events-none absolute -right-6 -top-10 hidden select-none font-display italic leading-none text-accent-foreground/10 md:block"
              style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
              aria-hidden
            >
              ✦
            </span>
            <p className="text-sm uppercase tracking-widest text-accent-foreground/70">Colecția momentului</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl italic tracking-tight md:text-6xl">
              {bannerCategory.name}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-accent-foreground/80 md:text-base">
              Răsfață-te cu {bannerCategory._count.products} produse alese pentru relaxare și îngrijire personală —
              de la masaj la ritualuri de îngrijire a tenului.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href={`/produse?categorie=${bannerCategory.slug}`}>Explorează colecția</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
