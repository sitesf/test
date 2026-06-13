import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/** PUT /api/admin/setari — upsert the single StoreSettings row. */
export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Date invalide." }, { status: 400 });
  }

  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: parsed.data,
      create: { id: 1, ...parsed.data },
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/setari] Eroare la salvare:", err);
    return NextResponse.json({ error: "Eroare internă la salvarea setărilor." }, { status: 500 });
  }
}
