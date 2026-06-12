import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** PUT /api/admin/categorii/[id] — rename a category. */
export async function PUT(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const parsed = categorySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Date invalide." }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json({ error: "Există deja o categorie cu acest nume sau slug." }, { status: 400 });
      }
      if (err.code === "P2025") {
        return NextResponse.json({ error: "Categoria nu a fost găsită." }, { status: 404 });
      }
    }
    console.error("[admin/categorii] Eroare la actualizare:", err);
    return NextResponse.json({ error: "Eroare internă la salvarea categoriei." }, { status: 500 });
  }
}

/** DELETE /api/admin/categorii/[id] — blocked while products still reference it. */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const productCount = await prisma.product.count({ where: { categoryId: params.id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Categoria are ${productCount} produse asociate. Mută-le în altă categorie înainte de ștergere.` },
      { status: 400 }
    );
  }

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Categoria nu a fost găsită." }, { status: 404 });
    }
    console.error("[admin/categorii] Eroare la ștergere:", err);
    return NextResponse.json({ error: "Eroare internă la ștergerea categoriei." }, { status: 500 });
  }
}
