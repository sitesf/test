import Link from "next/link";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/config";
import type { StoreSettingsData } from "@/lib/store-settings";

const SHOP_LINKS = [
  { href: "/produse", label: "Toate produsele" },
  { href: "/categorii", label: "Categorii" },
  { href: "/cos", label: "Coșul meu" },
  { href: "/contact", label: "Contact" },
];

const INFO_LINKS = [
  { href: "/termeni-si-conditii", label: "Termeni și condiții" },
  { href: "/politica-de-confidentialitate", label: "Politica de confidențialitate" },
  { href: "/politica-retur", label: "Politica de retur" },
  { href: "/livrare", label: "Livrare" },
];

export function Footer({ settings }: { settings: StoreSettingsData }) {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 md:px-12 lg:grid-cols-4 lg:px-20">
        {/* Brand */}
        <div className="space-y-3">
          <p className="text-xl font-semibold tracking-tight">✦ {STORE_NAME}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{STORE_TAGLINE}</p>
        </div>

        {/* Shop */}
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide">Magazin</p>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal info */}
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide">Informații</p>
          <ul className="space-y-2.5">
            {INFO_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + consumer protection */}
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide">Contact</p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${settings.contactEmail}`} className="transition-colors hover:text-foreground">
                {settings.contactEmail}
              </a>
            </li>
            <li>
              <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="transition-colors hover:text-foreground">
                {settings.contactPhone}
              </a>
            </li>
          </ul>
          <div className="mt-5 space-y-2.5">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              ANPC — Soluționarea alternativă a litigiilor (SAL)
            </a>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              SOL — Soluționarea online a litigiilor
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-6 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Toate drepturile rezervate.
          </p>
          <p>Plăți securizate prin Stripe · Prețuri în RON, TVA inclus</p>
        </div>
      </div>
    </footer>
  );
}
