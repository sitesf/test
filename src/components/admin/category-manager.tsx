"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

type CategoryRow = { id: string; name: string; slug: string; productCount: number };

/** Category CRUD: inline list editing + add form, backed by /api/admin/categorii. */
export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function request(input: RequestInfo, init?: RequestInit) {
    setBusy(true);
    setError(null);
    const res = await fetch(input, init);
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "A apărut o eroare.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const ok = await request("/api/admin/categorii", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    if (ok) setNewName("");
  }

  async function handleRename(id: string) {
    const name = editName.trim();
    if (!name) return;
    const ok = await request(`/api/admin/categorii/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slugify(name) }),
    });
    if (ok) setEditingId(null);
  }

  async function handleDelete(category: CategoryRow) {
    if (!window.confirm(`Ștergi categoria „${category.name}”?`)) return;
    await request(`/api/admin/categorii/${category.id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nume categorie nouă"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={busy || !newName.trim()}>
          <Plus className="h-4 w-4" /> Adaugă
        </Button>
      </form>

      {error && <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent">{error}</p>}

      {/* List */}
      <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-background shadow-card">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
            {editingId === c.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => handleRename(c.id)}
                  disabled={busy}
                  className="rounded-full p-2 text-accent transition-colors hover:bg-secondary"
                  aria-label="Salvează"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
                  aria-label="Renunță"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{c.slug} · {c.productCount} {c.productCount === 1 ? "produs" : "produse"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditName(c.name);
                  }}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label={`Redenumește ${c.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  disabled={busy || c.productCount > 0}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                  aria-label={`Șterge ${c.name}`}
                  title={c.productCount > 0 ? "Categoria are produse asociate" : undefined}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-5 py-10 text-center text-sm text-muted-foreground">Nicio categorie încă.</li>
        )}
      </ul>
    </div>
  );
}
