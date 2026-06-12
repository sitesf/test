import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

/**
 * Admin shell: server-side session check (defense in depth — the
 * middleware already protects these routes) + sidebar navigation.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar userEmail={session.user.email} />
      <main className="flex-1 bg-secondary/40 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
