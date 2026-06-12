"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { STORE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produse", label: "Produse", icon: Package, exact: false },
  { href: "/admin/comenzi", label: "Comenzi", icon: ShoppingCart, exact: false },
  { href: "/admin/categorii", label: "Categorii", icon: FolderTree, exact: false },
  { href: "/admin/setari", label: "Setări", icon: Settings, exact: false },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-background md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-6 py-6">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          ✦ {STORE_NAME} <span className="font-normal text-muted-foreground">Admin</span>
        </Link>
        <p className="mt-1 truncate text-xs text-muted-foreground">{userEmail}</p>
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-4 md:pb-0">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-1 border-t border-border px-4 py-4 md:flex">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Vezi magazinul
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Deconectare
        </button>
      </div>
    </aside>
  );
}
