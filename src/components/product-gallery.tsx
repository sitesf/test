"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Product image gallery: large main image + clickable thumbnails. */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [""];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary shadow-card">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={list[active]}
            alt={`${name} — imaginea ${active + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {list.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-secondary transition-all",
                i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`Vezi imaginea ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
