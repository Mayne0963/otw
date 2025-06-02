import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST - Handle Stripe webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log the webhook event
    await logWebhookEvent(event);

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// GET - Webhook endpoint info (for verification)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Stripe webhook endpoint",
    configured: !!endpointSecret,
    timestamp: new Date().toISOString()
  });
}

// Helper function to handle checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout session completed:', session.id);
    
    // Find the order by session ID
    const ordersQuery = query(
      collection(db, 'orders'),
      where('stripeSessionId', '==', session.id)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    if (ordersSnapshot.empty) {
      console.error('No order found for session:', session.id);
      return;
    }
    
    const orderDoc = ordersSnapshot.docs[0];
    const orderRef = doc(db, 'orders', orderDoc.id);
    
    // Update order status
    await updateDoc(orderRef, {
      paymentStatus: 'paid',
      stripePaymentIntentId: session.payment_intent,
      stripeCustomerId: session.customer,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Order updated successfully:', orderDoc.id);
    
    // Update user's order history and loyalty points if applicable
    const orderData = orderDoc.data();
    if (orderData?.userId) {
      await updateUserAfterPayment(orderData.userId, orderData.total || 0);
    }
    
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

// Helper function to handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment intent succeeded:', paymentIntent.id);
    
    // Find orders by payment intent ID
    const ordersQuery = query(
      collection(db, 'orders'),
      where('stripePaymentIntentId', '==', paymentIntent.id)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    for (const orderDoc of ordersSnapshot.docs) {
      const orderRef = doc(db, 'orders', orderDoc.id);
      
      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Update user loyalty points
      const orderData = orderDoc.data();
      if (orderData?.userId) {
        await updateUserAfterPayment(orderData.userId, orderData.total || 0);
      }
    }
    
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

// Helper function to handle payment intent failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment intent failed:', paymentIntent.id);
    
    // Find orders by payment intent ID
    const ordersQuery = query(
      collection(db, 'orders'),
      where('stripePaymentIntentId', '==', paymentIntent.id)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    for (const orderDoc of ordersSnapshot.docs) {
      const orderRef = doc(db, 'orders', orderDoc.id);
      
      await updateDoc(orderRef, {
        paymentStatus: 'payment_failed',
        paymentFailureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        updatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

// Helper function to handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Processing invoice payment succeeded:', invoice.id);
    
    // Handle subscription payments or other invoice-based payments
    if (invoice.subscription) {
      await handleSubscriptionPayment(invoice.subscription as string, 'paid');
    }
    
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Helper function to handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Processing invoice payment failed:', invoice.id);
    
    // Handle subscription payment failures
    if (invoice.subscription) {
      await handleSubscriptionPayment(invoice.subscription as string, 'payment_failed');
    }
    
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

// Helper function to handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription created:', subscription.id);
    
    // Find user by customer ID
    const usersQuery = query(
      collection(db, 'users'),
      where('stripeCustomerId', '==', subscription.customer)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      
      await updateDoc(userRef, {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        membershipTier: getMembershipTierFromSubscription(subscription),
        subscriptionStartDate: new Date(subscription.created * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Helper function to handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription updated:', subscription.id);
    
    // Find user by subscription ID
    const usersQuery = query(
      collection(db, 'users'),
      where('subscriptionId', '==', subscription.id)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      
      await updateDoc(userRef, {
        subscriptionStatus: subscription.status,
        membershipTier: getMembershipTierFromSubscription(subscription),
        updatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Helper function to handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription deleted:', subscription.id);
    
    // Find user by subscription ID
    const usersQuery = query(
      collection(db, 'users'),
      where('subscriptionId', '==', subscription.id)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      
      await updateDoc(userRef, {
        subscriptionStatus: 'canceled',
        membershipTier: 'basic',
        subscriptionEndDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Helper function to handle charge dispute created
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Processing charge dispute created:', dispute.id);
    
    // Find order by charge ID
    const ordersQuery = query(
      collection(db, 'orders'),
      where('stripeChargeId', '==', dispute.charge)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      const orderRef = doc(db, 'orders', orderDoc.id);
      
      await updateDoc(orderRef, {
        disputeId: dispute.id,
        disputeStatus: dispute.status,
        disputeReason: dispute.reason,
        disputeAmount: dispute.amount,
        disputeCreatedAt: new Date(dispute.created * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Notify admin about the dispute
      await addDoc(collection(db, 'admin_notifications'), {
        type: 'dispute_created',
        orderId: orderDoc.id,
        disputeId: dispute.id,
        amount: dispute.amount,
        reason: dispute.reason,
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    
  } catch (error) {
    console.error('Error handling charge dispute created:', error);
  }
}

// Helper function to update user after successful payment
async function updateUserAfterPayment(userId: string, amount: number) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentPoints = userData.loyaltyPoints || 0;
      const currentSpent = userData.totalSpent || 0;
      
      // Calculate loyalty points (1 point per dollar spent)
      const pointsEarned = Math.floor(amount);
      
      await updateDoc(userRef, {
        loyaltyPoints: currentPoints + pointsEarned,
        totalSpent: currentSpent + amount,
        lastOrderDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error updating user after payment:', error);
  }
}

// Helper function to handle subscription payments
async function handleSubscriptionPayment(subscriptionId: string, status: string) {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('subscriptionId', '==', subscriptionId)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userRef = doc(db, 'users', userDoc.id);
      
      const updateData: any = {
        subscriptionPaymentStatus: status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'paid') {
        updateData.lastPaymentDate = new Date().toISOString();
      }
      
      await updateDoc(userRef, updateData);
    }
    
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

// Helper function to get membership tier from subscription
function getMembershipTierFromSubscription(subscription: Stripe.Subscription): string {
  // This would depend on your pricing structure
  // You can check the price ID or product ID to determine the tier
  const priceId = subscription.items.data[0]?.price.id;
  
  // Example mapping - adjust based on your actual price IDs
  if (priceId?.includes('premium')) {
    return 'premium';
  } else if (priceId?.includes('pro')) {
    return 'pro';
  } else {
    return 'basic';
  }
}

// Helper function to log webhook events
async function logWebhookEvent(event: Stripe.Event) {
  try {
    await addDoc(collection(db, 'webhook_logs'), {
      eventId: event.id,
      eventType: event.type,
      processed: true,
      createdAt: new Date().toISOString(),
      data: {
        object: event.data.object.object,
        id: event.data.object.id
      }
    });
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

// PUT and DELETE methods not needed for webhooks
export async function PUT(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
