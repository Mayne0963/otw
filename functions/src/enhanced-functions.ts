/**
 * Enhanced Cloud Functions for Firebase MCP Integration
 * Includes HTTP triggers, background triggers, and scheduled functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { beforeUserCreated, beforeUserSignedIn } from 'firebase-functions/v2/identity';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Express app for HTTP functions
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ============================================================================
// HTTP TRIGGER FUNCTIONS
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Create order endpoint
app.post('/orders', async (req, res) => {
  try {
    const { userRef, restaurantId, items, deliveryAddress, specialInstructions } = req.body;
    
    // Validate required fields
    if (!userRef || !restaurantId || !items || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order document
    const orderData = {
      userRef,
      restaurantId,
      items,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress,
      specialInstructions: specialInstructions || '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const orderRef = await db.collection('orders').add(orderData);
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: orderRef.id,
        userId: userRef
      }
    });

    // Update order with payment intent ID
    await orderRef.update({ paymentIntentId: paymentIntent.id });

    res.status(201).json({
      orderId: orderRef.id,
      clientSecret: paymentIntent.client_secret,
      total
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user orders endpoint
app.get('/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, status } = req.query;

    let query = db.collection('orders')
      .where('userRef', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string));

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status endpoint
app.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = {
      status,
      updatedAt: admin.firestore.Timestamp.now()
    };

    if (status === 'delivered') {
      updateData.deliveredAt = admin.firestore.Timestamp.now();
    }

    await db.collection('orders').doc(orderId).update(updateData);

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export HTTP functions
exports.api = onRequest(app);

// ============================================================================
// CALLABLE FUNCTIONS
// ============================================================================

// Process screenshot order
exports.processScreenshotOrder = onCall(async (request) => {
  const { data, auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { screenshotUrl, deliveryAddress, notes } = data;

    // Create screenshot order
    const orderData = {
      customerInfo: {
        uid: auth.uid,
        name: auth.token.name || 'Unknown',
        email: auth.token.email || '',
        phone: auth.token.phone_number || ''
      },
      screenshotUrl,
      extractedItems: [], // Will be populated by AI processing
      estimatedTotal: 0,
      status: 'processing',
      paymentStatus: 'pending',
      deliveryAddress,
      notes: notes || '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const orderRef = await db.collection('screenshot_orders').add(orderData);

    // Trigger AI processing (this would call your AI service)
    // For now, we'll simulate with a timeout
    setTimeout(async () => {
      const mockExtractedItems = [
        { name: 'Burger', quantity: 2, estimatedPrice: 12.99, confidence: 0.95 },
        { name: 'Fries', quantity: 1, estimatedPrice: 4.99, confidence: 0.88 }
      ];
      const estimatedTotal = mockExtractedItems.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);

      await orderRef.update({
        extractedItems: mockExtractedItems,
        estimatedTotal,
        status: 'confirmed',
        processedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }, 5000);

    return { orderId: orderRef.id, message: 'Screenshot order created and processing started' };
  } catch (error) {
    console.error('Error processing screenshot order:', error);
    throw new HttpsError('internal', 'Failed to process screenshot order');
  }
});

// Get user analytics
exports.getUserAnalytics = onCall(async (request) => {
  const { auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Get user document
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data()!;

    // Get recent orders
    const ordersSnapshot = await db.collection('orders')
      .where('userRef', '==', auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentOrders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate monthly spending
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyOrdersSnapshot = await db.collection('orders')
      .where('userRef', '==', auth.uid)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .get();

    const monthlySpending = monthlyOrdersSnapshot.docs.reduce((sum, doc) => {
      const order = doc.data();
      return sum + (order.total || 0);
    }, 0);

    return {
      userStats: userData.stats,
      recentOrders,
      monthlySpending,
      monthlyOrderCount: monthlyOrdersSnapshot.size
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw new HttpsError('internal', 'Failed to get user analytics');
  }
});

// ============================================================================
// FIRESTORE TRIGGER FUNCTIONS
// ============================================================================

// User creation trigger
exports.onUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  const userData = event.data?.data();
  const userId = event.params.userId;

  if (!userData) return;

  try {
    // Send welcome email
    console.log(`Sending welcome email to user: ${userData.email}`);
    
    // Create user analytics document
    await db.collection('analytics').doc(`user_${userId}`).set({
      userId,
      signupDate: admin.firestore.Timestamp.now(),
      lastActive: admin.firestore.Timestamp.now(),
      sessionCount: 0,
      totalSpent: 0,
      orderCount: 0,
      createdAt: admin.firestore.Timestamp.now()
    });

    console.log(`User analytics created for: ${userId}`);
  } catch (error) {
    console.error('Error in onUserCreated:', error);
  }
});

// Order creation trigger
exports.onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const orderData = event.data?.data();
  const orderId = event.params.orderId;

  if (!orderData) return;

  try {
    // Send order confirmation notification
    const userDoc = await db.collection('users').doc(orderData.userRef).get();
    if (userDoc.exists) {
      const userData = userDoc.data()!;
      console.log(`Sending order confirmation to: ${userData.email}`);
      
      // Here you would integrate with your notification service
      // await sendOrderConfirmationEmail(userData.email, orderId, orderData);
    }

    // Update restaurant analytics
    const restaurantRef = db.collection('restaurant_analytics').doc(orderData.restaurantId);
    await restaurantRef.set({
      totalOrders: admin.firestore.FieldValue.increment(1),
      totalRevenue: admin.firestore.FieldValue.increment(orderData.total),
      lastOrderAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }, { merge: true });

    console.log(`Order created: ${orderId}`);
  } catch (error) {
    console.error('Error in onOrderCreated:', error);
  }
});

// Order status update trigger
exports.onOrderStatusUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  const orderId = event.params.orderId;

  if (!beforeData || !afterData) return;

  // Check if status changed
  if (beforeData.status !== afterData.status) {
    try {
      // Send status update notification
      const userDoc = await db.collection('users').doc(afterData.userRef).get();
      if (userDoc.exists) {
        const userData = userDoc.data()!;
        console.log(`Sending status update to: ${userData.email} - Status: ${afterData.status}`);
        
        // Here you would integrate with your notification service
        // await sendOrderStatusUpdateEmail(userData.email, orderId, afterData.status);
      }

      // If order is delivered, update user stats
      if (afterData.status === 'delivered' && beforeData.status !== 'delivered') {
        await db.collection('users').doc(afterData.userRef).update({
          'stats.totalOrders': admin.firestore.FieldValue.increment(1),
          'stats.totalSpent': admin.firestore.FieldValue.increment(afterData.total),
          'stats.lastOrderAt': admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
      }

      console.log(`Order status updated: ${orderId} - ${beforeData.status} -> ${afterData.status}`);
    } catch (error) {
      console.error('Error in onOrderStatusUpdated:', error);
    }
  }
});

// ============================================================================
// STORAGE TRIGGER FUNCTIONS
// ============================================================================

// Process uploaded screenshots
exports.onScreenshotUploaded = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  const contentType = event.data.contentType;

  // Only process image files in screenshots folder
  if (!filePath.startsWith('screenshots/') || !contentType?.startsWith('image/')) {
    return;
  }

  try {
    console.log(`Processing uploaded screenshot: ${filePath}`);

    // Here you would integrate with your AI service to extract menu items
    // For now, we'll simulate the processing
    
    // Generate thumbnail
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    // Create thumbnail (simplified - in production you'd use Sharp or similar)
    const thumbnailPath = filePath.replace('screenshots/', 'thumbnails/').replace(/\.[^.]+$/, '_thumb.jpg');
    
    console.log(`Generated thumbnail: ${thumbnailPath}`);
    
    // Update the corresponding screenshot order with processing status
    const ordersSnapshot = await db.collection('screenshot_orders')
      .where('screenshotUrl', '==', `gs://${event.data.bucket}/${filePath}`)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        status: 'processing',
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error processing screenshot:', error);
  }
});

// ============================================================================
// SCHEDULED FUNCTIONS
// ============================================================================

// Daily analytics report
exports.generateDailyReport = onSchedule('0 2 * * *', async (event) => {
  try {
    console.log('Generating daily analytics report...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get yesterday's orders
    const ordersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
      .get();

    const orders = ordersSnapshot.docs.map(doc => doc.data());
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get new users
    const usersSnapshot = await db.collection('users')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
      .get();

    const newUsers = usersSnapshot.size;

    // Save daily report
    const reportData = {
      date: admin.firestore.Timestamp.fromDate(yesterday),
      totalRevenue,
      totalOrders,
      averageOrderValue,
      newUsers,
      createdAt: admin.firestore.Timestamp.now()
    };

    await db.collection('daily_reports').add(reportData);

    console.log('Daily report generated:', reportData);
  } catch (error) {
    console.error('Error generating daily report:', error);
  }
});

// Weekly cleanup
exports.weeklyCleanup = onSchedule('0 3 * * 0', async (event) => {
  try {
    console.log('Running weekly cleanup...');

    // Delete old temporary files
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Clean up old analytics events
    const oldEventsSnapshot = await db.collection('analytics_events')
      .where('createdAt', '<', admin.firestore.Timestamp.fromDate(oneWeekAgo))
      .limit(500)
      .get();

    const batch = db.batch();
    oldEventsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Cleaned up ${oldEventsSnapshot.size} old analytics events`);
  } catch (error) {
    console.error('Error in weekly cleanup:', error);
  }
});

// ============================================================================
// AUTHENTICATION TRIGGER FUNCTIONS
// ============================================================================

// Before user creation
exports.beforeUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;
  
  // Validate email domain (example)
  if (user.email && user.email.endsWith('@blocked-domain.com')) {
    throw new HttpsError('invalid-argument', 'Email domain not allowed');
  }

  // Set custom claims
  return {
    customClaims: {
      role: 'user',
      createdAt: new Date().toISOString()
    }
  };
});

// Before user sign in
exports.beforeUserSignedIn = beforeUserSignedIn(async (event) => {
  const user = event.data;
  
  // Check if user is blocked
  if (user.customClaims?.blocked) {
    throw new HttpsError('permission-denied', 'User account is blocked');
  }

  // Update last sign in analytics
  if (user.uid) {
    await db.collection('analytics').doc(`user_${user.uid}`).update({
      lastActive: admin.firestore.Timestamp.now(),
      sessionCount: admin.firestore.FieldValue.increment(1)
    });
  }
});

// ============================================================================
// WEBHOOK FUNCTIONS
// ============================================================================

// Stripe webhook handler
exports.stripeWebhook = onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            paymentStatus: 'paid',
            status: 'confirmed',
            updatedAt: admin.firestore.Timestamp.now()
          });
          console.log(`Payment succeeded for order: ${orderId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;
        
        if (failedOrderId) {
          await db.collection('orders').doc(failedOrderId).update({
            paymentStatus: 'failed',
            updatedAt: admin.firestore.Timestamp.now()
          });
          console.log(`Payment failed for order: ${failedOrderId}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});