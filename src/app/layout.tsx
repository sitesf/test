import type { Metadata } from "next";
import "./globals.css";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/config";

// The whole app is database-driven; render everything per request so
// `next build` never needs a live database connection.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `${STORE_NAME} — Gadgeturi practice pentru viața de zi cu zi`,
    template: `%s | ${STORE_NAME}`,
  },
  description: STORE_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
