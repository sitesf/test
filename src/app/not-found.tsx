import Link from "next/link";
import { STORE_NAME } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-display text-7xl italic md:text-9xl">404</p>
      <h1 className="font-display text-2xl md:text-3xl">Pagina nu a fost găsită</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Pagina pe care o cauți nu există sau a fost mutată. Întoarce-te la {STORE_NAME} și descoperă produsele
        noastre.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Înapoi la magazin
      </Link>
    </div>
  );
}
