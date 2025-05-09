import { NextRequest, NextResponse } from 'next/server';
import { stripe, constructEvent } from '../../../../lib/stripe';
import { firestore } from '../../../../lib/firebaseAdmin';
import { updateDeliveryStatus } from '../../../../lib/services/delivery';
import { handleAPIError } from '../../../../lib/utils/apiErrors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('Stripe environment variables are not set. Stripe functionality will be disabled.');
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event;
  try {
    event = constructEvent(rawBody, sig!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Handle delivery payment
        if (session.metadata?.type === 'delivery') {
          // Find the delivery request
          const deliveriesRef = firestore.collection('deliveries');
          const deliverySnap = await deliveriesRef
            .where('stripeSessionId', '==', session.id)
            .limit(1)
            .get();

          if (!deliverySnap.empty) {
            const deliveryDoc = deliverySnap.docs[0];
            await updateDeliveryStatus(deliveryDoc.id, 'paid');

            // Notify available drivers (implement your notification logic)
            await notifyDrivers(deliveryDoc.data());
          }
        }
        
        // Handle regular order payment
        else {
          const userId = session.metadata?.userId;
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          
          // Create order record
          const orderRef = firestore.collection('orders').doc();
          await orderRef.set({
            userId,
            items: lineItems.data.map(item => ({
              name: item.description,
              price: item.amount_total ? item.amount_total / 100 : 0,
              quantity: item.quantity || 1,
            })),
            total: session.amount_total ? session.amount_total / 100 : 0,
            status: 'paid',
            stripeSessionId: session.id,
            createdAt: new Date(),
          });

          // Update user rewards
          const rewardRef = firestore.collection('rewards').doc(userId);
          await rewardRef.set({
            spinsRemaining: firestore.FieldValue.increment(1),
            lastSpinTime: new Date(),
          }, { merge: true });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        // Handle failed delivery payment
        if (paymentIntent.metadata?.type === 'delivery') {
          const deliveriesRef = firestore.collection('deliveries');
          const deliverySnap = await deliveriesRef
            .where('stripeSessionId', '==', paymentIntent.metadata.sessionId)
            .limit(1)
            .get();

          if (!deliverySnap.empty) {
            const deliveryDoc = deliverySnap.docs[0];
            await updateDeliveryStatus(deliveryDoc.id, 'cancelled', {
              notes: 'Payment failed',
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        
        // Update order or delivery status for refunds
        if (charge.metadata?.type === 'delivery') {
          const deliveryId = charge.metadata.deliveryId;
          await updateDeliveryStatus(deliveryId, 'cancelled', {
            notes: 'Payment refunded',
          });
        } else {
          const orderRef = firestore.collection('orders').doc(charge.metadata?.orderId);
          await orderRef.update({
            status: 'refunded',
            refundedAt: new Date(),
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return handleAPIError(err);
  }
}

// Helper function to notify nearby drivers
async function notifyDrivers(delivery: any) {
  try {
    // Get available drivers within radius
    const driversRef = firestore.collection('drivers')
      .where('status', '==', 'available')
      .where('active', '==', true);
    
    const drivers = await driversRef.get();
    
    // Send notifications (implement your notification system)
    const notifications = drivers.docs.map(driver => ({
      userId: driver.id,
      type: 'new_delivery',
      data: {
        deliveryId: delivery.id,
        pickup: delivery.request.pickupAddress,
        dropoff: delivery.request.dropoffAddress,
        fee: delivery.estimate.fee,
      },
      createdAt: new Date(),
    }));

    if (notifications.length > 0) {
      const batch = firestore.batch();
      notifications.forEach(notification => {
        const notifRef = firestore.collection('notifications').doc();
        batch.set(notifRef, notification);
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('Error notifying drivers:', err);
  }
}