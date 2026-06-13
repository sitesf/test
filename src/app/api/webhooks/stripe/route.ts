import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the ONLY place where an order becomes "Plătită" and
 * stock is decremented. The event signature is verified with
 * STRIPE_WEBHOOK_SECRET, so forged requests are rejected.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET lipsește din variabilele de mediu.");
    return NextResponse.json({ error: "Webhook neconfigurat." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Lipsește semnătura Stripe." }, { status: 400 });
  }

  // The raw body is required for signature verification.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] Semnătură invalidă:", err);
    return NextResponse.json({ error: "Semnătură invalidă." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markOrderPaid(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          // Cancel only orders that never got paid.
          await prisma.order.updateMany({
            where: { id: orderId, status: "NOUA" },
            data: { status: "ANULATA" },
          });
        }
        break;
      }
      default:
        // Other events are acknowledged but ignored.
        break;
    }
  } catch (err) {
    console.error(`[webhook] Eroare la procesarea evenimentului ${event.type}:`, err);
    // 500 makes Stripe retry the event later.
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Marks the order as paid and decrements stock — idempotent: a second
 * delivery of the same event finds the order already PLATITA and is a no-op.
 */
async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn("[webhook] checkout.session.completed fără orderId în metadata.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status !== "NOUA") return;

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PLATITA",
        stripeSessionId: session.id,
        // Keep the email Stripe verified, if present.
        email: session.customer_details?.email ?? order.email,
      },
    });

    // Stock is decremented ONLY here, after payment confirmation.
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: Math.max(0, product.stock - item.quantity),
          popularity: product.popularity + item.quantity,
        },
      });
    }
  });
}
