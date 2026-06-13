"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/config";

/** Admin login screen — credentials are checked against the seeded AdminUser. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email sau parolă incorectă.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-background p-8 shadow-card">
        <div className="text-center">
          <p className="text-xl font-semibold tracking-tight">✦ {STORE_NAME}</p>
          <h1 className="mt-2 font-display text-2xl">Panou de administrare</h1>
          <p className="mt-1 text-sm text-muted-foreground">Autentifică-te pentru a continua</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            <Lock className="h-4 w-4" />
            {loading ? "Se verifică…" : "Autentificare"}
          </Button>
        </form>
      </div>
    </div>
  );
}
