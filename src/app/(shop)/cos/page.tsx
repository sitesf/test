import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/store-settings";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Coșul meu",
  description: "Verifică produsele din coș și finalizează comanda.",
};

export default async function CartPage() {
  const settings = await getStoreSettings();
  return <CartPageContent settings={settings} />;
}
