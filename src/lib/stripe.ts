import Stripe from "stripe";

/**
 * Lazily instantiated Stripe client. The lazy getter keeps `next build`
 * from requiring STRIPE_SECRET_KEY at build time — the key is only read
 * when a checkout/webhook request actually comes in.
 */
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY lipsește din variabilele de mediu.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { typescript: true });
  }
  return stripeClient;
}
