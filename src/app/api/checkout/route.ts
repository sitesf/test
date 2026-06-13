import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";
import { getStoreSettings } from "@/lib/store-settings";
import { generateOrderNumber } from "@/lib/orders";
import { getBaseUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Creates an order (status NOUA) and a Stripe Checkout session.
 * Prices are ALWAYS recomputed server-side from the database — the client
 * only sends product ids and quantities. Stock is NOT decremented here;
 * that happens only in the webhook, once payment is confirmed.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  // Server-side validation — the source of truth.
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Datele de livrare sunt invalide." },
      { status: 400 }
    );
  }

  const { customer, items } = parsed.data;

  try {
    // Load the real products and verify availability.
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    const lines = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new CheckoutError("Unul dintre produsele din coș nu mai este disponibil. Reîncarcă pagina.");
      }
      if (product.stock < item.quantity) {
        throw new CheckoutError(
          `Stoc insuficient pentru „${product.name}” — mai sunt disponibile doar ${product.stock} bucăți.`
        );
      }
      const unitPrice = product.salePrice ?? product.price;
      return { product, quantity: item.quantity, unitPrice };
    });

    const settings = await getStoreSettings();
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const shippingCost = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
    const total = subtotal + shippingCost;

    // Create the order BEFORE redirecting to Stripe, with full price snapshots.
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "NOUA",
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        county: customer.county,
        city: customer.city,
        subtotal,
        shippingCost,
        total,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            name: l.product.name,
            image: l.product.images[0] ?? "",
            price: l.unitPrice,
            quantity: l.quantity,
          })),
        },
      },
    });

    // Create the Stripe Checkout session (amounts are already in bani).
    const stripe = getStripe();
    const baseUrl = getBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "ro",
      currency: "ron",
      customer_email: customer.email,
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "ron",
          unit_amount: l.unitPrice,
          product_data: {
            name: l.product.name,
            ...(l.product.images[0] ? { images: [l.product.images[0]] } : {}),
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shippingCost === 0 ? "Livrare gratuită" : "Livrare prin curier",
            fixed_amount: { amount: shippingCost, currency: "ron" },
          },
        },
      ],
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      success_url: `${baseUrl}/comanda-confirmata?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?anulat=1`,
    });

    // Link the session to the order so the webhook + confirmation page can find it.
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[checkout] Eroare la crearea sesiunii de plată:", err);
    return NextResponse.json(
      { error: "Nu am putut iniția plata. Încearcă din nou în câteva momente." },
      { status: 500 }
    );
  }
}

/** Validation error surfaced to the customer with a friendly message. */
class CheckoutError extends Error {}
