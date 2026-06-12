import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, Phone } from "lucide-react";
import { getStoreSettings } from "@/lib/store-settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactează echipa magazinului — răspundem rapid la întrebări despre comenzi, livrare și retururi.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">Contact</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Ai o întrebare despre o comandă, livrare sau retur? Scrie-ne sau sună-ne — răspundem în maximum 24 de ore
        lucrătoare.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <a
          href={`mailto:${settings.contactEmail}`}
          className="rounded-2xl bg-background p-6 shadow-card transition-transform duration-300 hover:-translate-y-1"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-5 w-5 text-accent" />
          </span>
          <p className="mt-4 text-sm font-semibold">Email</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{settings.contactEmail}</p>
        </a>

        <a
          href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
          className="rounded-2xl bg-background p-6 shadow-card transition-transform duration-300 hover:-translate-y-1"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10">
            <Phone className="h-5 w-5 text-accent" />
          </span>
          <p className="mt-4 text-sm font-semibold">Telefon</p>
          <p className="mt-1 text-sm text-muted-foreground">{settings.contactPhone}</p>
        </a>

        <div className="rounded-2xl bg-background p-6 shadow-card">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10">
            <Clock className="h-5 w-5 text-accent" />
          </span>
          <p className="mt-4 text-sm font-semibold">Program</p>
          <p className="mt-1 text-sm text-muted-foreground">Luni – Vineri, 09:00 – 18:00</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-secondary/60 p-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Pentru retururi, consultă mai întâi{" "}
          <Link href="/politica-retur" className="underline underline-offset-4 hover:text-foreground">
            politica de retur
          </Link>{" "}
          — ai la dispoziție 14 zile calendaristice de la primirea coletului. Pentru informații despre livrare, vezi
          pagina{" "}
          <Link href="/livrare" className="underline underline-offset-4 hover:text-foreground">
            Livrare
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
