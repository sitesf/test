import { getStoreSettings } from "@/lib/store-settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Setări — Admin" };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Setări magazin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Datele de contact și regulile de livrare folosite în tot magazinul.
      </p>
      <div className="mt-8">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
