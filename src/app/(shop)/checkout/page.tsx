import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/store-settings";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Finalizare comandă",
  description: "Completează datele de livrare și plătește securizat cu cardul prin Stripe.",
};

export default async function CheckoutPage({ searchParams }: { searchParams: { anulat?: string } }) {
  const settings = await getStoreSettings();
  return <CheckoutForm settings={settings} cancelled={searchParams.anulat === "1"} />;
}
