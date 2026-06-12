import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** PUT /api/admin/produse/[id] — update a product. */
export async function PUT(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Date invalide." }, { status: 400 });
  }
  const data = parsed.data;

  // Enforce the "exactly 4 in the hero carousel" rule (excluding this product).
  if (data.featured && data.active) {
    const featuredCount = await prisma.product.count({
      where: { featured: true, active: true, id: { not: params.id } },
    });
    if (featuredCount >= 4) {
      return NextResponse.json(
        { error: "Există deja 4 produse active în caruselul hero. Scoate unul înainte de a adăuga altul." },
        { status: 400 }
      );
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
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
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json({ error: "Există deja un produs cu acest slug." }, { status: 400 });
      }
      if (err.code === "P2025") {
        return NextResponse.json({ error: "Produsul nu a fost găsit." }, { status: 404 });
      }
    }
    console.error("[admin/produse] Eroare la actualizare:", err);
    return NextResponse.json({ error: "Eroare internă la salvarea produsului." }, { status: 500 });
  }
}

/** DELETE /api/admin/produse/[id] — order items keep their snapshot (productId becomes null). */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Produsul nu a fost găsit." }, { status: 404 });
    }
    console.error("[admin/produse] Eroare la ștergere:", err);
    return NextResponse.json({ error: "Eroare internă la ștergerea produsului." }, { status: 500 });
  }
}
