/** Shared wrapper for the legal pages — consistent typography without a plugin. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Ultima actualizare: iunie 2026</p>
      <div className="mt-10 space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
