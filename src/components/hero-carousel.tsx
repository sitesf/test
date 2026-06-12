"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export type HeroProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  image: string;
  /** Pastel background color (from the DB, editable in admin). */
  color: string;
  category: string;
};

type Role = "center" | "left" | "right" | "back";

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const TRANSITION_MS = 650;

/** Per-role styling for the rotating product images (desktop / mobile). */
function roleStyle(role: Role, isMobile: boolean): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    aspectRatio: "0.6 / 1",
    transition: [
      `transform ${TRANSITION_MS}ms ${EASE}`,
      `filter ${TRANSITION_MS}ms ${EASE}`,
      `opacity ${TRANSITION_MS}ms ${EASE}`,
      `left ${TRANSITION_MS}ms ${EASE}`,
      `height ${TRANSITION_MS}ms ${EASE}`,
      `bottom ${TRANSITION_MS}ms ${EASE}`,
    ].join(", "),
    willChange: "transform, filter, opacity, left",
  };

  switch (role) {
    case "center":
      return {
        ...base,
        left: "50%",
        height: isMobile ? "50%" : "70%",
        bottom: isMobile ? "24%" : "8%",
        transform: `translateX(-50%) scale(${isMobile ? 1.2 : 1.5})`,
        filter: "blur(0px)",
        opacity: 1,
        zIndex: 20,
      };
    case "left":
      return {
        ...base,
        left: isMobile ? "18%" : "28%",
        height: isMobile ? "15%" : "26%",
        bottom: isMobile ? "34%" : "14%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.7,
        zIndex: 10,
      };
    case "right":
      return {
        ...base,
        left: isMobile ? "82%" : "72%",
        height: isMobile ? "15%" : "26%",
        bottom: isMobile ? "34%" : "14%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.7,
        zIndex: 10,
      };
    case "back":
      return {
        ...base,
        left: "50%",
        height: isMobile ? "12%" : "20%",
        bottom: isMobile ? "34%" : "14%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(4px)",
        opacity: 0.6,
        zIndex: 5,
      };
  }
}

/**
 * Full-screen hero carousel showing the 4 featured products.
 * The section background color transitions with the active product, a giant
 * ghost word (the product category) sits behind the images, and the
 * images rotate through center/left/right/back roles.
 */
export function HeroCarousel({ items }: { items: HeroProduct[] }) {
  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track the mobile breakpoint (<640px), updated on resize.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload every carousel image at mount so transitions never flash.
  useEffect(() => {
    items.forEach((p) => {
      const img = new window.Image();
      img.src = p.image;
    });
  }, [items]);

  // Navigation is locked while a 650ms transition is in flight.
  const navigate = useCallback(
    (dir: "next" | "prev") => {
      if (isAnimating || count < 2) return;
      setIsAnimating(true);
      setActiveIndex((i) => (dir === "next" ? (i + 1) % count : (i + count - 1) % count));
      window.setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    },
    [isAnimating, count]
  );

  if (count === 0) return null;

  const active = items[activeIndex];

  /** Role of each carousel item relative to the active one. */
  const roleOf = (index: number): Role => {
    if (index === activeIndex) return "center";
    if (index === (activeIndex + count - 1) % count) return "left";
    if (index === (activeIndex + 1) % count) return "right";
    return "back";
  };

  // Ghost word = first word of the category (e.g. "Wellness & Beauty" -> WELLNESS).
  const ghostWord = active.category.split(" ")[0];

  return (
    <section
      className="relative h-[calc(100dvh-77px)] min-h-[540px] overflow-hidden"
      style={{
        backgroundColor: active.color,
        transition: `background-color ${TRANSITION_MS}ms ${EASE}`,
      }}
      aria-label="Produse recomandate"
    >
      {/* Layer 1 — giant ghost category name behind the products */}
      <div
        className="pointer-events-none absolute inset-x-0 z-[1] flex justify-center"
        style={{ top: "18%" }}
        aria-hidden
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={ghostWord}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.06 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TRANSITION_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
            className="whitespace-nowrap font-display uppercase italic leading-none text-foreground"
            style={{ fontSize: "clamp(90px, 24vw, 320px)" }}
          >
            {ghostWord}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Layer 2 — rotating product images */}
      <div className="absolute inset-0 z-[3]">
        {items.map((item, index) => {
          const role = roleOf(index);
          return (
            <div
              key={item.id}
              style={roleStyle(role, isMobile)}
              onClick={() => {
                if (role === "left") navigate("prev");
                if (role === "right") navigate("next");
              }}
              className={role === "left" || role === "right" ? "cursor-pointer" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                draggable={false}
                className="h-full w-full select-none object-contain object-bottom"
              />
            </div>
          );
        })}
      </div>

      {/* Layer 3 — bottom-left content */}
      <div className="absolute bottom-8 left-6 z-[60] sm:bottom-20 sm:left-20" style={{ maxWidth: 380 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground">
            Livrare în toată România 🚚
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="mt-4 min-h-[2.5em]"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display text-4xl tracking-tight md:text-5xl"
            >
              {active.name}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="mt-3"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-body text-xl font-semibold text-accent"
            >
              {formatPrice(active.salePrice ?? active.price)}
              {active.salePrice !== null && (
                <span className="ml-2 text-base font-normal text-muted-foreground line-through">
                  {formatPrice(active.price)}
                </span>
              )}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6 flex items-center gap-3"
        >
          <Button asChild className="rounded-full px-6">
            <Link href={`/produs/${active.slug}`}>Vezi produsul</Link>
          </Button>
          <button
            onClick={() => navigate("prev")}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground/20 transition-all duration-150 hover:scale-[1.08] hover:bg-foreground/5 sm:h-14 sm:w-14"
            aria-label="Produsul anterior"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={() => navigate("next")}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground/20 transition-all duration-150 hover:scale-[1.08] hover:bg-foreground/5 sm:h-14 sm:w-14"
            aria-label="Produsul următor"
          >
            <ArrowRight size={24} />
          </button>
        </motion.div>
      </div>

      {/* Layer 4 — bottom-right link (hidden on mobile) */}
      <Link
        href="/produse"
        className="absolute bottom-10 right-8 z-[60] hidden font-display italic leading-none opacity-70 transition-opacity duration-200 hover:opacity-100 md:block lg:right-20"
        style={{ fontSize: "clamp(20px, 3vw, 44px)" }}
      >
        VEZI TOATE PRODUSELE →
      </Link>
    </section>
  );
}
