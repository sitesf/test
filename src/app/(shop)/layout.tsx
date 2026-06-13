import { getStoreSettings } from "@/lib/store-settings";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";

/** Storefront chrome: navbar, footer, cart drawer, cookie banner.
 *  The admin area (/admin) has its own separate layout. */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer settings={settings} />
      <CookieBanner />
    </CartProvider>
  );
}
