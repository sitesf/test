"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { COOKIE_CONSENT_KEY } from "@/lib/config";

/**
 * GDPR cookie consent banner. The choice is stored in localStorage;
 * the shop only uses strictly necessary cookies (session + cart),
 * so "Doar necesare" simply records the refusal of optional ones.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(COOKIE_CONSENT_KEY)) {
        setVisible(true);
      }
    } catch {
      // Storage unavailable — do not nag the user on every render.
    }
  }, []);

  function choose(value: "all" | "necessary") {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      // Ignore storage errors.
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-2xl rounded-2xl bg-background p-5 shadow-card sm:bottom-6"
          role="dialog"
          aria-label="Consimțământ cookies"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Folosim cookie-uri strict necesare pentru funcționarea magazinului (coș de cumpărături, sesiune de
            plată). Detalii în{" "}
            <Link href="/politica-de-confidentialitate" className="underline underline-offset-4 hover:text-foreground">
              politica de confidențialitate
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose("all")}>
              Accept toate
            </Button>
            <Button size="sm" variant="outline" onClick={() => choose("necessary")}>
              Doar necesare
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
