import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { buffer } from 'micro';
import type { NextApiRequest } from 'next';
import { prisma } from '../lib/db'  // Updated import path

// Client-side Stripe instance
export const getStripe = () => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true
});

export async function createPaymentIntent(amount: number, currency: string = "usd") {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return { clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw new Error("Payment initialization failed")
  }
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await prisma.payment.create({
        data: {
          stripeId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: "succeeded",
        },
      })
      break
    case "payment_intent.payment_failed":
      // Handle failed payment
      break
  }
}

export default stripe;

// Stripe webhook handler
export async function constructEvent(payload: string, sig: string) {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export async function createCheckoutSession({
  userId,
  items,
  metadata = {},
}: {
  userId: string
  items: Array<{
    price: number
    quantity: number
    name: string
    description?: string
  }>
  metadata?: Record<string, string>
}) {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description,
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }))

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    metadata: {
      userId,
      ...metadata,
    },
  })
}

export async function getSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId)
}

export async function listTransactions(userId: string, limit = 10) {
  const sessions = await stripe.checkout.sessions.list({
    limit,
    expand: ['data.line_items'],
  })
  return sessions.data.filter(session => session.metadata?.userId === userId)
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // Optional: partial refund if amount specified
  })
}