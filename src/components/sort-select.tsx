"use client";

import { useRouter } from "next/navigation";

type Option = { value: string; label: string };

/** Catalog sort dropdown — navigates with the existing filters preserved. */
export function SortSelect({
  options,
  current,
  categorie,
  q,
}: {
  options: Option[];
  current: string;
  categorie?: string;
  q?: string;
}) {
  const router = useRouter();

  function onChange(value: string) {
    const sp = new URLSearchParams();
    if (categorie) sp.set("categorie", categorie);
    if (q) sp.set("q", q);
    if (value !== "noi") sp.set("sort", value);
    const qs = sp.toString();
    router.push(qs ? `/produse?${qs}` : "/produse");
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Sortează:
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
