/**
 * Global store configuration.
 * The store name lives in a SINGLE constant so rebranding means changing
 * one line. Everything else (logo, metadata, e-mails, order prefix,
 * localStorage keys) derives from it.
 */
export const STORE_NAME = "Tufani";

/** Short marketing tagline used in metadata and the footer. */
export const STORE_TAGLINE =
  "Gadgeturi inteligente și produse practice pentru casă, bucătărie, wellness și animale de companie. Livrare rapidă în toată România.";

/** Prefix for human-readable order numbers, e.g. TUF-8K2M4P1Q. */
export const ORDER_PREFIX = STORE_NAME.slice(0, 3).toUpperCase();

/** localStorage keys (namespaced with the store name). */
export const CART_STORAGE_KEY = `${STORE_NAME.toLowerCase()}-cart`;
export const COOKIE_CONSENT_KEY = `${STORE_NAME.toLowerCase()}-cookie-consent`;

/**
 * Fallback store settings, used when the StoreSettings row does not exist
 * yet (e.g. before the seed runs). All amounts are in bani (1 RON = 100 bani).
 */
export const DEFAULT_SETTINGS = {
  storeName: STORE_NAME,
  contactEmail: `contact@${STORE_NAME.toLowerCase()}.ro`,
  contactPhone: "+40 770 123 456",
  shippingCost: 1999, // 19,99 RON
  freeShippingThreshold: 25000, // 250 RON
};

/** Pastel fallback colors for the hero carousel when a product has none. */
export const HERO_FALLBACK_COLORS = ["#FFE8DD", "#DDEFE3", "#FCE4F0", "#E3EEFF"];

/** Public base URL — used for Stripe redirect URLs. */
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
