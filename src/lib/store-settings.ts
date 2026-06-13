import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/config";

export type StoreSettingsData = typeof DEFAULT_SETTINGS;

/**
 * Reads the single StoreSettings row, falling back to safe defaults when
 * the database is empty or unreachable (e.g. during `next build`).
 */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    if (!settings) return DEFAULT_SETTINGS;
    return {
      storeName: settings.storeName,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      shippingCost: settings.shippingCost,
      freeShippingThreshold: settings.freeShippingThreshold,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
