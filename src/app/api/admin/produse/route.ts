import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/** POST /api/admin/produse — create a product. */
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Date invalide." }, { status: 400 });
  }
  const data = parsed.data;

  // The hero carousel holds exactly 4 active featured products.
  if (data.featured && data.active) {
    const featuredCount = await prisma.product.count({ where: { featured: true, active: true } });
    if (featuredCount >= 4) {
      return NextResponse.json(
        { error: "Există deja 4 produse active în caruselul hero. Scoate unul înainte de a adăuga altul." },
        { status: 400 }
      );
    }
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        description: data.description,
        specs: data.specs,
        price: data.price,
        salePrice: data.salePrice,
        stock: data.stock,
        images: data.images,
        active: data.active,
        featured: data.featured,
        heroColor: data.heroColor,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Există deja un produs cu acest slug." }, { status: 400 });
    }
    console.error("[admin/produse] Eroare la creare:", err);
    return NextResponse.json({ error: "Eroare internă la salvarea produsului." }, { status: 500 });
  }
}
