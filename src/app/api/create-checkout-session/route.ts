import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { firestore } from '../../../lib/firebaseAdmin';
import { handleAPIError } from '../../../lib/utils/apiErrors';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Stripe environment variables are not set. Stripe functionality will be disabled.');
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    const { cart, userId } = await req.json() as {
      cart: { id: string, quantity: number }[],
      userId: string
    };
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Fetch menu items from Firestore
    const menuRef = firestore.collection('menuItems');
    const items = await Promise.all(
      cart.map(async ({ id, quantity }) => {
        const doc = await menuRef.doc(id).get();
        if (!doc.exists) throw new Error(`Menu item not found: ${id}`);
        const data = doc.data();
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: data.name,
              description: data.description,
              images: data.image ? [data.image] : [],
            },
            unit_amount: Math.round(data.price * 100),
          },
          quantity,
        };
      })
    );

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        userId: userId || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return handleAPIError(err);
  }
} 