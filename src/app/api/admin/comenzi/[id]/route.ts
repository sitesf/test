import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { orderUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** PATCH /api/admin/comenzi/[id] — update status and/or AWB. */
export async function PATCH(req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const parsed = orderUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Date invalide." }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status, awb: parsed.data.awb ?? null },
    });
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Comanda nu a fost găsită." }, { status: 404 });
    }
    console.error("[admin/comenzi] Eroare la actualizare:", err);
    return NextResponse.json({ error: "Eroare internă la salvarea comenzii." }, { status: 500 });
  }
}
