import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    // Verify Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 },
      );
    }

    // Get and verify the authorization token (optional for payment verification)
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Token verification failed:', error);
        // Continue without user ID for guest verification
      }
    }

    // Parse request body
    const { sessionId, orderId }: {
      sessionId: string;
      orderId: string;
    } = await request.json();

    // Validate required fields
    if (!sessionId || !orderId) {
      return NextResponse.json(
        { error: 'Missing session ID or order ID' },
        { status: 400 },
      );
    }

    try {
      // Retrieve the Stripe session
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Invalid session ID' },
          { status: 400 },
        );
      }

      // Check if payment was successful
      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 },
        );
      }

      // Get the order from Firestore
      const orderDoc = await adminDb.collection('otw_orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 },
        );
      }

      const orderData = orderDoc.data();

      // Verify the session ID matches
      if (orderData?.stripeSessionId !== sessionId) {
        return NextResponse.json(
          { error: 'Session ID mismatch' },
          { status: 400 },
        );
      }

      // Update order status if payment is confirmed
      if (orderData?.paymentStatus !== 'paid') {
        const updateData = {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          updatedAt: new Date().toISOString(),
          stripePaymentIntentId: session.payment_intent,
          actualPrice: (session.amount_total || 0) / 100, // Convert from cents
          paymentCompletedAt: new Date().toISOString(),
        };

        // Update main order document
        await adminDb.collection('otw_orders').doc(orderId).update(updateData);

        // Update user's order record if user is authenticated
        if (orderData.userId) {
          await adminDb
            .collection('users')
            .doc(orderData.userId)
            .collection('otw_orders')
            .doc(orderId)
            .update({
              paymentStatus: 'paid',
              orderStatus: 'confirmed',
              updatedAt: new Date().toISOString(),
            });
        }

        console.log(`Payment verified and order updated: ${orderId}`);
      }

      // Return the updated order details
      const updatedOrderDoc = await adminDb.collection('otw_orders').doc(orderId).get();
      const updatedOrderData = updatedOrderDoc.data();

      return NextResponse.json({
        success: true,
        paymentStatus: session.payment_status,
        order: {
          orderId: updatedOrderData?.orderId,
          serviceDetails: updatedOrderData?.serviceDetails,
          customerInfo: updatedOrderData?.customerInfo,
          paymentStatus: updatedOrderData?.paymentStatus,
          orderStatus: updatedOrderData?.orderStatus,
          actualPrice: updatedOrderData?.actualPrice,
          createdAt: updatedOrderData?.createdAt,
          paymentCompletedAt: updatedOrderData?.paymentCompletedAt,
        },
      });
    } catch (stripeError) {
      console.error('Stripe verification error:', stripeError);
      return NextResponse.json(
        { error: 'Failed to verify payment with Stripe' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 },
  );
}